import os
import pandas as pd
import numpy as np
from scipy.optimize import linear_sum_assignment
from scipy.spatial import distance
from IPython.display import clear_output
from itertools import combinations
import multiprocessing as mp
import logging
import argparse
import time

'''
This script will compare action sequences between participants taken on the same structure, within a phase

see in block_silhouette_sequences.ipynb
- input to that, is dfa:
- see this function: get_aggregate_distances_btw_ppts: takes as input df_structure, which contains action sequences for all participants for a given structure, in a given phase, i.e., the groups in this: groupby(['targetName','phase_extended']

'''

### GLOBAL VARS AND DICTS
targets = ['hand_selected_004', 'hand_selected_005', 'hand_selected_006',
       'hand_selected_008', 'hand_selected_009', 'hand_selected_011',
       'hand_selected_012', 'hand_selected_016']
prettyTarg = dict(zip(sorted(targets), [i.split('_')[-1] for i in sorted(targets)]))
prettyPhase = {'pre':1, 'repetition 1': 2, 'repetition 2': 3, 'post': 4}

### GENERAL HELPERS

def make_dir_if_not_exists(dir_name):   
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
    return dir_name

def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]

### SPECIALIZED HELPERS        
        
def optimal_sort(distance_matrix):
    optimal_assignment = linear_sum_assignment(distance_matrix)[1]
    sorted_matrix = distance_matrix[:, optimal_assignment]
    return sorted_matrix

def get_distance_matrix(A,B,distance_measure=distance.euclidean, truncating = True):
    '''
    Returns distance matrix truncated to shortest sequence
    '''

    # truncate to length of smaller set of actions
    n_actions = min(len(A),len(B))

    if truncating:
        A = A.iloc[0:n_actions]
        B = B.iloc[0:n_actions]
        
    start = time.time()     
    AB = pd.concat([A[['x','y','w','h']], B[['x','y','w','h']]], axis=0)
    fullmat = distance.pdist(AB, metric='euclidean')
    ABmat = distance.squareform(fullmat)[:n_actions,n_actions:]
    end = time.time()
    elapsed = end-start     
        
    return ABmat

def compute_transformed_distance(I, J):
    return np.mean(np.diag(optimal_sort(get_distance_matrix(I,J))))

def get_aggregate_distances_btw_ppts(B, out_path, distance_measure=distance.euclidean):
    '''
    Group is a dataframe (usually groupby of targetName and gameID)
    distance_measure is the distance between action vectors [x,y,w,h]
    
    Returns the variance between participants for a given structure and phase
    '''
    ## get phase dists
    start = time.time()
    combos = list(combinations(B.gameID.unique(),2))    
    phase_dists = [compute_transformed_distance(B[B['gameID']==i], B[B['gameID']==j]) for (i, j) in combos]    
    end = time.time()
    elapsed = end - start
    print('Analyzing optimal distance for {} | {} sec.'.format(B['target_phase_condition'].unique()[0], np.round(elapsed,3)))    
        
    ## calculate variance
    sum_sq_diffs = np.sum(np.square(phase_dists))
    var = sum_sq_diffs/(B['gameID'].nunique()**2)
    
    ## create df
    df = pd.DataFrame([B['target_phase_condition'].unique()[0], var]).transpose()
    df.columns = ['target_phase_condition', 'var']
    
    ## save out to file
    with open(out_path, 'a') as f:
        df.to_csv(f, mode='a', header=f.tell()==0)
    
    return var

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--in_path', type=str, 
                        help='input csv', default='../results/csv/block_silhouette_Exp2Pilot3_all_dfa.csv')
    parser.add_argument('--batch_dir', type=str,
                        help='where to save action batches', default='../results/csv/action_batches')
    parser.add_argument('--out_path', type=str, 
                        help='output file', default='../results/csv/block_silhouette_Exp2Pilot3_transformedActionDistances.csv')    
    args = parser.parse_args()
    
    ## load in CSV
    D = pd.read_csv(args.in_path)
                                           
    ## assign unique target-phase-condition identifiers
    D = (D.assign(target_phase_condition = D.apply(lambda x: 
        '{}_{}_{}'.format(prettyTarg[x['targetName']], prettyPhase[x['phase_extended']], x['condition']),axis=1)))
                        
    ## set up batching system
    dir_name = make_dir_if_not_exists(args.batch_dir)

    ## divide CSV data into batches to ease parallelization
    tpc_ids = D.target_phase_condition.unique()
    for i, curr_batch in enumerate(tpc_ids):
        t = D[D['target_phase_condition']==curr_batch]
        target = t['target_phase_condition'].unique()[0].split('_')[0]
        phase = t['target_phase_condition'].unique()[0].split('_')[1]
        cond = t['target_phase_condition'].unique()[0].split('_')[2]                        
        out_path = os.path.join(args.batch_dir,'actions_target-{}_phase-{}_cond-{}.csv'.format(target, phase, cond))
        t.to_csv(out_path, index=False)
        print('Saved batch to {}'.format(out_path))
        clear_output(wait=True)
    print('Done! Saved {} batches in total.'.format(i))    
    
    ## Group by phase and targetName, apply spatial-distance measure and aggregate by taking mean of the diagonal
    tpc_batches = [os.path.join(os.path.abspath(args.batch_dir),batch) for batch in os.listdir(args.batch_dir)]    
    jobs = []
    for batch_ind, batch in enumerate(tpc_batches):
        B = pd.read_csv(batch)
        logger = mp.get_logger()
        logger.setLevel(logging.INFO)                  
        p = mp.Process(target=get_aggregate_distances_btw_ppts, args=(B,args.out_path,))
        jobs.append(p)
        p.start()
        
