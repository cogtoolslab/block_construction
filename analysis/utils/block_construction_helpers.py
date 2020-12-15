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


def convert_to_str(flat_world):
    s = [str(i) for i in list(flat_world)] 
    res = "".join(s)
    return res


def cropped_chunk_to_string(list_chunk):
    
    w = np.zeros((18,13)).astype(int)
    w[5:13,0:8] = list_chunk
    ws = convert_to_str(w.flatten())
    
    return ws