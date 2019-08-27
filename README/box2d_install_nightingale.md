## To install pybox2d on nightingale follow these instructions:

`conda create -n py35 python=3.5`

`conda activate py35`

`conda install swig`

`conda install -c https://conda.anaconda.org/kne pybox2d`

`conda install -c https://conda.anaconda.org/kne pygame`

Important: sudo user must run: 
`sudo apt-get install build-essential python-dev swig python-pygame`


## To launch jupyter notebook server within a named conda environment:

`conda install -n py35 ipykernel`
`python -m ipykernel install --user --name py35 --display-name "Python (py35)"`


## References:

https://github.com/jonasschneider/box2d-py/blob/master/INSTALL.md

https://stackoverflow.com/questions/44198228/install-pybox2d-for-python-3-6-with-conda-4-3-21

