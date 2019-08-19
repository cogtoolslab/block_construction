import numpy as np
from PIL import Image

from matplotlib import pylab, mlab, pyplot
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from matplotlib.path import Path
import matplotlib.patches as patches
import copy


### visualization helpers

def get_patch(verts,
              color='orange',
              line_width = 2):
    '''
    input:
        verts: array or list of (x,y) vertices of convex polygon. 
                last vertex = first vertex, so len(verts) is num_vertices + 1
        color: facecolor
        line_width: edge width    
    output:
        patch matplotlib.path patch object
    '''
    codes = [1] + [2]*(len(verts)-1)    ## 1 = MOVETO, 2 = LINETO
    path = Path(verts,codes)
    patch = patches.PathPatch(path, facecolor=color, lw=line_width)
    return patch


def render_blockworld(patches,
                      xlim=(-2,10),
                      ylim=(-2,10),
                      figsize=(4,4)):
    
    '''
    input: 
        patches: list of patches generated by get_patch() function
        xlim, ylim: axis limits
        figsize: defaults to square aspect ratio
    output:
        visualization of block placement
    '''
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(111)    
    for patch in patches:
        ax.add_patch(patch)
    ax.set_xlim(xlim)
    ax.set_ylim(ylim)
    plt.show()




######################### DEFINITION OF BLOCK CLASS ################################
############### other blocks can inherit from the base block class #################

class Block:
    '''
    Base Block class for defining a block object with attributes
    '''
    
    def __init__(self, width=1, height=1, shape='rectangle'):
        '''self.verts = np.array([(0, 0), 
                               (0, -1 * height), 
                               (1 * width, -1 * height), 
                               (1 * width, 0), 
                               (0,0)])'''
        self.verts = np.array([(0, 0), 
                               (0, 1 * height), 
                               (1 * width, 1 * height), 
                               (1 * width, 0), 
                               (0,0)])
        self.width = width
        self.height = height
        self.shape = shape
    
    def __str__(self):
        return(str(self.width) + 'x' + str(self.height))

    def init(self):
        self.corners = self.get_corners(self.verts)
        self.area = self.get_area(shape=self.shape) 
        
    def translate(self,verts, dx, dy):
        '''
        input:
            verts: array or list of (x,y) vertices of convex polygon. 
                    last vertex = first vertex, so len(verts) is num_vertices + 1
            dx, dy: distance to translate in each direction
        output:
            new vertices
        '''
        new_verts = copy.deepcopy(verts)
        new_verts[:,0] = verts[:,0] + dx
        new_verts[:,1] = verts[:,1] + dy
        return new_verts

    def get_corners(self,verts):
        '''
        input: list or array of block vertices in absolute coordinates
        output: absolute coordinates of top_left, bottom_left, bottom_right, top_right
        '''
        corners = {}
        corners['bottom_left'] = verts[0]
        corners['top_left'] = verts[1]
        corners['top_right'] = verts[2]
        corners['bottom_right'] = verts[3]
        return corners

    def get_area(self,shape='rectangle'):
        '''
        input: w = width 
               h = height           
               shape = ['rectangle', 'square', 'triangle']
        output
        '''
        ## extract width and height from dims dictionary 
        if shape in ['rectangle','square']:
            area = self.width*self.height
        elif shape=='triangle':
            area = self.width*self.height*0.5
        else:
            print('Shape type not recognized. Please use recognized shape type.')
        return area   


    