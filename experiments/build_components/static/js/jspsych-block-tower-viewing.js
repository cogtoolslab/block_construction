/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

// const { transform } = require("lodash");

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["tower-viewing"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('block-construction', 'stimulus', 'image');

  plugin.info = {
    name: "tower-viewing",
    parameters: {
      domain: {
        type: jsPsych.plugins.parameterType.STRING, // Domain to display.
        default: "",
      },
      stimURL: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: "",
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.OBJECT,
        // default: {
        //   'blocks': [{ 'x': 0, 'y': 0, 'height': 2, 'width': 1 },
        //   { 'x': 2, 'y': 0, 'height': 2, 'width': 1 },
        //   { 'x': 0, 'y': 2, 'height': 1, 'width': 2 },
        //   { 'x': 2, 'y': 2, 'height': 1, 'width': 2 }]
        // },
      },
      stimId: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "None",
      },
      prompt:{
        type: jsPsych.plugins.parameterType.STRING,
        default: "",
      },
      rep: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0
      },
      offset: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: "Offset",
        default: 0,
        description: "Number of squares to right stim is displaced in stimulus."
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
        default: 4,
        description: "Number of blocks that can be placed before the trial ends or resets",
      },
      dataForwarder: {
        type: jsPsych.plugins.parameterType.OBJECT,
        pretty_name: "Function to call that forwards data to database (or otherwise)",
        default: (data) => console.log(data),
      }
    },
  };

  plugin.trial = function (display_element, trial) {

    display_element.innerHTML = "";

    var html_content = "";

    // show preamble text

    html_content += '<h5 id="prompt">'+trial.prompt+'</h5>';
    
    html_content += '<div class="container" id="experiment">';

    /** Create domain canvas **/
    html_content += '<div class="row pt-1 env-row">';
    html_content += '<div class="col env-div" id="stimulus-canvas"></div>';
    html_content += '<div class=" col env-div" id="environment-canvas"></div>';
    html_content += '</div>';

    html_content += '<div class="col pt-3 text-right">';
    html_content += '<button id="reset-button" type="button" class="btn btn-primary">Reset</button>';
    html_content += '</div>';

    html_content += "</div>";
    html_content += '<p>Use ctrl/cmd + minus-sign (-) if windows do not fit on the screen at the same time.</p>';



    display_element.innerHTML = html_content;

    trial.finished = false;

    if (trial.stimulus !== null) {

      trial.trialStartTime = Date.now();

      trial.nBlocksPlaced = 0;

      // trial.stimulus = {'blocks': [{ 'x': 0, 'y': 0, 'height': 1, 'width': 2 },
      //     { 'x': 2, 'y': 0, 'height': 2, 'width': 1 },
      //     { 'x': 0, 'y': 1, 'height': 2, 'width': 1 },
      //     { 'x': 1, 'y': 2, 'height': 1, 'width': 2 }]};

      let constructionTrial = {
        stimulus: trial.stimulus.blocks,
        endCondition: 'perfect-reconstruction-translation',
        blocksPlaced: 0,
        nResets: -1, // start minus one as reset env at beginning of new trial
        //nBlocksMax: trial.nBlocksMax,
        offset: trial.offset,
        blockSender: blockSender,
        endBuildingTrial: endTrial
      };

      trial.constructionTrial = constructionTrial;

      var showStimulus = true;
      var showBuilding = true;

      blockSetup(constructionTrial, showStimulus, showBuilding);

      // UI
      $("#reset-button").click(() => {
        resetBuilding();
      });

      resetBuilding = function () {
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

        blockSetup(constructionTrial, showStimulus, showBuilding);

      };

      resetBuilding(); // call once to clear from previous trial



    };


    function endTrial(trial_data) { // called by block_widget when trial ends

      trial_data = _.extend(trial_data, {
        trial_start_time: trial.trialStartTime,
        relative_time: Date.now() - trial.trialStartTime,
        stimURL: trial.stimURL,
        stimulus: trial.stimulus,
        stimId: trial.stimId,
        chunk_id: trial.chunk_id,
        rep: trial.rep,
        condition: trial.condition,
        chunk_type: trial.chunk_type,
        phase: trial.phase,
        zipping_trial_num: trial.zippingTrialNum,
        fixation_duration: trial.fixationDuration,
        gap_duration: trial.gapDuration,
        n_resets: trial.constructionTrial.nResets
      });

      var env_divs = document.getElementsByClassName("env-div");
      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#58CF76";
      });
      trial.finished = true;

      // window.blockUniverse.blockMenu.blockKinds = [];

      setTimeout(() => {
        display_element.innerHTML = '';
        jsPsych.finishTrial(trial_data);
      }, 1500);
      
    };

    function blockSender(block_data) { // called by block_widget when a block is placed

      if (!trial.finished){
        //console.log(block_data);
        trial.nBlocksPlaced += 1;

        if (trial.nBlocksPlaced >= trial.nBlocksMax) {
          // update block counter element

          // setTimeout(resetBuilding, 300); 
          // resetBuilding();
        }

        curr_data = _.extend(block_data, {
          trial_start_time: trial.trialStartTime,
          relative_time: Date.now() - trial.trialStartTime,
          datatype: 'block_placement',
          stimURL: trial.stimURL,
          stimulus: trial.stimulus,
          stimId: trial.stimId,
          chunk_id: trial.chunk_id,
          rep: trial.rep,
          condition: trial.condition,
          chunk_type: trial.chunk_type,
          n_block: trial.nBlocksPlaced,
          n_resets: trial.constructionTrial.nResets
        });

        trial.dataForwarder(curr_data);
      };

    };

    function resetSender(reset_data) { // called by block_widget when a block is placed

      if (!trial.finished){
        curr_data = _.extend(reset_data, {
          trial_start_time: trial.trialStartTime,
          relative_time: Date.now() - trial.trialStartTime,
          datatype: 'reset',
          stimURL: trial.stimURL,
          stimulus: trial.stimulus,
          stimId: trial.stimId,
          chunk_id: trial.chunk_id,
          rep: trial.rep,
          condition: trial.condition,
          chunk_type: trial.chunk_type,
          n_block: trial.nBlocksPlaced,
          n_resets: trial.constructionTrial.nResets
        });

        trial.dataForwarder(curr_data);

      };
    };

  };

  return plugin;
})();
