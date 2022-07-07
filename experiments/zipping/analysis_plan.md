## 2) Hypothesis What's the main question being asked or hypothesis being tested in this study?
How does building experience affect perceptual decomposition? We hypothesize that building specific parts of an object biases people towards visually parsing an object into those parts.

## 3) Dependent variable Describe the key dependent variable(s) specifying how they will be measured.

We intend to measure the bias participants have towards particular perceptual decompositions as a consequence of building experience.
Our stimuli are a set of block tower stimuli– 2D towers constructed from 8 2x2 rectangular blocks.
Importantly, these stimuli are ‘composite’ towers, that can be decomposed horizontally into two tall 4-block subtowers, or vertically into two wide 4-block subtowers.
To measure biases in decomposition, we plan to present the composites followed by two tall or two wide 4-block towers, that may or may not be valid decompositions of the composite (i.e. may or may not be two actual subparts of the composite).
We measure the ability of participants to judge whether these candidate decompositions are a valid decomposition, using: 

Accuracy: proportion of correct responses
RT: time to respond from part onset
d’: sensitivity

Crucially, participants will have built several of the potential subtowers beforehand– the wide subtowers of one composite, and the tall subtowers of second composite. 
We predict that this experience building subtowers will bias participants towards decompositions that involve those subtowers, compared to decompositions involving the subtowers of the opposing orientation (eg. wide instead of tall).
Hence it will be easier for them to judge whether a candidate decomposition that is compatible with that experience is valid or invalid (i.e. when someone has built the wide subtowers of a composite, they will be better at judging whether the presented wide subtowers are valid decomposition or not).

## 4) Conditions How many and which conditions will participants be assigned to?

All trials will involve a single composite tower, which is either:
wide_subtowers_built: participant builds the wide subtowers of this composites
tall_subtowers_built: participant builds the wide subtowers of this composites
no_subtowers_built: participant builds no subtowers of this composites

Trials include a composite tower followed by subparts. These subparts will either be:
compatible: same orientation (wide/tall) as the subparts of the composite that the participant has built.
incompatible: opposite orientation (wide/tall) as the subparts of the composite that the participant has built.
novel: no subparts for that composite were built by the participant

## 5) Analyses Specify exactly which analyses you will conduct to examine the main question/hypothesis.

We will fit mixed effects regression models to reaction time and accuracy, and perform nested model comparisons to assess whether a model containing an interaction term between phase and compatibility is a better fit than one without.

RT
For reaction time we will fit log(RT) with a linear mixed effects model of the following structure.

log(rt) ~ phase + (1 | stimulus) + (1 + phase | participant))
log(rt) ~ phase + compatibility + (1 | stimulus) + (1 + phase | participant))
log(rt) ~ phase*compatibility + (1 | stimulus) + (1 + phase | participant))

Accuracy
For accuracy, we will fit the binary response_correct variable with a generalized mixed effects logistic regression models of the same structure as above:

response_correct ~ phase + (1 | stimulus) + (1 + phase | participant)
response_correct ~ phase + compatibility + (1 | stimulus) + (1 + phase | participant)
response_correct ~ phase * compatibility +  (1 | stimulus) + (1 + phase | participant)


d’
As participants may also be biased towards a certain response, we will also compare participants’ d’s for compatible vs incompatible trials in each phase.
As d’ is calculated for each (participant, compatibility, phase), no random effect for participant will be included.

d’ ~ phase
d’ ~ phase + compatibility
d’ ~ phase * compatibility

## 6) Outliers and Exclusions Describe exactly how outliers will be defined and handled, and your precise rule(s) for excluding observations.

Participants will be excluded for failing to meet the following criteria:
failure to complete all trials
highly unusual average response times
too short (<500ms),
shorter than other participants (3 sds below the leave-one-participant-out median logged RT), 
longer than other participants (3 sds above the leave-one-participant-out median logged RT)
mean number of button presses per trial is greater than 3 (suggesting “button-bashing”)
less than chance (<50%) accuracy


We will also flag individual trials that meet the following criteria.
RT is
shorter than other participants (3 sds below the leave-one-participant-out median logged RT), 
longer than other participants (3 sds above the leave-one-participant-out median logged RT)
>3 button presses

Flagged trials will be included in our main analyses, however we will also run the core analyses without flagged trials.

## 7) Sample Size How many observations will be collected or what will determine sample size?

N trials
To ensure multiple measurements (i.e. 3) per condition, each participant will perform (3 blocks x 2 validity x 3 stimuli x 2 orientations) = 72 zipping trials in both the pre and post phases.

We counterbalance the role of each stimulus across participants (i.e. as the novel, built_tall, and built_wide), creating 6 rotations of stimuli. To maintain a balance between these rotations, we consider multiples of 12 participants when performing a power analysis to establish the number of participants.

N participants: power analysis
Here we determine the number of participants necessary to achieve a power of 0.8, given a reasonable choice for d’.

For simplicity, we consider only the compatible and incompatible trials (i.e. not novel trials).
We assume that RTs for compatible and incompatible trials are drawn from separate distributions with means (µ_c and µ_i respectively) and equal variance (σ). 
As we do not know the parameters of these distributions in advance, we hold the values of  µ_i  and µ_c fixed, and consider a range of d’ = (µ_i - µ_c) / σ, to obtain values of σ.

We then sample RT data from these distributions N(µ_i, 1), N(µ_c, 1).

We sample data from n participants for 24 trials, for each condition, and perform a linear mixed effects regression with a fixed effect for condition and random intercept for participant.

We repeat this process 10 times, measuring the proportion of significant p-values (at an alpha of 0.05) for the effect of condition to extract the power.

__ 

We will aim for 72 ppts.