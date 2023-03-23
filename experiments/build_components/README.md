# build_components

This experiment explores the components of building activity that affect memory.

## Decisions
- Trial randomization
  - Done in js
  - Learning phase
    - Random shuffle, rejecting sequences with >3 of same condition in a row
  - Recall phase
    - Random shuffle, rejecting sequences with >3 of same condition in a row
- 



# Old-New version

Plugins:
- `block-tower-build`
- `block-tower-viewing`
- `block-tower-old-new`

## pilot
- initially tried psuedorandom assignments to conditions (8 build, 8 view, 8 foil)

## pilot_2
- true random assignment to conditions (6 build, 6 view, 12 foil)
  - assigned in: building_components_build_recall_stimuli_backup.ipynb
  - stimuli in: `build_components_pilot` collection
  - assignments stored in: `df_build_components_pilot_2_assignments.csv`
- Ran x ppts


## check for newer iteration names!




# Build Retrieval/ "build_recall" version

- New config: experimentConfigBuildRetrieval
- New iteration names: building_components_build_recall_*
- New plugin for free recall building (allows undo): `block-tower-build-recall`
- New plugin for build encoding (adding in undo): `block-tower-building-undo`

## build_components_build_recall_prolific_pilot_12_towers
- n=10
- Started using exact same stimuli (and metadata) as oldnew version
  - 12 stimuli (6 build, 6 view) taken using same assignments as pilot_2 above.
  - Selected with: building_components_build_recall_stimuli_backup.ipynb
- Participants can submit up to 14 towers (number of target towers +2)


## build_components_build_recall_prolific_pilot_6_towers
- Smaller stimulus set
  - Take first half of set of towers
  - Regenerate assignments: 3 build, 3 view, 6 foil (foils not used in recall experiment, but are generated for future use in old-new version)
  - stimuli in: `build_components_6_towers` collection
  - assignments stored in: `df_build_components_6_tower_assignments.csv`
  - participants can submit up to 6 towers (number of target towers)
