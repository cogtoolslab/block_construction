def rda_df(df, 
           cols, 
           row_dim = cols[0], 
#           col_dim = cols[0], 
           vec_dim = cols[1], 
           layer_dim = cols[2], 
           small_multiple_dim = cols[3], 
           layer_dim = None, 
           distance_measure = (lambda a,b: distance.euclidean(a,b))
          ):
   
    x = df.unique(df)
    n_x = df.nunique(df)
    

def rda_mat(mat, 
            row_dim = None, 
#            col_dim = None, 
            vec_dim = None, 
            layer_dim = None, 
            small_multiple_dim = None, 
            distance_measure = distance.euclidean):
     '''
    Input:
    mat: a multidimensional matrix. One column is 
    row_dim: dimension for rows and columns of rsa matrix (e.g. participant number)
    vec_dim: dimension for vectors we are comparing (i.e. one data point)
    layer_dim (optional): dimension for creating multiple matrices (usually time steps)

    Returns:
    Either 
    - A 2D matrix of distances between values, or
    - A 3D matrix of distances between values, with an additional dimension for the 'layer_dim' (e.g. over time)
    '''
    
    dims = mat.shape
    
    if row_dim == None:
        row_dim = 0
        col_dim = 0
    
    if (vec_dim == None):  # get minimum free dimension for vector dimension (in reality we might not want to restrict this to just vectors)
        vec_dim = 0
        while ((vec_dim < len(dims)) & not(vec_dim in [row_dim,layer_dim,small_multiple_dim])):
            vec_dim += 1
        
    n_rows = dims[row_dim]

    all_dists = np.zeros((n_targets, n_ppts, max_actions, n_rows, n_cols))

    for t in range(0, n_targets):
        for p in range(0, n_ppts):
            for a in range(0, max_actions):
                for rep_a in range (0, n_rows): # row dim
                    for rep_b in range (0, n_cols): # col dim
                        world_a = all_worlds[t,p,a,rep_a,:]
                        world_b = all_worlds[t,p,a,rep_b,:]
                        all_dists[t,p,a,rep_a,rep_b] = scoring.get_jaccard(world_a,world_b)