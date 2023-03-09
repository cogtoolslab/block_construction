/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

// const { transform } = require("lodash");

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["block-tower-build-recall"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('block-construction', 'stimulus', 'image');

  plugin.info = {
    name: "block-tower-build-recall",
    parameters: {
      domain: {
        type: jsPsych.plugins.parameterType.STRING, // Domain to display.
        default: "",
      },
      prompt:{
        type: jsPsych.plugins.parameterType.STRING,
        default: "",
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Preamble",
        default: null,
        description:
          "HTML formatted string to display at the top of the page above all the questions.",
      },
      buttonLabel: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Button label",
        default: "Continue",
        description: "The text that appears on the button to finish the trial.",
      },
      nBlocksMax: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Number of blocks available",
        default: 8,
        description: "Number of blocks that can be placed before the trial ends or resets",
      },
      dataForwarder: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Function to call that forwards data to database (or otherwise)",
        default: (data) => console.log(data),
      },
      iti: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'ITI',
        default: 0,
        description: 'Time (ms) in between trials after clearing screen.'
      },
      trialNum :{
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial Number',
        default: 0,
        description: 'Externally assigned trial number.'
      },
    },
  };

  plugin.trial = function (display_element, trial) {

    config.stimCanvasWidth = 2800;
    config.stimCanvasHeight = 400;
    config.envCanvasWidth = config.canvasWidth;
    config.envCanvasHeight = config.canvasHeight;
    config.stimX = 300;
    config.stimY = config.stimCanvasHeight / 3;

    trial.submittedTowers = [];
    trial.concatenatedTowers = [];

    const undoredoManager = new UndoRedoManager();

    // extra controls
    function controlHandler(event) {

      switch (event.keyCode) {
        // case 68: // d: switch selected block
        //   switchSelectedBlock();
        //   break;
        // case 32: // space: switch selected block
        //   event.preventDefault(); //stop spacebar scrolling 
        //   switchSelectedBlock();
        //   break;
        // case 27: // escape: stop placing block
        //   stopPlacingBlock();
        //   break;
        case 90: // z: undo
          if (event.ctrlKey) {
            if (event.shiftKey){
              undoredoManager.redo();
            } else {
            undoredoManager.undo();
            }
          } else if (event.metaKey){
            if (event.shiftKey){
              undoredoManager.redo();
            } else {
            undoredoManager.undo();
            }
          }
          break;
        case 89: // y: redo
          if (event.ctrlKey) {
            undoredoManager.redo();
          } else if (event.metaKey){
            event.preventDefault();
            undoredoManager.redo();
          }
          break;
        default:
          break;
      }
    };

    // if (trial.trialNum == 1) { // hack to avoid handlers being added more than once
    //   $(document).on("keydown", controlHandler);
    // };
    $(document).on("keydown", controlHandler);

    window.currTrialNum += 1;

    display_element.innerHTML = "";

    var html_content = "";

    // show preamble text

    // html_content += '<h4 id="prompt">'+trial.prompt+'</h4>';
    
    html_content += '<div class="container" id="experiment">';

    /** Create building canvases **/

    // submitted towers
    html_content += '<div class="row env-row" id="tower-gallery">';
    html_content += '<p id="gallery-title">saved towers</p>';
    html_content += '<div class="col env-div submitted-towers" id="stimulus-canvas"></div>';
    html_content += '</div>';

    // building window
    html_content += '<div class="row env-row">';
    html_content += '<div class=" col env-div" id="environment-canvas" style="flex-basis: 0; margin: auto"></div>';

    html_content += '<div class="col button-col">';
    html_content += '<button id="submit-button" type="button" class="btn btn-primary">Submit</button>';
    html_content += '<button id="reset-button" type="button" class="btn btn-warning">Reset</button>';

    // html_content += '<p class="build-recall-prompt"></p>';
    html_content += '<p class="build-recall-prompt">Build all the towers you remember from the previous part of the experiment.</br></br>Press Submit to save a tower that you are happy with.</br>Press Reset to clear the blocks in the building window.</br>Press Exit when you can\'t remember any more towers.</br></br> You can undo blocks with (cmd/ctl + z), and redo with (cmd/ctl + shift + z).</p>';

    html_content += '</div>';

    html_content += '</div>';

    // html_content += '<div class="row pt-3 button-row">';
    // html_content += '<button id="reset-button" type="button" class="btn btn-warning">Reset</button>';
    // html_content += '<button id="submit-button" type="button" class="btn btn-primary">Submit</button>';
    // html_content += '</div>';

    html_content += '<div class="row pt-1 button-row">';
    html_content += '<button id="finish-button" type="button" class="btn btn-danger">Exit</button>';
    html_content += '</div>';

    html_content += "</div>";
    // html_content += '<p>Use ctrl/cmd + minus-sign (-) if windows do not fit on the screen at the same time.</p>';

    display_element.innerHTML = html_content;

    trial.finished = false;

    if (true) { // TODO: remove?

      trial.trialStartTime = Date.now();
      undoredoManager.removeEventListener("undo");
      undoredoManager.addEventListener("undo", (blockData) => {

        let timeNow = Date.now();
        trial.nUndoForSubmit += 1;
        trial.nBlocksPlaced -= 1;
        // nBlocksPlacedInStep -= 1;
        trial.dataForwarder(
          _.extend(
            {},
            blockData,
            {
              n_block: trial.nBlocksPlaced,
              datatype: 'block_undo_placement',
              absolute_time: timeNow,
              relative_time: timeNow - trial.trialStartTime
            })
        );
      });
  
      undoredoManager.removeEventListener("redo");
      undoredoManager.addEventListener("redo", (blockData) => {

        let timeNow = Date.now();
        trial.nBlocksPlaced += 1;

        trial.dataForwarder(
          _.extend(
            {},
            blockData,
            {
              n_block: trial.nBlocksPlaced,
              datatype: 'block_redo_placement',
              absolute_time: timeNow,
              relative_time: timeNow - trial.trialStartTime
            })
        );
      });

      trial.nBlocksPlaced = 0;
      trial.timeSinceLastSubmit = Date.now();
      trial.nResetsForSubmit = -1;
      trial.nUndoForSubmit = 0;
      trial.currXOffset = 0;

      // trial.stimulus = {'blocks': [{ 'x': 0, 'y': 0, 'height': 1, 'width': 2 },
      //     { 'x': 2, 'y': 0, 'height': 2, 'width': 1 },
      //     { 'x': 0, 'y': 1, 'height': 2, 'width': 1 },
      //     { 'x': 1, 'y': 2, 'height': 1, 'width': 2 }]};

      let constructionTrial = {
        stimulus: trial.concatenatedTowers, // 'stimulus' repurposed as display of submitted towers
        endCondition: '',
        blocksPlaced: 0,
        nResets: -1, // start minus one as reset env at beginning of new trial
        //nBlocksMax: trial.nBlocksMax,
        offset: 0,
        blockSender: blockSender,
        resetSender: resetSender,
        endBuildingTrial: endTrial
      };

      trial.constructionTrial = constructionTrial;

      var showStimulus = true;
      var showBuilding = true;

      blockSetup(constructionTrial, showStimulus, showBuilding);
      blockUniverse.disabledBlockPlacement = false;

      // UI
      $("#finish-button").click(() => {
        endTrial();
      });

      $("#reset-button").click(() => {
        if(trial.nBlocksPlaced > 0) {
          resetBuilding();
        };
      });

      $("#submit-button").click(() => {
        submitTower();
      });

      resetBuilding = function () {

        trial.nResetsForSubmit +=1;
        undoredoManager.redostack = [];

        let nBlocksWhenReset = trial.nBlocksPlaced;
        constructionTrial.nResets += 1;
        trial.nBlocksPlaced = 0;
        resetSender({
          n_blocks_when_reset: nBlocksWhenReset,
        });

        if (_.has(blockUniverse, 'p5env') ||
          _.has(blockUniverse, 'p5stim')) {
          blockUniverse.removeEnv();
          blockUniverse.removeStimWindow();
        };

        blockSetup(trial.constructionTrial, showStimulus, showBuilding);
        trial.timeSinceLastReset = Date.now();

      };

      resetBuilding(); // call once to clear from previous trial

    };


    function endTrial(trial_data) { // called by block_widget when trial ends

      $(document).off("keydown", controlHandler);

      if (trial.nBlocksPlaced > 0) {
        window.alert("You have built something that hasn't been submitted. Please submit your tower or Reset before pressing finish.");
      } else if (trial.submittedTowers.length == 0){ // if no towers have been submitted
        window.alert("You haven't submitted any towers. If you can't remember any, please try your best to construct towers as similar as possible to the ones you saw.");
      } else {

        let timeNow = Date.now();

        blockUniverse.disabledBlockPlacement = true;

        trial_data = _.extend(
          trial_data, 
          {
            absolute_time: timeNow,
            trial_start_time: trial.trialStartTime,
            total_recall_time: timeNow - trial.trialStartTime,
            submitted_towers: trial.submittedTowers,
            concatenated_towers: trial.concatenatedTowers,
            n_towers: trial.submittedTowers.length,
            condition: trial.condition,
            fixation_duration: trial.fixationDuration,
            gap_duration: trial.gapDuration,
            n_resets: trial.constructionTrial.nResets,
            trial_num: trial.trialNum,
            trial_type: trial.trialType
            
          });

        var env_divs = document.getElementsByClassName("env-div");
        Array.prototype.forEach.call(env_divs, env_div => {
          env_div.style.backgroundColor = "#58CF76";
        });
        trial.finished = true;

        // window.blockUniverse.blockMenu.blockKinds = [];
        setTimeout(function () {
          display_element.innerHTML = '';
          setTimeout(function () {
            // move on to the next trial
            jsPsych.finishTrial(trial_data);
          }, trial.iti);

        }, trial.afterBuildPauseDuration);

      };
    
    };

    function getTowerDetails() {

      let towerDetails = {
        blocks: blockUniverse.getBlockJSON(),
        discreteWorld: blockUniverse.discreteWorld,
        n_block: trial.nBlocksPlaced,
      };
      return towerDetails;
    }

    function appendTower(oldTowers, newTower) {
      // add blocks from newTower into list of blocks in oldTowers

      newTower.forEach(block => {
        oldTowers.push({
          height : block.height,
          width : block.width,
          x : block.x + trial.currXOffset,
          y : block.y
        });
      });

      trial.currXOffset += towerWidth(newTower) + 1;
    };

    function translateTower(tower, xoffset=0, yoffset=0) {
      
      newTower = [];

      tower.forEach(block => {
        newTower.push({
          height : block.height,
          width : block.width,
          x : block.x + xoffset,
          y : block.y + yoffset,
        });
      });

      return newTower;
    };

    function minX(tower) {
      let xs = _.map(tower, (block) => {return(block.x)});
      let minx = _.min(xs);
      return minx;
    };

    function maxX(tower) {
      let rights = _.map(tower, (block) => {return(block.x + block.width - 1)});
      let maxx = _.max(rights);
      return maxx;
    };

    function towerWidth(tower){
      let width = maxX(tower) - minX(tower) + 1;
      return width;
      
    }


    function submitTower() {

      if(trial.nBlocksPlaced > 0){
        
        // locally save tower
        let newTower = {
          towerDetails : getTowerDetails(),
          nTower : trial.submittedTowers.length + 1
        };

        newTower.alignedTowerBlocks = translateTower(
                                  newTower.towerDetails.blocks, 
                                  xoffset=-minX(newTower.towerDetails.blocks));

        // console.log('newTower.towerDetails.blocks', newTower.towerDetails.blocks);
        // console.log('minX', minX(newTower.towerDetails.blocks));
        // console.log('newTower.alignedTowerBlocks', newTower.alignedTowerBlocks);
        
        trial.submittedTowers.push(newTower);
        // console.log('tower submitted:', newTower);
        // console.log('submittedTowers:', trial.submittedTowers);
        // TODO: display submitted tower (not here)
        // blockUniverse.trialObj.stimulus = newTower.towerDetails.blocks;
        appendTower(trial.concatenatedTowers, newTower.alignedTowerBlocks);
        console.log('concatenatedTowers', trial.concatenatedTowers);
        // blockUniverse.trialObj.stimulus = trial.concatenatedTowers;


        undoredoManager.redostack = [];
        // details about tower construction process

        let towerConstructionData = {
          n_resets_for_tower: trial.nResetsForSubmit, 
          n_undo_for_tower: trial.nUndoForSubmit,
        }

        let timeNow = Date.now();

        currentData = _.extend(
          towerConstructionData,
          newTower, // details about final state of tower
          {
            absolute_time: timeNow,
            trial_start_time: trial.trialStartTime,
            relative_time_trial: timeNow - trial.trialStartTime,
            time_since_last_submit: timeNow - trial.timeSinceLastSubmit,
            time_since_last_reset: timeNow - trial.timeSinceLastReset,
            datatype: 'recalled_tower',
            condition: trial.condition,
            n_block: trial.nBlocksPlaced,
            cumulative_resets_across_submissions: trial.constructionTrial.nResets
        });

        console.log(currentData);
        
        trial.dataForwarder(currentData);
        
        console.log('submitted towers:', trial.submittedTowers.length, trial.submittedTowers);

        if (_.has(blockUniverse, 'p5env') ||
          _.has(blockUniverse, 'p5stim')) {
          blockUniverse.removeEnv();
          blockUniverse.removeStimWindow();
        };

        blockSetup(trial.constructionTrial, showStimulus, showBuilding);
        trial.timeSinceLastSubmit = Date.now();
        trial.timeSinceLastReset = Date.now();
        trial.nBlocksPlaced = 0;
        trial.nResetsForSubmit = 0;
        trial.nUndoForSubmit = 0;
      };

    };

    function blockSender(block_data) { // called by block_widget when a block is placed

      undoredoManager.redostack = [];
      if (!trial.finished){
        //console.log(block_data);
        
        trial.nBlocksPlaced += 1;

        if (trial.nBlocksPlaced >= trial.nBlocksMax) {
          // update block counter element

          // setTimeout(resetBuilding, 300); 
          // resetBuilding();
        };

        let timeNow = Date.now();

        curr_data = _.extend(
          block_data, 
          trial.towerDetails, 
          {
            absolute_time: timeNow,
            trial_start_time: trial.trialStartTime,
            relative_time: timeNow - trial.trialStartTime,
            datatype: 'block_placement',
            stimulus: trial.stimulus,
            condition: trial.condition,
            n_block: trial.nBlocksPlaced,
            cumulative_resets_across_submissions: trial.constructionTrial.nResets
        });

        trial.dataForwarder(curr_data);
      };

    };

    function resetSender(reset_data) { // called by block_widget when a block is placed

      if (!trial.finished){
        
        let timeNow = Date.now();

        curr_data = _.extend(
          reset_data, 
          trial.towerDetails, 
          {
            absolute_time: timeNow,
            trial_start_time: trial.trialStartTime,
            relative_time: timeNow - trial.trialStartTime,
            datatype: 'reset',
            stimulus: trial.stimulus,
            condition: trial.condition,
            n_block: trial.nBlocksPlaced,
            n_resets_for_tower: trial.nResetsForSubmit,
            cumulative_resets_across_submissions: trial.constructionTrial.nResets
        });

        trial.dataForwarder(curr_data);

      };
    };

  };

  return plugin;
})();


