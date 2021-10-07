/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

// const { transform } = require("lodash");

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["block-construction"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('block-construction', 'stimulus', 'image');

  plugin.info = {
    name: "block-construction",
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
      }
    },
  };

  plugin.trial = function (display_element, trial) {

    display_element.innerHTML = "";

    var html_content = "";

    // show preamble text

    html_content += '<div class="container pt-1" id="experiment">'

    /** Create domain canvas **/
    html_content += '<div class="row pt-1">'
    html_content += '<div class="col-md env-div" id="stimulus-canvas"></div>';
    html_content += '<div class=" col-md env-div" id="environment-canvas"></div>';
    html_content += '</div>'

    html_content += '<div class="col pt-3 text-right">'
    html_content += '<button id="reset-button" type="button" class="btn btn-warning">Reset</button>'
    html_content += '</div>'

    html_content += "</div>";



    display_element.innerHTML = html_content;


    if (trial.stimulus !== null) {

      trial.nBlocksPlaced = 0;

      let trialObject = {
        stimulus: trial.stimulus.blocks,
        endCondition: 'perfect-reconstruction',
        blocksPlaced: 0,
        nResets: -1, // start minus one as reset env at beginning of new trial
        //nBlocksMax: trial.nBlocksMax,
        blockSender: blockSender,
        endBuildingTrial: endTrial
      };

      var showStimulus = true;
      var showBuilding = true;
      
      blockSetup(trialObject, showStimulus, showBuilding);

      // UI
      $("#reset-button").click(() => {
        resetBuilding();
      });

      resetBuilding = function () {
        trialObject.nResets += 1; 
        trial.nBlocksPlaced = 0;

        if (_.has(blockUniverse, 'p5env') ||
          _.has(blockUniverse, 'p5stim')) {
          blockUniverse.removeEnv();
          blockUniverse.removeStimWindow();
        };

        blockSetup(trialObject, showStimulus, showBuilding);
        
      };

      resetBuilding(); // call once to clear from previous trial



    };

    // display_element
    //   .querySelector("#jspsych-survey-text-form")
    //   .addEventListener("submit", function (e) {
    //     e.preventDefault();
    //     // measure response time
    //     var endTime = performance.now();
    //     var response_time = endTime - startTime;

    //     // create object to hold responses
    //     var question_data = {};

    //     // save data
    //     var trialdata = {
    //       rt: response_time,
    //       // label: question_data["Q0"],
    //       stimId: trial.stimId,
    //       stimURL: trial.stimURL,
    //       // target: jsPsych
    //       //   .timelineVariable("target", true)
    //       //   .replace("images/", ""),
    //       // 'foil' :jsPsych.timelineVariable('foil', true).replace('images/', ''),
    //       responses: JSON.stringify(question_data),
    //     };

    //     display_element.innerHTML = "";

    //     // next trial
    //     jsPsych.finishTrial(trialdata);
    //   });

    // save data: TODO- this should be triggered when the structure is complete

    // var trialdata = {
    //   rt: response_time,
    //   // label: question_data["Q0"],
    //   stimId: trial.stimId,
    //   stimURL: trial.stimURL,
    //   // target: jsPsych
    //   //   .timelineVariable("target", true)
    //   //   .replace("images/", ""),
    //   // 'foil' :jsPsych.timelineVariable('foil', true).replace('images/', ''),
    //   responses: JSON.stringify(question_data),
    // };

    // display_element.innerHTML = "";

    // // next trial
    // jsPsych.finishTrial(trialdata);

    // var startTime = performance.now();


    function endTrial(trial_data) { // called by block_widget when trial ends
      console.log(trial_data)
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    };

    function blockSender(block_data) { // called by block_widget when a block is placed
      //console.log(block_data);
      trial.nBlocksPlaced += 1;

      if (trial.nBlocksPlaced >= trial.nBlocksMax) {
        // update block counter element
        
        // setTimeout(resetBuilding, 300); 
        // resetBuilding();
      }
      // TODO: send block data to mongo

    };

  };

  return plugin;
})();
