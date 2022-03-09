## Zipping task log

Experiment log for zipping experiment


#### pre-pilot
- Ran ~10 ppts
- 3 different stim durations [100,500,1000]
- Stimuli were not counterbalanceds
- 


#### pilot
- 3 different stim durations: [50,100,200]
  - Run 3 reps of a single stim duration by setting e.g. stimDurations = [32, 32, 32]
    - These durations have now been moved to metadata!
- 3 original stimuli are counterbalanced (each gets a turn at being novel)
- Issue with building chunks-- some were wrong.


#### full_1
- 3 different composite duration [50,100,200]
- 3 'rotations' to counterbalance stimuli
- Ran until 3 ppts per rotation*condition*duration = 54, paid 87 total
- Reran again with 500ms composite duration, increasing chunk onset to 1000ms so there was still a gap
  - 2 ppts per cell for additional 12, paid XX total
- 

The problem with this version is that in some trials (3 ambiguous and 4 novel), the participant gets shown chunks they've already built. This isn't the end of the world, but it's not the cleanest design-- ideally we'd want to counterbalance the trials in which they see these pre-built chunks. For now though, I'm going to leave them in.


## zipping_calibration
- Only running zipping trials to understand dynamics/ sensitivity of this experiment
- Uses different config: `experimentConfigZippingCalibration.js`
- Randomizing within mini-block (of 4 trials)
- Using one valid chunk and one random foil for each invalid trial
  - valid chunk is selected at random (i.e. from A or B)
  - foil is selected at random from remaining chunks of that direction (minus A and B)
- Running experiment todos:
  - 

#### zipping_calibration_sona_pilot
- Run 5 ppts on sona to check that data saving properly
- Fixed missing 'practice_trial'
- 

#### zipping_calibration_sona_pilot_2
- increased ITI to 1500ms
- add fixation cross
- add graphics as key reminders
- multiple stim durations
- ran ~10 ppts but under this name*zipping_calibration_sona_dev*
- then increased size of fixation cross and added text feedback

#### zipping_calibration_sona_masks_0
- ran ~20 ppts for each of [50,100,200,300] ms composite duration (with 500ms chunkOnset)
  - ABOUT TO RUN 20 ppts for each of [500,800], (with 1000ms chunkOnset)
- changed rendering of stimuli


#### WAITING ON CALIBRATION full_2
Not yet run- waiting on zipping_calibration for insights
To implement:
- Always display one valid chunk in invalid trials (along with a random foil?) (this makes things simpler actually). Adapt code from calibration study.
- Run a color version where everything is bricks of the same color
- Compatibility condition should be removed/ updated in trial generation