// class UndoRedoManager {
//   constructor() {
//     // undo stack is implicitly stored in window.blockUniverse
//     this.redostack = [];
    
//     this.events = {
//       "redo": [],
//       "undo": []
//     };
//   }

//   redo() {
//     if (this.redostack.length > 0) {
//       const block = this.redostack.pop();
//       window.blockUniverse.blocks.push(block);
//       var blockTop = block.y_index + block.blockKind.h;
//       var blockRight = block.x_index + block.blockKind.w;
//       for (let y = block.y_index; y < blockTop; y++) {
//         for (let x = block.x_index; x < blockRight; x++) {
//           window.blockUniverse.discreteWorld[x][y] = false;
//         }
//       }
//       this.events["redo"].forEach(f => f(this.getBlockData(block)));
//     }
//   }

//   undo() {
//     if (window.blockUniverse.blocks.length == 0) return;
//     const block = window.blockUniverse.blocks.pop();
//     var blockTop = block.y_index + block.blockKind.h;
//     var blockRight = block.x_index + block.blockKind.w;
//     for (let y = block.y_index; y < blockTop; y++) {
//       for (let x = block.x_index; x < blockRight; x++) {
//         window.blockUniverse.discreteWorld[x][y] = true;
//       }
//     }
//     this.redostack.push(block);
//     this.events["undo"].forEach(f => f(this.getBlockData(block)));
//   }

//   getBlockData(block) {
//     return _.extend({},
//       window.blockUniverse.getCommonData(),
//       {
//         block: block.getDiscreteBlock()
//       });
//   }

//   addEventListener(name, handler) {
//     this.events[name].push(handler);
//   }

//   removeEventListener(name, handler) {
//     if (!this.events.hasOwnProperty(name)) return;
//     const index = this.events[name].indexOf(handler);
//     if (index != -1) {
//       this.events[name].splice(index, 1)
//     }
//   }
// };