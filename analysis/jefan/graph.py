import os
import sys
import urllib, io
os.getcwd()
sys.path.append("..")
sys.path.append("../utils")
proj_dir = os.path.abspath('../..')

if os.path.join(proj_dir,'stimuli') not in sys.path:
    sys.path.append(os.path.join(proj_dir,'stimuli'))

import numpy as np
import scipy.stats as stats
import pandas as pd
from scipy.spatial import distance
from scipy import ndimage
from random import random
from sklearn.cluster import SpectralBiclustering
import itertools

import pymongo as pm
from collections import Counter
import json
import re
import ast

from PIL import Image, ImageOps, ImageDraw, ImageFont 

from io import BytesIO
import base64

import  matplotlib
from matplotlib import pylab, mlab, pyplot
from IPython.core.pylabtools import figsize, getfigs
plt = pyplot
import matplotlib as mpl
mpl.rcParams['pdf.fonttype'] = 42
from matplotlib import colors

import seaborn as sns
sns.set_context('talk')
sns.set_style('darkgrid')

from IPython.display import clear_output

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message="numpy.dtype size changed")
warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

import blockworld_helpers as utils
import drawing_utils as drawing
import importlib
import scoring
import rda

#from pyvis.network import Network
import networkx as nx
import plotly.graph_objects as go

import plotly
import plotly.io as pio
pio.orca.config.use_xvfb = True
plotly.io.orca.config.save()


#### GLOBAL VARS
targets = ['hand_selected_004', 'hand_selected_005', 'hand_selected_006',
       'hand_selected_008', 'hand_selected_009', 'hand_selected_011',
       'hand_selected_012', 'hand_selected_016']

### MINOR UTILS
def convert_to_str(flat_world):
    s = [str(i) for i in list(flat_world)] 
    res = "".join(s)
    return res

### MAJOR UTILS 
class GenericNode:
    '''
    Represents a world state (as defined by discrete bitmap representation of blocks present, 
        as opposed to individual block dimensions and locations).
    Each Node can have multiple children.
    '''
    
    def __init__(self, discrete_world, f1_score):
        self.out_edges = [] #list of edges (child, ppt, rep)
        self.discrete_world = discrete_world 
        self.world_str = convert_to_str(discrete_world)
        #self.world_size = np.sum(flat_world) #shouldn't be needed in this
        self.f1_score = f1_score
        self.visits = 1
        #self.children = []
        self.child_edges = {}
        
        #self.y = np.round(self.f1_score*2, decimals=1)/2
        self.y = self.f1_score
        
        #self.x = np.sum(discrete_world)
        
        
        # consider only upper portion of structure
        # get proportion of world covered by blocks
        num_squares = np.sum(discrete_world)
        
        if num_squares > 0:
            proportion_filled = num_squares/64 #proportion of grid-world (8x8) filled
        else:
            proportion_filled = 0
        
        # calculate center of mass above that value (minus one, rounded down)
        condsider_mass_above = int(np.max([np.round(8*proportion_filled) - 1, 0]))
        
        self.x = ndimage.measurements.center_of_mass(discrete_world[:,condsider_mass_above:])[0]
        
        if np.isnan(self.x):
            self.x = 8.5
        
    def __str__(self):
        return('Node of size ' + str(self.world_size))
    
    def __repr__(self):
        return('Node of size ' + str(self.world_size))

    #def get_ppts(self):
        #self.out_edges.m
        
    def add_child(self, node):
        
        if node.world_str in self.child_edges.keys():
            self.child_edges[node.world_str].visit()
        else: 
            new_edge = GenericEdge(self, node)
            self.child_edges[node.world_str] = new_edge
            self.out_edges.append(new_edge) 
    
    def visit(self):
        self.visits +=1    

class GenericEdge:
    '''
    Edges contain child nodes, as well as the (ppt, repetition) pair that 
        uniquely defines a building path in the experiment (for one structure)
    '''
    def __init__(self, source, target):
        self.source = source
        self.target = target
        self.visits = 1
        
    def __str__(self):
        return('Block ' + str(self.block_num) + ', ppt: ' + self.ppt + ', rep: ' + str(self.rep))
    
    def __repr__(self):
        return('Block ' + str(self.block_num) + ', ppt: ' + self.ppt + ', rep: ' + str(self.rep))
    
    def visit(self):
        self.visits +=1
        
        
