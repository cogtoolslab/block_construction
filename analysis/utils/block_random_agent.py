from __future__ import division

import numpy as np
import os, sys
from PIL import Image
from os import listdir
from os.path import isfile, join
import urllib, io
os.getcwd()
sys.path.append("..")
sys.path.append("../utils")
proj_dir = os.path.abspath('../..')

import random

from scipy.stats import norm
from IPython.display import clear_output

import pandas as pd
import json

import copy

### Add Paths

## root paths
curr_dir = os.getcwd()
proj_dir = os.path.abspath(os.path.join(curr_dir,'..','..')) ## use relative paths

## add helpers to python path
import sys
if os.path.join(proj_dir, 'stimuli') not in sys.path:
    sys.path.append(os.path.join(proj_dir, 'stimuli'))

## custom helper modules
import separation_axis_theorem as sat
#import blockworld_helpers as utils
#import display_world as stability #may want to make a separate module for stability

def cls():
    os.system('cls' if os.name=='nt' else 'clear')

import scoring
    
    
## directory & file hierarchy
proj_dir = os.path.abspath('..')
datavol_dir = os.path.join(proj_dir,'data')
analysis_dir = os.path.abspath(os.path.join(os.getcwd(),'..'))
results_dir = os.path.join(proj_dir,'results')
plot_dir = os.path.join(results_dir,'plots')
csv_dir = os.path.join(results_dir,'csv')
json_dir = os.path.join(results_dir,'json')
exp_dir = os.path.abspath(os.path.join(proj_dir,'experiments'))
png_dir = os.path.abspath(os.path.join(datavol_dir,'png'))

## add helpers to python path
if os.path.join(proj_dir,'stimuli') not in sys.path:
    sys.path.append(os.path.join(proj_dir,'stimuli'))

if not os.path.exists(csv_dir):
    os.makedirs(csv_dir)   
    
agent_results_dir = os.path.abspath(os.path.join(csv_dir,'agent_results'))

#### Target maps: grab the bitmap representation of each stim

targets = ['hand_selected_004', 'hand_selected_005', 'hand_selected_006',
       'hand_selected_008', 'hand_selected_009', 'hand_selected_011',
       'hand_selected_012', 'hand_selected_016']

target_maps = {}

with open(os.path.abspath('../results/csv/targetMaps.txt')) as json_file:
    target_maps = json.load(json_file)
    

def check_overlap(x,y,w,h,world, mode='inside'):
    overlaps = False
    
    if mode == 'inside':
        overlaps = np.all(world[x:(x+w),y:(y+h)])
    elif mode == 'outside':
        overlaps = ~np.any(world[x:(x+w),y:(y+h)])
    else:
        return
    
    return overlaps

def check_stability(x,y,w,h,world):
    '''
    checks to see if block would be supported without falling using heuristics.
    Does not allow side-supported blocks, which are sometimes possible in the real experiments
    '''
    
#     if ((w==4) & (y==2) & (x==8)):
#         print(np.rot90(world.astype(int)))
    
    if y == 0: #if on the floor then will be stable
        return True
    else: #if greater than 1/2 of the block is supported then stable
        support = world[x:(x+w),y-1:y].astype(int)
        if np.sum(support) > w/2:
            return True
        # supports on both sides of long block
        elif (w == 4):
            left_sum = sum(world[x:(x+2),y-1:y].astype(int))
            right_sum = sum(world[x+2:(x+w),y-1:y].astype(int))
            if ((left_sum>= 1) & (right_sum >= 1)):                
                return True
            else: return False
        else:
              return False

def find_positions(world, block, x_offset = 5):
    '''
    finds all places where some part of the block is supported underneath
    and no parts of the base intersect with the current structure
    '''
    
    positions = []
    
    for i in range(world.shape[0]-block['width']+1):
            if (~np.any(world[i:i+block['width'],0])):
                positions.append({'x': i + x_offset,
                                  'y': 0})
                
    for j in range(1,world.shape[1]-block['height']+1):
        for i in range(world.shape[0]-block['width']+1):
            if ((~np.any(world[i:i+block['width'],j])) & np.any(world[i:i+block['width'],j-1])):
                positions.append({'x': i + x_offset,
                                  'y': j})
    return positions
                
    

