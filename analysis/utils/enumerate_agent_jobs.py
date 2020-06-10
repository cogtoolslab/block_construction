
import os
import numpy as np

proj_dir = os.path.abspath('..')
results_dir = os.path.join(proj_dir,'results')
csv_dir = os.path.join(results_dir,'csv')

if not os.path.exists(csv_dir):
    os.makedirs(csv_dir)   

agent_results_dir = os.path.join(csv_dir,'agent_results/1000')

total = 1000

if __name__ == "__main__":

    ## which have already been run?
    
    if len(os.listdir(agent_results_dir))!=total:
        
        print('Results dir is: {}'.format(agent_results_dir))

        completed_inds = np.array([(i.split('_')[-1].split('.')[0]) for i in os.listdir(agent_results_dir)]).astype(int)
        
        highest = max(completed_inds)
        print('highest',highest)
        print('completed',list(completed_inds))

        ## which still need to be run
        still_to_run = [i for i in np.arange(0,total) if i not in completed_inds]
        print('These still yet to run: {}'.format(still_to_run))

#         ## identify how many different new RSA.py calls to make
#         ## by getting list of straggler lower bounds
#         straggler_lb = np.where(np.diff(still_to_run) !=2)[0]
#         if len(straggler_lb)==0:
#             print 'No stragglers, run them all.'

        if len(still_to_run)>0:

            ## go through and run RSA.py for earliest to latest in list of still to run
            lb = still_to_run[0]
#             ub = still_to_run[-1]
#             print 'Lower bound: {} Upper bound: {}'.format(lb, ub)
#             cmd_string = 'python multithread_random_agent_wrapper.py --niter 105 --suffix test --nthread 16'.format()
#             cmd_string = 'python RSA.py --wppl BDA-enumerate --sim_scaling_lb {} --sim_scaling_ub {} --step_size 2 --split_type {}'.format(lb, ub, which_split)
#             print 'Running: {}'.format(cmd_string)
#             os.system(cmd_string)

        else:

            print('No more left to run, you should be all set.')

    else:
        print('There is more than one dir in enumerateOutput. This (barebones) script designed to handle case where there is only one dir in enumerateOutput to patch.')