class GenericWorldLayer:
    '''
    In previous iterations of graph this was used to group nodes by y-axis.
    Now here to allow faster access to nodes 
    '''
    def __init__(self, num_squares):
        self.num_squares = num_squares
        self.nodes = {}
        
    def __str__(self):
        return(str(len(self.nodes)) + ' nodes in layer')
    
    def __repr__(self):
        return(str(len(self.nodes)) + ' nodes in layer')
    
    def get_world_node(self, discrete_world, f1_score):
        '''
        add world state into layer
        if already exists, then returns the existing node.
        otherwise, creates new node and returns it
        
        '''
        world_str = convert_to_str(discrete_world)
        if world_str in self.nodes:
            existing_node = self.nodes[world_str]
            existing_node.visit()
            assert existing_node.f1_score == f1_score
            return existing_node
        else:
            new_node = GenericNode(discrete_world, f1_score)
            self.nodes[world_str] = new_node
            return new_node
        
class GenericBuildGraph:
    def __init__(self, target_name='no_target_name_given'):
        self.target_name = target_name
        self.world_layers = {} #dict.fromkeys(range(0, 80, 2))
        self.world_layers[0] = GenericWorldLayer(0) # layers to allow quick indexing of world state
        
        # Add layer for every multiple of two, or add manually?
        
        self.root = self.world_layers[0].get_world_node(np.zeros((18,13)).astype(int), 0) # start with one node with empty world
        self.prev_node = self.root
        
        
    def __str__(self):
        return('Tree for ' + self.target_name + ': \n' + str(self.root) + '\nLayers: ' + str(self.world_layers))
    
    def add_block_placement(self, row):
        #r :discrete_world, discrete_world_str, ppt, rep, block_num
        
        # fetch correct node (or create new one)
        world_squares = np.sum(row.flatDiscreteWorld)
        if not(world_squares in self.world_layers): #if layer doesn't exist, add layer
            self.world_layers[world_squares] = GenericWorldLayer(world_squares)
            
        # get node for this world state (if exists)
        layer = self.world_layers[world_squares]
        new_node = layer.get_world_node(row.discreteWorld, row.rawF1DiscreteScore)
        
        # link previous nodes to current node
        self.prev_node.add_child(new_node)
        self.prev_node = new_node
        
    def reset_prev_node(self):
        '''
        Reset pointer to previous node
        '''
        self.prev_node = self.root
        
        #print(discrete_world, discrete_world_str, ppt, rep)
        
    def add_build_path(self, df):
        '''
        adds series of block placements from dataframe (for one build sequence) to the tree
        '''
        self.root.visit()
        
        df.apply(lambda row: self.add_block_placement(row), axis=1)
#         df.apply(lambda r: self.add_block_placement(r.flatDiscreteWorld,
#                                         r.flatDiscreteWorldStr,
#                                         r.gameID,
#                                         r.repetition,
#                                         r.blockNum), axis=1)
        self.reset_prev_node()
        
    def get_coords(self):
        node_xs = []
        node_ys = []
        node_sizes = []
        edge_xs = []
        edge_ys = []
        edge_ws = []
        
        for i, (k1, layer) in enumerate(self.world_layers.items()):
            for j, (k2, node) in enumerate(layer.nodes.items()):
                #n_x = (j+1)/(len(layer.nodes)+1) #12 should be max width
                n_y = node.y
                n_x = node.x
                n_size = node.visits
                #node.y = n_y
                node_xs.append(n_x)
                node_ys.append(n_y)
                node_sizes.append(n_size)
        
        for i, (k1, layer) in enumerate(self.world_layers.items()):
            for j, (k2, node) in enumerate(layer.nodes.items()):
                parent_x = node.x
                parent_y = node.y
                for _, e in enumerate(node.out_edges):
                    child_y = e.target.y
                    child_x = e.target.x
                    edge_xs.append(parent_x)
                    edge_xs.append(child_x)
                    #edge_xs.append(None)
                    edge_ys.append(parent_y)
                    edge_ys.append(child_y)
                    #edge_ys.append(None)
                    edge_ws.append(e.visits)
                    #edge_ws.append(0)
                
        return (node_xs, node_ys, edge_xs, edge_ys, node_sizes, edge_ws)
    
