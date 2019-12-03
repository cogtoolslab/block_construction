# block construction experiments

This directory will contain subdirs containing different versions of the `block_construction` experiment. Each directory will contain all the necessary code (i.e., HTML/CSS/JavaScript) to actually run the human construction experiments. Node scripts in the main directory control server-side processes.

### experiment log

#### `dev`: Test UI

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


Significant push-back on making people wait for entire 60 seconds. 
