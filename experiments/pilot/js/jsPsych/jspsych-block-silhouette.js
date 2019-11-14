/**
 * jspsych-block-silhouette
 * 
 * plugin for to present a silhouette and prompt participants to reconstruct it from a set of blocks
 *
 * documentation: docs.jspsych.org
 *
 * created by Will McCarthy (wmccarth@ucsd.edu) & Judy Fan (jefan@ucsd.edu) Oct 2019
 * 
 **/

// Task performance
var deltaScore = 0; // diff in score btw end and start of phase
var nullScore = 0; // reconstruction score for blank reconstruction
var normedScore = 0; // reconstruction score for blank reconstruction
var scoreGap = 0; // difference between nullScore and perfect score (F1 = 1)
var rawScore = 0; // raw F1 score after phase end
var currBonus = 0; // current bonus increment 
var cumulBonus = 0; // cumulative bonus earned in experiment

// Metadata
var gameid = 'GAMEID_PLACEHOLDER';
var version = 'VERSION_PLACEHOLDER';

//var pct_per_sec = (1 / explore_time_limit) * 100; // if time_limit==20, that means that progress bar goes down by 5% each unit time

jsPsych.plugins["block-silhouette"] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('block-silhouette', 'stimulus', 'image');

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
      // prompt: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   pretty_name: 'Prompt',
      //   default: null,
      //   description: 'Any content here will be displayed under the buttons.'
      // },
      // explore_duration: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'build duration',
      //   default: null,
      //   description: 'How long participants will explore (or simulate) solutions.'
      // },
      // build_duration: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Trial duration',
      //   default: null,
      //   description: 'How long participants can spend building their final version of silhouette.'
      // },
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

  plugin.trial = function (display_element, trial) {

    if (typeof trial.targetBlocks === 'undefined') {
      console.error('Required parameter "target" missing in block-silhouette');
    }

    // wrapper function to show everything, call this when you've waited what you
    // reckon is long enough for the data to come back from the db
    function show_display() {

      var html = '';

      html += '<div class="container pt-1" id="experiment">'
      html += '<div class="container" id="text-bar">'
      html += `<p id="bonus-meter">Bonus: $${cumulBonus.toFixed(2)} </p>`
      html += '<p id="condition-heading">Build that structure!</p>'
      html += '<p id="timer-text">00:00</p>'
      html += '</div>'
      html += '<div class="row">'
      html += '<div class="col-md env-div" id="stimulus-window">'
      html += '</div>'
      html += '<div class="col-md env-div" id="environment-window">'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="experiment-button-col">'
      html += '<div class="col-auto ml-auto button-col" id="env-buttons">'
      html += '<button type="button" class="btn btn-success" id="done" value="done">Done</button>'
      html += '<button type="button" class="btn btn-danger" id="reset" value="reset">Reset</button>'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="trial-info">'
      html += '<div class="col align-text-center" id="trial-number">'
      //html += '<div class="progress"><div id="progress-bar"></div></div>'
      html += '</div>'
      html += '</div>'
      html += '</div>'
      if (trial.condition != 'practice'){
        html += '<div id="trial-counter"> <p2> trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + ' of ' + trial.num_trials + '</p2></div>'
      }

      // introduce occluder to make the inter-trial transitions less jarring
      html += '<div class="occluder" id="occluder-trial">'
      html += '<div><p>Ready? Click anywhere to begin.</p></div>'
      html += '</div>'

      html += '<div class="occluder" id="occluder-condition">'
      html += '<div><p>Now build the structure! Click anywhere to begin.</p></div>'
      html += '</div>'

      html += '<div class="occluder" id="occluder-practice">'
      html += '<div><p> Practice using the building environment. Click anywhere to begin.</p></div>'
      html += '</div>'

      // // display helpful info during debugging
      // if (trial.dev_mode==true) {
      //   html += '<div id="repetition"> <p> repetition: ' + trial.repetition + '</p></div>'
      //   html += '<div id="condition"> <p> condition: ' + trial.condition + '</p></div>'
      // }

      // actually assign html to display_element.innerHTML
      display_element.innerHTML = html;
      //wait to screen and moving onto next trial until you show feedback
      // jsPsych.pluginAPI.setTimeout(function () {
      //   clearP5Envs();
      //   build();
      // }, 5000);

      // // add click event listener to the image response buttons
      // for (var i = 0; i < trial.choices.length; i++) {
      //   $('#jspsych-block-silhouette-button-' + i).on('click', function(e) {
      //     var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
      //     after_response(choice);
      //   });      
      // }      

    }

    var finished_trial = false;
    // call show_display now, which includes a massive occluder that covers everything up
    show_display();

    // get html elements
    var done_button = document.getElementById("done");
    var reset_button = document.getElementById("reset");
    var occluder_practice = document.getElementById("occluder-practice");
    var occluder_trial = document.getElementById("occluder-trial");
    var occluder_condition = document.getElementById("occluder-condition");
    var condition_heading = document.getElementById("condition-heading");
    var timer_text = document.getElementById("timer-text");
    var env_divs = document.getElementsByClassName("col-md env-div");
    var progressBar = $('#progress-bar');

    // update these global metadata vars with actual values for this trial  
    gameid = trial.gameid;
    version = trial.version;

    if (trial.condition=='practice'){
      occluder_trial.style.display = "none";
    }
    else{
      occluder_practice.style.display = "none";
    }
    occluder_condition.style.display = "none";
    

    function pre_build(baseline) {
      done_button.style.display = "none";

      // mental or physical exploration
      if (trial.condition == "mental") {
        trial.phase = "mentalExplore";
        reset_button.style.display = "none";
        //p5stim, p5env = exploreMental(trial); //create p5 instances for this trial phase
        //Update trial appearance 
        condition_heading.textContent = "Think about how you will build the structure"
        Array.prototype.forEach.call(env_divs, env_div => {
          env_div.style.backgroundColor = "#FE5D26";
        });

      }
      else if (trial.condition == "physical") {
        trial.phase = "physicalExplore";
        //p5stim, p5env = explorePhysical(trial); //create p5 instances for this trial phase
        //Update trial appearance 
        condition_heading.textContent = "Practice building the structure";
        Array.prototype.forEach.call(env_divs, env_div => {
          env_div.style.backgroundColor = "#6DEBFF";
        });
      }
      // set up p5 envs
      p5stim, p5env = setupEnvs(trial);

      // get null score
      nullScore = baseline();
      scoreGap = math.subtract(1, nullScore);
      // console.log('nullScore = ', nullScore);
    }

    function build(baseline) {
      trial.phase = "build";
      // actual building phase (same for everyone)
      p5stim, p5env = setupEnvs(trial); //create p5 instances for this trial phase

      //Update trial appearance 
      done_button.style.display = "inline-block";
      reset_button.style.display = "inline-block";
      condition_heading.textContent = "Now build that structure!";
      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#75E559";
      });
      // get null score
      nullScore = baseline();
      scoreGap = math.subtract(1, nullScore);
      // console.log('nullScore = ', nullScore);
    }

    function getCurrScore() {
      // call this to get: 
      // (1) F1 score for target vs. blank at beginning of each phase
      // (2) F1 score for target vs. blank at end of each phase
      score = getScore('defaultCanvas0', 'defaultCanvas1', 0.8, 64);
      return score;
    }

    function getNormedScore(rawScore, nullScore, scoreGap) {
      // compute relative change in score
      deltaScore = math.subtract(rawScore, nullScore);
      normedScore = math.divide(deltaScore, scoreGap);
      // console.log('scoreGap = ', scoreGap.toFixed(2));
      // console.log('deltaScore = ', deltaScore.toFixed(2));
      // console.log('normedScore = ', normedScore.toFixed(2));
      return normedScore;
    }

    function convertNormedScoreToBonus(normedScore) {
      // convert normedScore (ranges between 0 and 1)
      // to bonus amount (in cents)      
      highThresh = 0.5;
      midThresh = 0.2;
      lowThresh = 0.1;
      if (normedScore > highThresh) { bonus = 0.05; }
      else if (normedScore > midThresh) { bonus = 0.03; }
      else if (normedScore > lowThresh) { bonus = 0.01; }
      else { bonus = 0; console.log('No bonus earned.') }
      return bonus;
    }

    function getBonusEarned(rawScore, nullScore, scoreGap) {
      normedScore = getNormedScore(rawScore, nullScore, scoreGap);
      bonus = convertNormedScoreToBonus(normedScore);
      console.log('bonus earned = ', bonus);
      return bonus;
    }

    var timers = [];
    // start timing
    var start_time = Date.now();
    var time_bonus = 0;

    var seconds_passed = 0;

    function timer(time_left, callback = null) {
      interval = setInterval(function () {
        timers.push(interval);
        seconds_passed += 1;

        time_left -= 1;
        minutes = parseInt(time_left / 60, 10);
        seconds = parseInt(time_left % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timer_text.textContent = minutes + ':' + seconds;

        if (time_left < 1) {
          clearInterval(interval)
          callback();
        }
      }, 1000);
    }

    function resetPressed() {
      /* Called to clear building environment window. 
      Works by resetting variables then building a new p5 instance.
      */
      sendData('reset', trial);
      resetStimWindow();
      resetEnv();

      restoreEnvs(trial);
      
      // update reset counter

    }

    function donePressed() {
      finished_trial = true;
      occluder_trial.style.display = "block"; // show occluder
      trial.trialEndTrigger = 'donePressed';
      clear_display_move_on(); // Move on jsPsych
      clearP5Envs();
    }

    function clearP5Envs() {
      // Removes P5 environments to start new experiment phase or trial
      resetEnv();
      resetStimWindow();

    }
    // Set up button event listeners
    done_button.addEventListener('click', donePressed);
    reset_button.addEventListener('click', resetPressed);

    // Start the experiment!

    if (trial.condition != 'practice') {

      // EXPLORATION PHASE
      pre_build(getCurrScore); //Setup exploration phase

      occluder_trial.addEventListener('click', event => { //SHOW OCCLUDER
        occluder_trial.style.display = "none";

        timer(trial.explore_duration, function () { //set timer for exploration phase    

          // calculate bonus earned
          rawScore = getCurrScore();
          currBonus = getBonusEarned(rawScore, nullScore, scoreGap);
          cumulBonus += parseFloat(currBonus.toFixed(2)); // TODO: this cumulBonus needs to be bundled into data sent to mongo

          // update official bonus tallies
          trial.F1Score = rawScore; 
          trial.currBonus = currBonus; // update trial var to reflect current bonus earned
          trial.score = cumulBonus; // update trial.score var to reflect cumulative bonus

          sendData('final',trial);
          //START TIMERS?
          clearP5Envs();

          // BUILD PHASE
          build(getCurrScore); // Setup build phase
          occluder_condition.style.display = "block";

          occluder_condition.addEventListener('click', event => { //SHOW OCCLUDER
            occluder_condition.style.display = "none";

            //START TIMERS?
            timer(trial.build_duration, function () { //set timer for build phase

              // calculate bonus earned
              rawScore = getCurrScore();
              currBonus = getBonusEarned(rawScore, nullScore, scoreGap);
              cumulBonus += currBonus;

              //end trial //MAKE SURE DATA SENT HERE
              occluder_trial.style.display = "block";
              clearP5Envs(); // Clear everything in P5

              if (!finished_trial) {
                // send snapshot of world after blocks have all settled
                trial.trialEndTrigger = 'timeOut';
                sendData('settled', trial);
                clear_display_move_on();  // Move on jsPsych
              }
            });
          });
        });
      });
    }
    else { // this is a practice trial
      done_button.style.display = "none";
      console.log('trial', trial);
      trial.phase == 'practice'
      p5stim, p5env = setupEnvs(trial); //create p5 instances for this trial phase
        //Update trial appearance 
      condition_heading.textContent = "Practice building";
      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#6DEBFF";
      });
      occluder_practice.addEventListener('click', event => { //SHOW OCCLUDER
        occluder_practice.style.display = "none";
        timer(trial.practice_duration, function () {
          clearP5Envs();
          trial.trialEndTrigger = 'timeOut';
          clear_display_move_on();
        });
      });
    };

    // wait for a little bit, then remove the occluder, which should be safely after everything has been rendered
    //jsPsych.pluginAPI.setTimeout(function () { $('#occluder').hide(); }, 1000);


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

      // if (trial.response_ends_trial) {
      //   end_trial();
      // }
    };

    // // function to end trial when it is time
    // function end_trial() {

    //   // kill any remaining setTimeout handlers
    //   jsPsych.pluginAPI.clearAllTimeouts();

    //   // get info from mturk
    //   var turkInfo = jsPsych.turk.turkInfo();

    //   // // prettify choices list
    //   // var prettyChoices = new Array;
    //   // _.forEach(trial.choices, function(x) {
    //   //   prettyChoices.push(x.split('/').slice(-1)[0].split('.')[0]);
    //   // });

    //   // // check if response matches target, i.e., whether response is correct
    //   // var trial_correct;
    //   // if (response.button == trial.target.shapenetid) {
    //   //   trial_correct = 1;
    //   //   increment = accuracy_bonus + parseFloat(time_bonus);
    //   //   score+= parseFloat(increment); // increment accuracy bonus and time bonus
    //   //   numCorrect += 1; // increment num correct by one
    //   // } else {
    //   //   trial_correct = 0;
    //   // }

    //   // score the built structure against the target

    //   // gather the data to store for the trial
    //   if (trial.dev_mode == true) {
    //     console.log(trial);
    //   }
    //   var trial_data = _.extend(_.omit(trial, 'on_finish'), {
    //     dbname: 'block_construction',
    //     colname: 'silhouette',
    //     gameID: trial.gameid,
    //     // rt: response.rt,        
    //     workerId: turkInfo.workerId,
    //     hitID: turkInfo.hitId,
    //     aID: turkInfo.assignmentId,
    //     timestamp: Date.now(),
    //     score: cumulBonus
    //   });

    //   if (trial.dev_mode == true) {
    //     console.log('trial data: ', trial_data);
    //   }

    //   // // show feedback
    //   // if (trial_correct==true) {
    //   //  // show feedback by drawing GREEN box around TARGET if selected CORRECTLY    
    //   //   display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #66B03B"
    //   //   // also bold/enlarge the score in bottom left corner 
    //   //   display_element.querySelector('#score p2').innerHTML = 'bonus earned: ' + parseFloat(score).toFixed(3);
    //   //   display_element.querySelector('#score p2').style.fontWeight = 'bold';
    //   // } else {
    //   //  // draw RED box around INCORRECT response and BLACK box around TARGET
    //   //  display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #282828"      
    //   //  display_element.querySelector('#jspsych-block-silhouette-button-' + response_index).style.border = "8px solid #D02B16"      
    //   // }

    // };

    // 
    function clear_display_move_on() {

      //clear all timers
      timers.forEach(interval => {
        clearInterval(interval);
      });

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial();

    };

    // // hide image if timing is set
    // if (trial.explore_duration !== null) {
    //   jsPsych.pluginAPI.setTimeout(function () {
    //     display_element.querySelector('#jspsych-block-silhouette-sketch').style.visibility = 'hidden';
    //   }, trial.sketch_duration);
    // }

    // // end trial if time limit is set
    // if (trial.build_duration !== null) {
    //   jsPsych.pluginAPI.setTimeout(function () {
    //     end_trial();
    //   }, trial.trial_duration);
    // }

  };
  return plugin;
})();