def plot_trajectory_graph(data = [],
                          target = 'hand_selected_004', 
                          phase = 'pre', 
                          save=False, 
                          extension = ''):
    '''
    makes F1 world state trajectory graph for specific target structure and phase    
    '''
    
    # check to make sure data was passed in
    if len(data)==0:
        raise Exception('No data was passed in! Please pass in data.')
    
    # Create graph
    t = GenericBuildGraph() # make new tree

    a = data[(data.targetName==target) & (data.phase_extended==phase)]
    a = a.groupby('gameID')
    a.apply(lambda g: t.add_build_path(g))
    
    ### EXTRACT DATA VALS
    node_xs, node_ys, edge_xs, edge_ys, node_sizes, edge_ws  = t.get_coords()
    
    ### HACKY POSTPROCESSING
    node_sizes = [i * 0.8 for i in node_sizes]
    ## pretty structure names
    pretty_names = ['structure {}'.format(i+1) for i in np.arange(len(targets))]
    hs2pn = dict(zip(targets,pretty_names))   
    ## opacity dictionary
    O = {1:0.1, 2: 0.3, 3:0.5, 4: 0.7}

    def make_edge(x, y, width):
        return  go.Scatter(
                    x=x,
                    y=y,
                    line=dict(width=width),
                    hoverinfo='none',
                    mode='lines')

    def make_edges(edge_xs, edge_ys, edge_ws):

        edge_trace = []
        for i in range(0, int(len(edge_xs)/2)):
            edge_trace.append(
                go.Scatter(
                        x=(edge_xs[i*2],edge_xs[i*2+1]),
                        y=(edge_ys[i*2],edge_ys[i*2+1]),
                        line=dict(width=edge_ws[i]*0.8,
                                  color='#2e2e2e'),
                        opacity= O[edge_ws[i]] if edge_ws[i] in O.keys() else 0.95,
                        hoverinfo='none',
                        mode='lines'))

        return edge_trace

    ### MAKE EDGES
    edge_trace = make_edges(edge_xs, edge_ys, edge_ws)

    ### MAKE NODES
    node_trace = go.Scatter(
        x=node_xs, y=node_ys,
        mode='markers',
        hoverinfo='text',
        marker=dict(
            colorscale='Greys',            
            reversescale=True,
            size = node_sizes,
            color = '#2e2e2e',
            opacity = 1.,
            line_width=0,
            line_color='#FFF'))
    
    ### LEFT / RIGHT BOUNDS
    padding = 0
    midpt = np.mean(node_xs)
    lb = np.min(node_xs) - padding
    ub = np.max(node_xs) + padding
    lb = 4 # hardcoded
    ub = 13 # hardcoded
    
    
    ### FIGURE DEFINITION
    fig = go.Figure(data=edge_trace + [node_trace],
                 layout=go.Layout(
                    title='<br>  ' + str(hs2pn[target]) + ' | ' + str(phase),
                    titlefont_size=24,
                    showlegend=False,
                    hovermode='closest',
                    margin=dict(b=20,l=5,r=5,t=40),
                    annotations=[ dict(
                        text="",
                        showarrow=False,
                        xref="paper", yref="paper",
                        x=0.005, y=-0.002 ) ],
                    xaxis={'range':[lb,ub], 'showgrid': False, 'zeroline': True, 'visible': False},
                    yaxis={'range':[-0.1,1.05], 'showgrid': False})
                    )

    ### FIG DIMENSIONS AND THEME
    fig.update_layout(
        width=600,
        height=400,
        template='simple_white'
    )
    
    ### HORIZONTAL REF LINES
    fig.add_shape(type='line',x0=lb, y0=1, x1=ub, y1=1,
                  line={'color':'black','width':1, 'dash':'dot'})  
    fig.add_shape(type='line',x0=lb, y0=0, x1=ub, y1=0,
                  line={'color':'black','width':1, 'dash':'dot'})      
    
    fig.show()
    
    if save:
        plot_dir = "plot_exports"
        
        if not os.path.exists(plot_dir):
            os.mkdir(plot_dir)
    
        plot_path =  os.path.join(plot_dir, (target_name + '_' + phase + '_' + extension +'.pdf'))
        fig.write_image(plot_path)
            