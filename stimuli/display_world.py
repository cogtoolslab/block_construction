import pygame
import blockworld_helpers as bw
from Box2D import *
import random

PPM = 20 #pixels per meter
SCREEN_WIDTH, SCREEN_HEIGHT = 400, 400
DISPLAY_OFFSET_X, DISPLAY_OFFSET_Y = 100, -100
TIME_STEP = 0.05
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
    
def add_block_to_world(block, b2world):
    '''
    Add block from stimulus generation to b2world
    '''
    body = b2world.CreateDynamicBody(position=(b2_x(block),b2_y(block)))
    world_block = body.CreatePolygonFixture(box=(block.width/2,block.height/2), density=1, friction=0.3)


def random_world_test(blocks_removed = 0):

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

    
    white = (255,255,255)
    black = (0,0,0)

    red = (255,0,0)
    green = (0,255,0)
    blue = (0,0,255)
    dark_green = (0,50,0)
    
    gameDisplay = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), 0, 32)
    pygame.display.set_caption('World Display')
    gameDisplay.fill(black)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()

        gameDisplay.fill((0, 0, 0, 0))
        
        for body in b2world.bodies:
            for fixture in body.fixtures:

                shape = fixture.shape

                vertices = [(body.transform * v) * PPM for v in shape.vertices]

                vertices = [(v[0] + DISPLAY_OFFSET_X, SCREEN_HEIGHT - v[1] + DISPLAY_OFFSET_Y) for v in vertices]

                pygame.draw.polygon(gameDisplay, dark_green, vertices)
                pygame.draw.polygon(gameDisplay, green, vertices, 1)
        
        b2world.Step(TIME_STEP, 10, 10)
        
        pygame.display.update()
        

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

def display_blocks(world):
    
    pygame.init()
    
    #make pybox2D world
    b2world = b2World(gravity=(0,-10), doSleep=False)
    groundBody = b2world.CreateStaticBody( #add ground
        position=(0,-10),
        shapes=b2PolygonShape(box=(50,10)),
    )

    for block in world.blocks:
        b2block = add_block_to_world(block, b2world)

    black = (0,0,0)
    green = (0,255,0)
    dark_green = (0,50,0)
    
    gameDisplay = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), 0, 32)
    pygame.display.set_caption('Checking World')
    gameDisplay.fill(black)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()

        gameDisplay.fill((0, 0, 0, 0))
        
        for body in b2world.bodies:
            for fixture in body.fixtures:

                shape = fixture.shape

                vertices = [(body.transform * v) * PPM for v in shape.vertices]

                vertices = [(v[0] + DISPLAY_OFFSET_X, SCREEN_HEIGHT - v[1] + DISPLAY_OFFSET_Y) for v in vertices]

                pygame.draw.polygon(gameDisplay, dark_green, vertices)
                pygame.draw.polygon(gameDisplay, green, vertices, 1)
        
        b2world.Step(TIME_STEP, 8, 10)
        
        pygame.display.update()
    
def test_T():
    w = bw.World()
    w.add_block(2,4,4,0)
    w.add_block(4,2,2,4)
    display_blocks(w)

def test_stonehenge():
    w = bw.World()
    w.add_block(2,4,2,0)
    w.add_block(2,4,6,0)
    w.add_block(4,2,3,4)
    display_blocks(w)

random_world_test(5)
#test_T()
#test_stonehenge()
