import pygame
from pygame.locals import *
import json
import blockworld_helpers as bw
from Box2D import *
import random
import argparse
import numpy as np


# Helper functions for interacting between stimulus generation and pybox2D

def b2_x(block):
    '''
    Takes a block from stimulus generation and returns the x value of the center of the block
    '''
    return ((block.x) + (block.width / 2))

def b2_y(block):
    '''
    Takes a block from stimulus generation and returns the y value of the center of the block
    '''
    return ((block.y) + (block.height / 2))
    
def add_block_to_world(block, b2world, SIZE_FACTOR = 1):
    '''
    Add block from stimulus generation to b2world
    '''
    body = b2world.CreateDynamicBody(position=(b2_x(block)*SIZE_FACTOR,b2_y(block)*SIZE_FACTOR))
    world_block = body.CreatePolygonFixture(box=((block.width/2)*SIZE_FACTOR,(block.height/2)*SIZE_FACTOR), density=1, friction=0.3)
        
def jenga_blocks(w,n):

    for j in range(0,n):
        i = 0;
        block_removed = False
        while not block_removed:
            #block_number = random_block_order.pop
            (block_removed, w2) = w.jenga_block(i)
            if block_removed:
                w = w2
            else:
                i += 1;
    return w

def event_handler():
    for event in pygame.event.get():
        if event.type == QUIT or (
             event.type == KEYDOWN and (
              event.key == K_ESCAPE or
              event.key == K_q
             )):
            pygame.quit()
            quit() 

def display_blocks(world, 
                   TIME_STEP = 0.01,
                   VEL_ITERS = 10,
                   POS_ITERS = 10,
                   SCREEN_WIDTH = 400,
                   SCREEN_HEIGHT = 400, 
                   PPM = 20,
                   DISPLAY_OFFSET_X = 100,
                   DISPLAY_OFFSET_Y = -100,
                   SIZE_FACTOR = 1,
                   RENDER = True):
    
    
    
    
    #make pybox2D world
    b2world = b2World(gravity=(0,-10), doSleep=False)
    groundBody = b2world.CreateStaticBody( #add ground
        position=(0*SIZE_FACTOR,-10*SIZE_FACTOR),
        shapes=b2PolygonShape(box=(50*SIZE_FACTOR,10*SIZE_FACTOR)),
    )

    for block in world.blocks:
        b2block = add_block_to_world(block, b2world, SIZE_FACTOR = SIZE_FACTOR)
   
    step = 0
    
    # Set up display
    if RENDER:
        pygame.init()
        game_display = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), 0, 32)
        pygame.display.set_caption('Checking World')
        black = (0,0,0)
        game_display.fill(black)
    
    start_positions = np.array([body.position for body in b2world.bodies])
    print(start_positions)

    while True:
        step +=1
        
        # render next step
        if RENDER:
            event_handler() ## will quit pygame if Q/Esc key pressed
            render_b2step(b2world,
                          game_display,
                          step = step,
                          TIME_STEP=TIME_STEP,
                          VEL_ITERS=VEL_ITERS,
                          POS_ITERS=POS_ITERS,
                          SCREEN_WIDTH=SCREEN_WIDTH,
                          SCREEN_HEIGHT=SCREEN_HEIGHT,
                          PPM=PPM,
                          DISPLAY_OFFSET_X=DISPLAY_OFFSET_X,
                          DISPLAY_OFFSET_Y=DISPLAY_OFFSET_Y,
                          SIZE_FACTOR=SIZE_FACTOR)
        
        b2world.Step(TIME_STEP, VEL_ITERS, POS_ITERS)
        if step == 100:
            end_positions = np.array([body.position for body in b2world.bodies])
            print(end_positions)
            
            # check stable
            move_diffs = np.absolute(np.subtract(start_positions, end_positions))
            if (move_diffs > 0.1).any():
                print('big move')
            elif (sum(sum(move_diffs))/len(b2world.bodies) > 1):
                print('lots of small diffs')
            else:
                print('stable')
            
            if not RENDER: 
                quit()

