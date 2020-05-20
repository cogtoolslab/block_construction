import pandas as pd
import numpy as np
import os
import _thread as thread
import analysis_helpers as h

'''
This script multithread_agent_wrapper.py is a wrapper around block_random_agent.py
to generate csv files for multiple batches.
Each batch iterates through all agents
'''

if __name__ == "__main__":
    
    import argparse
    parser = argparse.ArgumentParser()

    parser.add_argument('--niter', type=int, 
                                   help='how many iterations in each batch?', \
                                   default=10)
    
    parser.add_argument('--nbatches', type=int, 
                                   help='how many batches per iteration?', \
                                   default=10)
    
    parser.add_argument('--nthread', type=int, 
                                   help='how many threads?', \
                                   default=10)
    
    parser.add_argument('--suffix', type=str, 
                                   help='add suffix', \
                                   default='')
    args = parser.parse_args()
    
    
    thread_suffixes = ['thread_' + str(i) + args.suffix for i in range(0, args.nthread)]

    print('Now running ...')
    for thread_suffix in thread_suffixes:
        cmd_string = 'python block_random_agent.py --niter {} --suffix {} --nbatch {}'.format(args.niter, thread_suffix, args.nbatches)
        print(cmd_string)
        thread.start_new_thread(os.system,(cmd_string,))
    print('done!')