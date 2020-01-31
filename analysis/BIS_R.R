#data = BIS(data)
#This function combines RTs and PC into a combined measure termed 'Balanced
#Integration Score' (Liesefeld, Fu, & Zimmer, 2015, JEP:LMC, 41, 1140-1151;
#                    Liesefeld & Janczyk, in press)
#the input dataframe must contain variables 'mean_rt_c' and 'pc'
#the function calculates BIS with values standardized across all fields of the 
#input and adds the field 'bis', which has the same format as 'rt' and 'pc'

BIS <- function(data) {
  n <- length(data$group)    # sample size to correct var()-function result (which uses n-1)
  srt <- sqrt( ((n-1)/n) * var(data$mean_rt_c) )     # sample standard deviation across all rts
  spc <- sqrt( ((n-1)/n) * var(data$pc) )            # sample standard deviation across all rts
  mrt <- mean(data$mean_rt_c)                        # mean across all rts
  mpc <- mean(data$pc)                               # mean across all pcs
  zrt <- (data$mean_rt_c-mrt)/srt                    # standardized rts
  zpc <- (data$pc-mpc)/spc                           # z-standardized pcs
  data$bis <- zpc - zrt                              # Balanced Integration Score
  
  return(data)                                       # return data.frame with added variable 'bis'
}

# pc: proportion of correct responses

#######################################################################################################
#######################################################################################################
# Example

#...either create an example dataframe (here called data)
mean_rt_c <- c(356.8,325.1,370.6,362.8,348.5,640.3,634.2,650.7,584.5,610.0)
pc <- c(0.71,0.73,0.67,0.73,0.72,0.97,0.99,0.99,0.97,0.97)
group <- c(1,1,1,1,1,2,2,2,2,2)
data <- data.frame(group,mean_rt_c,pc)

# ... or load the example dataframe directly
# setwd("...") # <- set to the correct directory
load("demodata_R")

# call BIS with dataframe data as argument
data <- BIS(data)