def render_b2step(b2world, 
                  game_display,
                  step = 0,
                  TIME_STEP = 0.01,
                  VEL_ITERS = 10,
                  POS_ITERS = 10, 
                  SCREEN_WIDTH = 400,
                  SCREEN_HEIGHT = 400,
                  PPM = 20,
                  DISPLAY_OFFSET_X = 100,
                  DISPLAY_OFFSET_Y = -100,
                  SIZE_FACTOR = 1):

    game_display.fill((0, 0, 0, 0))

    # Display vars
    black = (0,0,0)
    green = (0,255,0)
    dark_green = (0,50,0)
    font = pygame.font.Font('freesansbold.ttf', 16)

    for body in b2world.bodies:
        for fixture in body.fixtures:

            shape = fixture.shape

            vertices = [(body.transform * v) * PPM/ SIZE_FACTOR for v in shape.vertices]
            vertices = [(v[0] + DISPLAY_OFFSET_X, SCREEN_HEIGHT - v[1] + DISPLAY_OFFSET_Y) for v in vertices]

            pygame.draw.polygon(game_display, dark_green, vertices)
            pygame.draw.polygon(game_display, green, vertices, 1)

    text = font.render(str(step), True, green)
    game_display.blit(text,(SCREEN_WIDTH - 30 -text.get_width(),SCREEN_HEIGHT - 50))
    
    pygame.display.update()                           
    
    
        
def random_world_test(blocks_removed = 0,
                      TIME_STEP = 0.01,
                      VEL_ITERS = 10,
                      POS_ITERS = 10, 
                      SCREEN_WIDTH = 400,
                      SCREEN_HEIGHT = 400,
                      PPM = 20,
                      DISPLAY_OFFSET_X = 100,
                      DISPLAY_OFFSET_Y = -100,
                      SIZE_FACTOR = 1,
                      RENDER = True):

    pygame.init()
    
    #make pybox2D world
    b2world = b2World(gravity=(0,-10), doSleep=False)
    groundBody = b2world.CreateStaticBody( #add ground
        position=(0,-10),
        shapes=b2PolygonShape(box=(50,10)),
    )

    # Add blocks
    world = bw.World(world_width = 8,world_height = 8)
    world.fill_world()
    
    world = jenga_blocks(world,blocks_removed)

    for block in world.blocks:
        b2block = add_block_to_world(block, b2world)
        
    display_blocks(world,
                   TIME_STEP=TIME_STEP,
                   VEL_ITERS=VEL_ITERS,
                   POS_ITERS=POS_ITERS,
                   SCREEN_WIDTH=SCREEN_WIDTH,
                   SCREEN_HEIGHT=SCREEN_HEIGHT,
                   PPM=PPM,
                   DISPLAY_OFFSET_X=DISPLAY_OFFSET_X,
                   DISPLAY_OFFSET_Y=DISPLAY_OFFSET_Y,
                   SIZE_FACTOR=SIZE_FACTOR,
                   RENDER = RENDER)  

    
def simple_tests(TEST_NAME='stonehenge',
                 TIME_STEP=0.01,
                 VEL_ITERS = 10,
                 POS_ITERS = 10,
                 SCREEN_WIDTH= 400,
                 SCREEN_HEIGHT = 400,
                 PPM = 20,
                 DISPLAY_OFFSET_X=100,
                 DISPLAY_OFFSET_Y=-100,
                 SIZE_FACTOR = 1,
                 RENDER = True):
    '''
    Runs super simple tests in pybox2d, e.g., T block & stonehenge config.
    '''
    
    if TEST_NAME == 'stonehenge':        
        w = bw.World()
        w.add_block(2,4,2,0)
        w.add_block(2,4,6,0)
        w.add_block(4,2,3,4)
        display_blocks(w,
                       TIME_STEP=TIME_STEP,
                       VEL_ITERS=VEL_ITERS,
                       POS_ITERS=POS_ITERS,
                       SCREEN_WIDTH=SCREEN_WIDTH,
                       SCREEN_HEIGHT=SCREEN_HEIGHT,
                       PPM=PPM,
                       DISPLAY_OFFSET_X=DISPLAY_OFFSET_X,
                       DISPLAY_OFFSET_Y=DISPLAY_OFFSET_Y,
                       SIZE_FACTOR=SIZE_FACTOR,
                       RENDER = RENDER)    
    elif TEST_NAME == 'T':
        w = bw.World()
        w.add_block(2,4,4,0)
        w.add_block(4,2,3,4)
        display_blocks(w, 
                       TIME_STEP=TIME_STEP, 
                       VEL_ITERS=VEL_ITERS, 
                       POS_ITERS=POS_ITERS,
                       SCREEN_WIDTH=SCREEN_WIDTH,
                       SCREEN_HEIGHT=SCREEN_HEIGHT,
                       PPM=PPM,
                       DISPLAY_OFFSET_X=DISPLAY_OFFSET_X,
                       DISPLAY_OFFSET_Y=DISPLAY_OFFSET_Y,
                       SIZE_FACTOR=SIZE_FACTOR,
                       RENDER = RENDER) 
    elif TEST_NAME == 'r':
        w = bw.World()
        w.add_block(2,4,4,0)
        w.add_block(4,2,4,4)
        display_blocks(w, 
                       TIME_STEP=TIME_STEP, 
                       VEL_ITERS=VEL_ITERS, 
                       POS_ITERS=POS_ITERS,
                       SCREEN_WIDTH=SCREEN_WIDTH,
                       SCREEN_HEIGHT=SCREEN_HEIGHT,
                       PPM=PPM,
                       DISPLAY_OFFSET_X=DISPLAY_OFFSET_X,
                       DISPLAY_OFFSET_Y=DISPLAY_OFFSET_Y,
                       SIZE_FACTOR = SIZE_FACTOR,
                       RENDER = RENDER)
    else:
        print('simple test type not understood!')
        
    
