setwd("~/GitHub/block_construction/analysis")

library(broom)
library(tidyverse)
library(knitr)
library(ggplot2)
library(broom)
library(lme4)
library(lmerTest)
knitr::opts_chunk$set(echo = TRUE)

# import data
df.full = read.csv('results/csv/block_silhouette_Exp2Pilot3.csv')

df <- df.full %>% 
  select(rawF1DiscreteScore,phase,condition,trialNum,targetName,gameID, repetition,blockFell,buildTime) %>% 
  mutate(phase=relevel(phase, ref='pre')) %>% 
  mutate(blockFell = as.logical(blockFell))

phase_condition = lm(data = df, rawF1DiscreteScore~phase)
phase_condition
anova(phase_condition)

lmm <- lmer(data=df, rawF1DiscreteScore ~ phase + (1 + phase| gameID) + (1 + phase| targetName))
summary(lmm)

lmm <- lmer(data=df, rawF1DiscreteScore ~ phase + condition + (1 + phase + condition| gameID) + (1 + phase + condition| targetName))
summary(lmm)

lmm <- lmer(data = df, rawF1DiscreteScore ~ phase * condition + (1 + phase*condition | gameID) + (1 + phase*condition | targetName))
summary(lmm)

# (x:y) is new factor whose levels are every combination of the levels present in x and y

## Build time

lmm <- lmer(buildTime ~ phase + (1 + phase | gameID) + (1 + phase | targetName), data = df %>% 
              filter(df$blockFell==FALSE))
summary(lmm)

df %>% 
  filter(df$blockFell==FALSE)





df.rep <- df %>% 
  filter(condition=='repeated')

lmer(data = df.rep, rawF1DiscreteScore ~ repetition * condition + (1 + repetition*condition | gameID) + (1 + repetition*condition | targetName))





## Test for difference in conditions in pre phase 
df.pre <- df %>% 
  filter(phase=='pre')

pre_means <- aggregate(rawF1DiscreteScore~gameID+condition, data=df.pre, mean) %>% 
  pivot_wider(gameID,names_from=condition,values_from=rawF1DiscreteScore)

t.test(pre_means$control, pre_means$repeated, paired=TRUE)


df.post<- df %>% 
  filter(phase=='post')

post_means <- aggregate(rawF1DiscreteScore~gameID+condition, data=df.post, mean) %>% 
  pivot_wider(gameID,names_from=condition,values_from=rawF1DiscreteScore)

t.test(post_means$control, post_means$repeated, paired=TRUE)

pre_means %>% 
  mutate(diff = .$control-.$repeated) %>% 
  t.test(.$diff, data=., conf.level=.95)

