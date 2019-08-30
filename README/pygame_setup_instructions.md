## Setting up pygame to work on nightingale:

1. Install X11 on remote server:
`sudo apt-get install xorg openbox`

2. Install XQuartz locally:
https://www.xquartz.org/

3. Now, when you want to display pygame animations, make sure that you ssh into nightingale with the `-X` flag, e.g., 
`ssh -X USER@nightingale.ucsd.edu`

4. Test out with a pygame demo from the pygame website. Copy the following code into a file named `demo.py`.

```
import sys, pygame
pygame.init()

size = width, height = 320, 240
speed = [2, 2]
black = 0, 0, 0

screen = pygame.display.set_mode(size)

ball = pygame.image.load("intro_ball.gif")
ballrect = ball.get_rect()

while 1:
    for event in pygame.event.get():
        if event.type == pygame.QUIT: sys.exit()

    ballrect = ballrect.move(speed)
    if ballrect.left < 0 or ballrect.right > width:
        speed[0] = -speed[0]
    if ballrect.top < 0 or ballrect.bottom > height:
        speed[1] = -speed[1]

    screen.fill(black)
    screen.blit(ball, ballrect)
    pygame.display.flip()
```

Also copy over the `intro_ball.gif` image on the tutorial website: http://www.pygame.org/docs/tut/PygameIntro.html to the same location. 

To run: `python demo.py` 

5. 
