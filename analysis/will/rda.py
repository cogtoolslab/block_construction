def rda_df(df, 
           cols, 
           row_col = 0, 
#           col_dim = cols[0], 
           value_col = 1, 
           layer_col = None, 
           small_multiple_col = None, 
           distance_measure = distance.euclidean):
    '''
    Creates RDA matrices for a dataframe and specified columns
    '''

    
    row_vals = np.sort(df[row_col].unique())
    
    n_layers = 0
    n_small_multiples = 0
    
    if not (layer_col == None):
        layer_values = np.sort(df[layer_col].unique())
        n_layers = df[layer_col].nunique()
        
        
    if not (small_multiple_col == None):
        small_multiple_values = np.sort(df[small_multiple_col].unique())
        n_small_multiples = df[small_multiple_col].nunique()
    
    n_reps = df['repetition'].nunique()
    vector_size = len(df.value_col[0]) #1 or length of vector

    val_mat = np.zeros((n_targets, n_ppts, max_actions, n_reps, n_grid_squares))

    for i_t, target in enumerate(targets):
        for i_p, ppt in enumerate(ppts):
            for action in range(0, max_actions):
                for rep in range(0, n_reps):
                    world_df = dfic[(dfic.targetName==target) &\
                             (dfic.gameID==ppt) &\
                             (dfic.blockNum==action) &\
                             (dfic.repetition==rep)]['flatDiscreteWorld']
                    if (not world_df.empty):
                        val_mat[i_t,i_p,action,rep,:] = world_df.iloc[0]


    

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
    
    # set dimensions of distance tensor
    n_rows = dims[row_dim]
    n_cols = n_rows

    # account for layers/ small multiples
    if layer_dim == None:
        n_layers = 1
    else:
        n_layers = dims[layer_dim]
    
    if small_multiple_dim == None:
        n_small_multiples = 1
    else:
        n_small_multiples = dims[small_multiple_dim]
    
    all_dists = np.zeros((n_rows, n_cols, n_layers, n_small_multiples))
    
    index_array = [0,0,0,0,0]
    index_array[row_dim] = row
    index_array[col_dim] = col
    index_array[layer_dim] = layer
    index_array[small_multiple_dim] = n_small_multiples

    for multiple in range(0, n_small_multiples):
        for layer in range(0, n_layers):
            for row in range(0, n_rows): # row dim
                for col in range(0, n_cols): # col dim
                    vec_row = mat[row,layer,multiple,:]
                    vec_col = mat[col,layer, multiple,:]
                    all_dists[row, col, layer, multiple] = distance_measure(vec_row,vec_col)