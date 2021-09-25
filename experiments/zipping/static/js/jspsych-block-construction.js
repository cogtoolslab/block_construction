/*
 * Displays a domain stimuli and prompts subject for language production.
 *
 * Requirements for towers domain.
 *  block Display widget (i.e. import blockConfig.js and blockDisplay.js above this plugin in html)
 */

var DEFAULT_IMAGE_SIZE = 200;

jsPsych.plugins["block-construction"] = (function () {
  var plugin = {};

  // jsPsych.pluginAPI.registerPreload('tower-display', 'stimulus');

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
        default: {'blocks': [{'x': 0, 'y': 0, 'height': 2, 'width': 1},
        {'x': 2, 'y': 0, 'height': 2, 'width': 1},
        {'x': 0, 'y': 2, 'height': 1, 'width': 2},
        {'x': 2, 'y': 2, 'height': 1, 'width': 2}]},
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
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Button label",
        default: "Continue",
        description: "The text that appears on the button to finish the trial.",
      },
    },
  };

  plugin.trial = function (display_element, trial) {

    display_element.innerHTML = "";

    var html_content = "";

    // show preamble text

    html_content += '<div class="container">';

    /** Create domain canvas **/
    html_content += '<div class="any-canvas" id="stimulus-canvas"></div>';
    html_content += '<div class="any-canvas" id="environment-canvas"></div>';

    html_content += "</div>";

    display_element.innerHTML = html_content;


    if (trial.stimulus !== null) {
      let targetObject = {
        targetBlocks: trial.stimulus.blocks,
      };

      console.log(targetObject);

      var showStimulus = true;
      var showBuilding = true;
      window.blockSetup(targetObject, showStimulus, showBuilding);
    }
    
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

    var startTime = performance.now();
  };

  return plugin;
})();
