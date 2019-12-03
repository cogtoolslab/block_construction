# block construction experiments

This directory will contain subdirs containing different versions of the `block_construction` experiment. Each directory will contain all the necessary code (i.e., HTML/CSS/JavaScript) to actually run the human construction experiments. Node scripts in the main directory control server-side processes.

### Checklist before collecting next batch of data: 
- [ ]  double check `iterationName` is what it should be
- [ ] double check `devMode = False`
- [ ] set `blockResearchers = True`
- [ ] make sure instructions are correct
- [ ] make sure data is being saved correctly

### experiment log (by `iterationName`)

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
- Feedback from some participants: making people wait for entire 60 seconds was frustrating. 

#### `pilot3`: Minor updates to the UI and data saving
- N = `TBD` participants.
- Removed "Done" button from building phase. All participants have exactly 60s for build phase.
- Timestamp when block selected (in addition to existing timestamp when each block is placed).
- Adjusted base compensation to $4, reflecting updated estimate of expected total time on HIT.


