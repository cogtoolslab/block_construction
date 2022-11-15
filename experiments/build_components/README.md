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


## Calibration Experiments
We ran these to test parameters, check whether people were at a reasonable level of accuracy (off floor/ ceiling), and measure learning effects within zipping trials.

## zipping_calibration
- Only running zipping trials to understand dynamics/ sensitivity of this experiment
- Uses different config: `experimentConfigZippingCalibration.js`
- Randomizing within mini-block (of 4 trials)
- Using one valid chunk and one random foil for each invalid trial
  - valid chunk is selected at random (i.e. from A or B)
  - foil is selected at random from remaining chunks of that direction (minus A and B)
- Running experiment todos:

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
  - ran ~20 ppts for each of [500,800], (with 1000ms chunkOnset)
- changed rendering of stimuli

#### zipping_calibration_pilot_3 
- changed stimulus set to use a single set of 26 randomly sampled composites to be used for *all participants*.
- masks still being used
- use a smaller set of composite durations [100,300,600,800], where [100,300] use 500ms chunk onset, and [600,800] use a 1000ms chunk onset. (chose these values as both pairs give the same gap between composite offset and part onset)
- shuffling miniblock order and shuffling trials within miniblock (miniblocknum is an id rather than the index of the miniblock in the trial sequence)
- stims: `26_random_composites_0`
- Ran 3 ppts on prolific, reset metadata but w/o changing set of 26 stims
- Ran XX ppts on sona w/ [600,800] chunk duration, 1000 ms chunk onset `zipping_calibration_pilot_3_sona`
- Ran XX ppts on sona w/ [100,300] chunk duration, 500 ms chunk onset `zipping_calibration_pilot_3_sona`
- Ran ~4 ppts with `zipping_calibration_pilot_3_prolific`
- Updated stim set: `zipping_calibration_pilot_3_sona_stims_1`
  - `26_random_composites_1`


## Actual Building Experiments
After calibrating the zipping trials, we returned to the pre-post study we had originally designed.

### zipping_pre_post_run_0
- Zipping trials occur in pretest and posttest, with building in between.
  - Zipping (72 trials, silhouettes)
  - Building (16 trials, towers)
  - Zipping (72 trials, silhouettes)
- Ran 72(+) ppts
- 12 ppts per rotation


### zipping_post_run_0
- Zipping trials occur only after building, in a posttest.
  - Building (16 trials, silhouettes)
  - Zipping (72 trials, towers)
- Goal: Run 36 ppts
- Collected 27 full datasets


### zipping_post_wm
- Changes:
  - Align stims in both phases (both towers or both silhouettes)
  - Try to enforce chunking in building phase by making this a working memory task.
    - i.e. display tower for a few seconds.
    - people place four blocks
    - correct => move on
    - incorrect => show tower again immediately
  - Increased brightness of blocks
- Post-only
  - Building (16 trials, towers)
  - Zipping (72 trials, towers)
- 