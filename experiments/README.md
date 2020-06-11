# block construction experiments

This directory will contain subdirs containing different versions of the `block_construction` experiment. Each directory will contain all the necessary code (i.e., HTML/CSS/JavaScript) to actually run the human construction experiments. Node scripts in the main directory control server-side processes.

### Checklist before collecting a batch of data: 
- [ ]  double check `iterationName` is what it should be
- [ ] double check `devMode = False`
- [ ] set `blockResearchers = True`
- [ ] make sure instructions are correct
- [ ] make sure data is being saved correctly

### experiment log (by `iterationName`)

#### `dev`: Test UI



### All pilots have the following parameters

- practiceDuration: 600
- exploreDuration: 30
- buildDuration: 60
- bonusThresholdHigh: 0.93 ($0.05)
- bonusThresholdMid: 0.85 ($0.03)
- bonusThresholdLow: 0.7 ($0.01)

#### `pilot0`: Test UI

- N = 2 participants
- Test user interface, ensure data is saving correctly.

Found several missing pieces, including survey data not being sent.

#### `pilot1`: Test Updated Data Saving

- N = 4 participants
- Updates to data saving, including better indicators of time in each build phase.
- Updated blocking of repeat mturkers

2/4 participants appeared to be 'clicking-through' or just playing rather than engaging with the task.

#### `pilot2`: Update checks for engagement

- N = 4 participants.
- Enforced 4 blocks present before submitting structure.
- Prevented trial from finishing when participant submits structure. 
- Added checks for people repeatedly dropping blocks from sky.
- Feedback from some participants: making people wait for entire 60 seconds was frustrating. 

#### `pilot3`: Minor updates to the UI and data saving
- N = `TBD` participants.
- Removed "Done" button from building phase. All participants have exactly 60s for build phase.
- Timestamp when block selected (in addition to existing timestamp when each block is placed).
- Adjusted base compensation to $4, reflecting updated estimate of expected total time on HIT.

#### `pilot4`: Minor updates to data saving
- N = 35 participants. N = 32 after removing.
- Added more block number and timing data
- Added note to say adjust zoom if windows aren't inline


_______________________________________________________________

### `Exp2Pilot1`: Major changes
- Moved to silhouette_2 folder
- Small app.js changes
- Snap to grid
- Snap blocks down to top of structure to prevent people breaking structure
- Change to pre-post design. i.e. repeatedly build all structures, except 'control' condition structures which are build only twice.
- Use 8 of the hand-selected structures from previous version

### `Exp2Pilot2`: Update scoring functions
- Implement discrete world map and scoring
- Change to discrete scoring functions
- Small batch- some scoring variables not saved properly

### `Exp2Pilot3`: First batch of data for cogsci2020
- N = 51 participants, 2 of these excluded as missing data

#### `Exp2Pilot3_batch2`: Second batch of data for cogsci2020
- Same as above, more data to balance conditions
- N = 56

#### `Exp2Pilot3_all`: Combines two datasets from above for cogsci2020
- N = 107 total, 2 of these excluded for missing data
