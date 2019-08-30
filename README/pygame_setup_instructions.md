Setting up pygame to work on nightingale:

1. Install X11 on remote server:
`sudo apt-get install xorg openbox`

2. Install XQuartz locally:
https://www.xquartz.org/

3. Now, when you want to display pygame animations, make sure that you ssh into nightingale with the `-X` flag, e.g., 
`ssh -X USER@nightingale.ucsd.edu`