

I'm trying to make updates to this as backwards compatible as possible.

In this folder I'm storing versions of files that might be overwritten in later versions. To reconstruct this version I may need to recreate the original file structure (or just update the imports in the html page).














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

# pilot
- initially tried psuedorandom assignments to conditions (8 build, 8 view, 8 foil)

# pilot_2
- true random assignment to conditions (6 build, 6 view, 12 foil)
- Ran x ppts