if __name__ == "__main__":
    def str2bool(v):
        return v.lower() in ("yes", "true", "t", "1") 
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--PPM', type=int, help='pixels per meter', default=20)
    parser.add_argument('--SCREEN_WIDTH', type=int, help='screen width', default=400)    
    parser.add_argument('--SCREEN_HEIGHT', type=int, help='screen height', default=400)    
    parser.add_argument('--DISPLAY_OFFSET_X', type=int, help='horizontal display offset', default=100)
    parser.add_argument('--DISPLAY_OFFSET_Y', type=int, help='horizontal display offset', default=-100) 
    parser.add_argument('--TIME_STEP', type=float, help='the length of time passed to simulate (seconds)', default=0.01)
    parser.add_argument('--VEL_ITERS', type=int, help='how strongly to correct velocity', default=10)
    parser.add_argument('--POS_ITERS', type=int, help='how strongly to correct position', default=10)    
    parser.add_argument('--TEST_NAME', type=str, help='which test do you want to run? options: T, stonehenge, jenga', default='jenga')
    parser.add_argument('--BLOCKS_REMOVED',type=int, help='how many blocks to remove? only applies to jenga test.', default=5)
    parser.add_argument('--SIZE_FACTOR',type=float, help='scale of blocks in physics engine. 1: 1 meter per unit. Less than 0.5 unstable', default=1)
    parser.add_argument('--RENDER',type=str, help='display blocks with pygame', default='true')
    args = parser.parse_args()
    
    ## detect which test the user wants to run and then run that one
    if args.TEST_NAME in ['stonehenge','T', 'r']:
        simple_tests(TEST_NAME = args.TEST_NAME,
                     TIME_STEP=args.TIME_STEP,
                     VEL_ITERS=args.VEL_ITERS,
                     POS_ITERS=args.POS_ITERS,
                     SCREEN_WIDTH= args.SCREEN_WIDTH,
                     SCREEN_HEIGHT = args.SCREEN_HEIGHT,
                     PPM = args.PPM,
                     DISPLAY_OFFSET_X=args.DISPLAY_OFFSET_X,
                     DISPLAY_OFFSET_Y=args.DISPLAY_OFFSET_Y,
                     SIZE_FACTOR = args.SIZE_FACTOR,
                     RENDER = str2bool(args.RENDER))      
    elif args.TEST_NAME=='jenga':
        random_world_test(blocks_removed = args.BLOCKS_REMOVED,
                          TIME_STEP = args.TIME_STEP,
                          VEL_ITERS = args.VEL_ITERS,
                          POS_ITERS = args.POS_ITERS,
                          SCREEN_WIDTH= args.SCREEN_WIDTH,
                          SCREEN_HEIGHT = args.SCREEN_HEIGHT,
                          PPM=args.PPM,
                          DISPLAY_OFFSET_X=args.DISPLAY_OFFSET_X,
                          DISPLAY_OFFSET_Y=args.DISPLAY_OFFSET_Y,
                          SIZE_FACTOR = args.SIZE_FACTOR,
                          RENDER = str2bool(args.RENDER))
    else:
        print('TEST_NAME not recognized. Please specify a valid test name.')

        
