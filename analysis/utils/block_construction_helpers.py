import os
import sys
import urllib, io
os.getcwd()
sys.path.append("..")

from os import listdir
from os.path import isfile, join

import numpy as np
import scipy.stats as stats
import pandas as pd
from random import random

from collections import Counter
import json
import re
import ast

from PIL import Image, ImageOps, ImageDraw, ImageFont 

# from io import BytesIO
# import base64

import  matplotlib
from matplotlib import pylab, mlab, pyplot
from matplotlib.path import Path
import matplotlib.patches as patches
from IPython.core.pylabtools import figsize, getfigs
plt = pyplot
import matplotlib as mpl
mpl.rcParams['pdf.fonttype'] = 42

import seaborn as sns
sns.set_context('talk')
sns.set_style('darkgrid')

from IPython.display import clear_output

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message="numpy.dtype size changed")
warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

### target bit maps ###

targetMaps = {}

with open('../results/silhouette/csv/targetMaps.txt') as json_file:
    targetMaps = json.load(json_file)
    

def get_target_cropped(target):
    return (np.logical_not(np.array(targetMaps[target]))*1)[5:13,0:8]


### conversions between arrays and strings, cropping, etc ###

def convert_to_str(flat_world):
    s = [str(i) for i in list(flat_world)] 
    res = "".join(s)
    return res


def cropped_chunk_to_string(list_chunk):
    
    w = np.zeros((18,13)).astype(int)
    w[5:13,0:8] = list_chunk
    ws = convert_to_str(w.flatten())
    
    return ws

def chunk_str_to_cropped_array(chunk_str):
    return np.array([int(x) for x in chunk_str]).reshape((18,13))[5:13,0:8]

def chunk_str_to_full_array(chunk_str):
    return np.array([int(x) for x in chunk_str]).reshape((18,13))

### properties of chunks ###

def chunk_height(chunk, chunk_is_string=True):
    if chunk_is_string:
        chunk = chunk_str_to_cropped_array(chunk)
        
    height = np.sum(np.dot(np.sum(chunk, axis=0),np.arange(8)))/np.sum(chunk) + 0.5
    return height

def chunk_area(chunk, chunk_is_string=True):
    if chunk_is_string:
        chunk = chunk_str_to_full_array(chunk) #full array, as chunk may extend beyond silhouette
        
    area = np.sum(chunk)
    return area

def is_rectangle(chunk):
    
    # detect bottom left
    i = 0
    j = 0
    while (i < chunk.shape[0]) & (chunk[i,j]==0):
        while (j < chunk.shape[1]-1) & (chunk[i,j]==0):
            j+=1
        if (chunk[i,j]==0):
            i+=1
            j=0
            
    left_bottom = (i,j)

    a = chunk.shape[0]-1
    b = chunk.shape[1]-1
    while (a > -1) & (chunk[a,b]==0):
        while (b > -1) & (chunk[a,b]==0):
            b-=1
        if(chunk[a,b]==0):
            a-=1
            b = chunk.shape[0]-1
    right_top = (a,b)
    
    if j > b:
        return False
    elif not chunk[i:a+1,j:b+1].all():
        return False
    else:
        c = chunk.copy()
        c[i:a+1,j:b+1] = 0
        return(not(c.any()))
    
            