/**
 * jspsych-block-silhouette
 * 
 * plugin for to present a silhouette and prompt participants to reconstruct it from a set of blocks
 *
 * documentation: docs.jspsych.org
 *
 * created by Will McCarthy & Judy Fan (wmccarth@ucsd.edu) Oct 2019
 * 
 **/

var score = 0; // initial score set to 0
// var numCorrect = 0; // initial num correct set to 0
// var accuracy_bonus = 0.015; // max accuracy bonus
// var max_time_bonus = 0.005; // max speed bonus
// var time_limit = 20; // time limit in seconds
// var pct_per_sec = (1/time_limit) * 100; // if time_limit==20, that means that progress bar goes down by 5% each unit time
// var decrement_per_sec = max_time_bonus/time_limit; // how much time bonus goes down per second

jsPsych.plugins["block-silhouette"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('block-silhouette', 'button_html', 'image');

  plugin.info = {
    name: 'block-silhouette',
    description: '',
    parameters: {
      targetBlocks: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'list of blocks comprising target structure'
      },
      targetName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'nickname for target structure'
      },      
      button_html: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Button HTML',
        default: '<img src="%imageURL%" height="224" width="224">',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the buttons.'
      },
      explore_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'build duration',
        default: null,
        description: 'How long participants will explore (or simulate) solutions.'
      },
      build_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long participants can spend building their final version of silhouette.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if(typeof trial.targetBlocks === 'undefined'){
      console.error('Required parameter "target" missing in block-silhouette');
    }

    // wrapper function to show everything, call this when you've waited what you
    // reckon is long enough for the data to come back from the db
    function show_display() {

      // //display buttons
      // var buttons = [];
      // if (Array.isArray(trial.button_html)) {
      //   if (trial.button_html.length == trial.choices.length) {
      //     buttons = trial.button_html;
      //   } else {
      //     console.error('Error in block-silhouette plugin. The length of the button_html array does not equal the length of the choices array');
      //   }
      // } else {
      //   for (var i = 0; i < trial.choices.length; i++) {
      //     buttons.push(trial.button_html);
      //   }
      // }

      //show prompt if there is one
      if (trial.prompt !== null) {
        var html = '<div id="prompt">' +trial.prompt + '</div>';
      }

      // html += '<div class="progress"><div id="progress-bar"></div></div>'

      // // display sketch (image)
      // html += '<div style="margin-top:20px"><img id="jspsych-block-silhouette-sketch" src="'+ trial.sketch_url +'"></img></div>';

      // html += '<div id="jspsych-block-silhouette-btngroup">';

      // // embed images inside the response button divs
      // for (var i = 0; i < trial.choices.length; i++) {
      //   var str = buttons[i].replace(/%imageURL%/g, trial.choices[i]);
      //   var object_id = trial.choices[i].split('/').slice(-1)[0].split('.')[0]; // splice to extract only shapenetID and target_status
      //   html += '<div class="jspsych-block-silhouette-button" style="display: inline-block; margin : 0" id="jspsych-block-silhouette-button-' + i +'" data-choice="'+object_id+'">'+str+'</div>'; //'+trial.margin_horizontal+' '+trial.margin_vertical+'"
      // }

      // html += '</div>';
      
      // // display score earned so far
      // html += '<div id="score"> <p2> bonus earned: ' + parseFloat(score).toFixed(3) + '</p2></div>'
      // html += '<div id="trial-counter"> <p2> trial ' + (parseInt(trial.trialNum)+parseInt(1)).toString() + ' of ' + trial.num_trials + '</p2></div>'

      // introduce occluder to make the inter-trial transitions less jarring
      html += '<div id="occluder"> </div>'

      // // display helpful info during debugging
      // if (trial.dev_mode==true) {
      //   html += '<div id="repetition"> <p> repetition: ' + trial.repetition + '</p></div>'
      //   html += '<div id="condition"> <p> condition: ' + trial.condition + '</p></div>'
      // }

      // actually assign html to display_element.innerHTML
      display_element.innerHTML = html;

      // // add click event listener to the image response buttons
      // for (var i = 0; i < trial.choices.length; i++) {
      //   $('#jspsych-block-silhouette-button-' + i).on('click', function(e) {
      //     var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
      //     after_response(choice);
      //   });      
      // }      

    }

    // call show_display now, which includes a massive occluder that covers everything up
    show_display();

    // wait for a little bit, then remove the occluder, which should be safely after everything has been rendered
    jsPsych.pluginAPI.setTimeout(function() {$('#occluder').hide();},1000);

    // start timing
    var start_time = Date.now();
    var progressBar = $('#progress-bar');
    var time_bonus = 0;
    
    // progressBar.show();
    // var widthPct = 100 // starts at 105% b/c of the 1000ms delay above before occluder disappears
    // var seconds_passed = 0;
    // var interval = setInterval(function(){
    //   seconds_passed += 1;
    //   widthPct -= pct_per_sec; // goes down by 5% each second
    //   progressBar.animate({ width: widthPct + '%' }, 1000, "linear");
    //   if (widthPct <= 0) {
    //     clearInterval(interval);
    //   }
    // }, 1000);

    // store response
    var response = {
      rt: null,
      button: null,
      time_bonus: null
    };

    // function to handle responses by the subject
    function after_response(choice) {
      // console.log('after response function called');
      
      // // End timer
      // clearInterval(interval);
      // progressBar.stop();
      
      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.rt = rt;

      // // after a valid response, the sketch will have the CSS class 'responded'
      // // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#jspsych-block-silhouette-sketch').className += ' responded';

      // // disable all the buttons after a response
      // for (var i = 0; i < trial.choices.length; i++) {
      //   $('#jspsych-block-silhouette-button-' + i).off('click');
      // }      

      if (trial.response_ends_trial) {
        end_trial();  
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // get info from mturk
      var turkInfo = jsPsych.turk.turkInfo();

      // // prettify choices list
      // var prettyChoices = new Array;
      // _.forEach(trial.choices, function(x) {
      //   prettyChoices.push(x.split('/').slice(-1)[0].split('.')[0]);
      // });

      // // check if response matches target, i.e., whether response is correct
      // var trial_correct;
      // if (response.button == trial.target.shapenetid) {
      //   trial_correct = 1;
      //   increment = accuracy_bonus + parseFloat(time_bonus);
      //   score+= parseFloat(increment); // increment accuracy bonus and time bonus
      //   numCorrect += 1; // increment num correct by one
      // } else {
      //   trial_correct = 0;
      // }

      // gather the data to store for the trial
      if (trial.dev_mode == true) {
        console.log(trial);
      }
      var trial_data = _.extend(_.omit(trial, 'on_finish'), {
          dbname: 'block_construction',
          colname: 'silhouette',
          // rt: response.rt,
          // correct: trial_correct,
          // numCorrectSoFar: numCorrect,
          // original_correct: trial.outcome,
          // stim_mongo_id: trial._id,
          // response: response.button,
          // score: score,
          // workerId: turkInfo.workerId,
          // hitID: turkInfo.hitId,
          // aID: turkInfo.assignmentId,
          timestamp: Date.now()
      });

      if (trial.dev_mode == true) {
        console.log('trial data: ', trial_data);
        console.log('correct?  ', trial_correct);
      }

    // // get location index of target
    // target_index = _.indexOf(prettyChoices, trial.target.shapenetid);
    // response_index = _.indexOf(prettyChoices, response.button);
    // if (trial.dev_mode == true) {
    //   console.log('target_index: ', target_index); 
    //   console.log('response_index: ', response_index); 
    // }

    // // show feedback
    // if (trial_correct==true) {
    //  // show feedback by drawing GREEN box around TARGET if selected CORRECTLY    
    //   display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #66B03B"
    //   // also bold/enlarge the score in bottom left corner 
    //   display_element.querySelector('#score p2').innerHTML = 'bonus earned: ' + parseFloat(score).toFixed(3);
    //   display_element.querySelector('#score p2').style.fontWeight = 'bold';
    // } else {
    //  // draw RED box around INCORRECT response and BLACK box around TARGET
    //  display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #282828"      
    //  display_element.querySelector('#jspsych-block-silhouette-button-' + response_index).style.border = "8px solid #D02B16"      
    // }

    // // wait to screen and moving onto next trial until you show feedback
    // jsPsych.pluginAPI.setTimeout(function() {
    //                   clear_display_move_on(trial_data);},2000);      

    };

    // 
    function clear_display_move_on(trial_data) {
      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

    // hide image if timing is set
    if (trial.explore_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-block-silhouette-sketch').style.visibility = 'hidden';
      }, trial.sketch_duration);
    }

    // end trial if time limit is set
    if (trial.build_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