def run_agent(targets, 
        niter, 
        verbose = False, 
        provide_actual_target=False,
           block_dims = [{'width':1,
                       'height':2},
                      {'width':2,
                       'height':1},
                      {'width':2,
                       'height':2},
                      {'width':2,
                       'height':4},
                      {'width':4,
                       'height':2}],
       world_bounds = {'left': 5,
                    'right': 13}):
    '''
    runs random agent on list of targets niter times for each target
    '''
    
    #block_dims.reverse()
    
    columns = ['targetName','run','blockNum','discreteWorld','perfect','x','y','w','h']

    df = pd.DataFrame(columns=columns)
    
    for target in targets:
        print('running '+ target)

        if provide_actual_target:
            target_map = target
        else:
            target_map = np.logical_not(np.array(target_maps[target]))

        for run in range(0,niter):
            
            discrete_world = np.zeros([18,13]).astype(bool)

            block_num = 0
            completed = False
            tested_all_blocks = False

            while (~completed & ~tested_all_blocks):

                placed = False

                random.shuffle(block_dims)

                b = 0
                while((b < len(block_dims)) & ~placed): #keep trying blocks until placed or none left

                    #select next block from shuffled list
                    block = block_dims[b]
                    if verbose: print(" "*0,'block:', block)

                    # position-centric
                    # enumerate all positions for that block
                    positions = find_positions(discrete_world[world_bounds['left']:world_bounds['right'],0:8], block, x_offset=5)
                    if verbose: print(positions)

                    random.shuffle(positions) # shuffle positions
                    p = 0

                    while(~placed & (p < len(positions))): #keep trying positions until placed or none left
                        position = positions[p]
                        if verbose: print(" "*4,'position:', position)

                        x_loc = position['x']
                        y_loc = position['y']

                        # check if valid location
                        # check if in silhouette
                        within_silhouette = check_overlap(x_loc,
                                                          y_loc,block['width'],
                                                          block['height'], 
                                                          target_map, 
                                                          mode = 'inside')
                        if verbose: print(" "*4,'within silhouette:', within_silhouette)

                        if within_silhouette:
                             # check if free in current world
                            free_space = check_overlap(x_loc,
                                                       y_loc,
                                                       block['width'],
                                                       block['height'], 
                                                       discrete_world,
                                                       mode = 'outside')
                            
                            if verbose: print(" "*5,'free space:', free_space)

                            if free_space:

                                # check stability
                                stable = check_stability(x_loc, y_loc, block['width'], block['height'], discrete_world)
                                if verbose: print(" "*6,'stable:', stable)

                                #if added:
                                if stable:
                                    # add to world
                                    discrete_world[x_loc:x_loc+block['width'],y_loc:y_loc+block['height']] = 1
                                    completed = np.all(np.equal(discrete_world,target_map))
                                    df = df.append({'targetName': str(target),
                                                   'run': run,
                                                   'blockNum': block_num,
                                                   'discreteWorld':discrete_world.copy(),
                                                   'perfect':completed,
                                                   'x':x_loc,
                                                   'y':y_loc,
                                                   'w':block['width'],
                                                   'h':block['height']}, ignore_index=True)
                                    if verbose: print(np.rot90(discrete_world.astype(int)))
                                    placed = True
                                    
                                    if (completed & verbose):
                                        print('completed structure!')
                                    block_num += 1
                                else:
                                    p += 1 # check next position
                            else:
                                p += 1 # check next position
                        else:
                            p += 1 # check next position

                    if(p == len(positions)): # if no positions work
                        b += 1 # check next block

                if b == len(block_dims):
                    if verbose: print('no viable blocks- giving up')
                    tested_all_blocks = True
                    
                    
    out_path = os.path.join(agent_results_dir,'block_silhouette_initial_random_agent_' + str(niter) + '.csv')
    df.to_csv(out_path)
    print('done!')
    

    
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()

    parser.add_argument('--niter', type=int, 
                                   help='how many iterations for each target?', \
                                   default=1)
    args = parser.parse_args()
    
    
    run_agent(targets,args.niter,verbose=False)