/**
 * jspsych-block-silhouette
 * 
 * plugin to present a silhouette and prompt participants to reconstruct it from a set of blocks
 * Building is preceded by a preparation phase, either purely observing, or practice building
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
var points = 0;

// Metadata
var gameID = 'GAMEID_PLACEHOLDER';
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

    // Make target a stonehenge
    //trial.targetBlocks = [{"x": 1, "y": 0, "width": 2, "height": 4}, {"x": 5, "y": 0, "width": 2, "height": 4}, {"x": 2, "y": 4, "width": 4, "height": 2}];
    trial.score = score;
    trial.points = points;
    var timers = [];
    trial.pMessingAround = 0;

    if (typeof trial.targetBlocks === 'undefined') {
      console.error('Required parameter "target" missing in block-silhouette');
    }

    // wrapper function to show everything, call this when you've waited what you
    // reckon is long enough for the data to come back from the db
    function show_display() {

      var html = '';

      html += '<div class="container pt-1" id="experiment">'
      html += '<div class="row" id="text-bar">'
      html += `<div class="col-md-auto"><p class="scores">Points: <span id="points-meter">${points}</span> </p></div>`
      html += `<div class="col-md-auto"><p class="scores">Bonus:<span id="bonus-meter">$${cumulBonus.toFixed(2)}</span> </p></div>`
      html += '<div class="col"><p id="condition-heading">Build that tower!</p></div>'
      html += '<div class="col-md-auto"><p id="timer-text">00:00</p></div>'
      html += '</div>'
      html += '<div class="row pt-1">'
      html += '<div class="col-md env-div" id="stimulus-window">'
      html += '</div>'
      html += '<div class="col-md env-div pl-2" id="environment-window">'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="experiment-button-col">'
      html += '<div class="col-auto mr-auto" id="zoom-message"><p> If windows are on top of each other, please adjust zoom until they are side by side.</p></div>'
      html += '<div class="col-auto ml-auto button-col" id="env-buttons">'
      html += '<button type="button" class="btn btn-success btn-lg" id="done" value="done">Done</button>'
      html += '<button type="button" class="btn btn-danger btn-lg" id="reset" value="reset">Reset</button>'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="trial-info">'
      html += '<div class="col align-text-center" id="trial-number">'
      //html += '<div class="progress"><div id="progress-bar"></div></div>'
      html += '</div>'
      html += '</div>'
      html += '</div>'
      if (trial.condition != 'practice') {
        html += '<div id="trial-counter"> <p> Trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + ' of ' + trial.num_trials + '</p></div>'
      }

      // introduce occluder to make the inter-trial transitions less jarring
      html += '<div class="occluder" id="occluder">'
      html += '<div><p id="occluder-text"></p></div>'
      html += '</div>'

      // // display helpful info during debugging
      // if (trial.dev_mode==true) {
      //   html += '<div id="repetition"> <p> repetition: ' + trial.repetition + '</p></div>'
      //   html += '<div id="condition"> <p> condition: ' + trial.condition + '</p></div>'
      // }

      // actually assign html to display_element.innerHTML
      display_element.innerHTML = html;

    }

    var physical_explore_text = 'Practice building the tower. Click anywhere to begin.';
    var mental_explore_text = ' Think about how you will build the tower. Click anywhere to begin.';
    var build_text = 'Now build the tower! Click anywhere to begin.';
    var practice_feedback_text = {
      'success': 'Success! Now onto the real experiment. Click anywhere to continue.',
      'failure': 'Nice try! But your tower was not quite a close enough match. Please click anywhere to try again.'
    }
    var practice_text = 'Click anywhere to begin.';

    // call show_display now, which includes a massive occluder that covers everything up
    show_display();

    // get html elements
    var done_button = document.getElementById("done");
    var reset_button = document.getElementById("reset");
    var occluder = document.getElementById("occluder");
    var occluder_text = document.getElementById("occluder-text");
    var condition_heading = document.getElementById("condition-heading");
    var timer_text = document.getElementById("timer-text");
    var env_divs = document.getElementsByClassName("col-md env-div");
    var zoom_message = document.getElementById("zoom-message");

    zoom_message.style.display = "none";
    var progressBar = $('#progress-bar');
    occluder.setAttribute('style', 'white-space: pre;');

    // update these global metadata vars with actual values for this trial  
    gameID = trial.gameID;
    version = trial.version;

    occluder.style.display = "block";

    // **** PHASES OF TRIAL ****

    function pre_build(baseline) {
      done_button.style.display = "none";
      trial.phase = 'explore';
      // mental or physical exploration
      if (trial.condition == "mental") {
        reset_button.style.display = "none";
        //p5stim, p5env = exploreMental(trial); //create p5 instances for this trial phase
        //Update trial appearance 
        occluder_text.textContent = 'Trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + ". " + mental_explore_text;
        condition_heading.textContent = "THINK"
        Array.prototype.forEach.call(env_divs, env_div => {
          env_div.style.backgroundColor = "#E23686";
        });

      }
      else if (trial.condition == "physical") {
        //p5stim, p5env = explorePhysical(trial); //create p5 instances for this trial phase
        //Update trial appearance 
        occluder_text.textContent = 'Trial ' + (parseInt(trial.trialNum) + parseInt(1)).toString() + ". " + physical_explore_text;
        condition_heading.textContent = "PRACTICE";
        Array.prototype.forEach.call(env_divs, env_div => {
          env_div.style.backgroundColor = "#4DE5F9";
        });
      }
      // set up p5 envs
      p5stim, p5env = setupEnvs(trial);

      // set null score for normed score calculation
      nullScore = baseline();
      scoreGap = math.subtract(1, nullScore);
      trial.nullScore = nullScore;
      trial.scoreGap = scoreGap;
    }

    function build(baseline) {
      trial.phase = "build";
      // actual building phase (same for everyone)
      p5stim, p5env = setupEnvs(trial); //create p5 instances for this trial phase

      //Update trial appearance 
      // done_button.style.display = "inline-block"; // for displaying done button during build
      done_button.style.display = "none";
      reset_button.style.display = "inline-block";
      occluder_text.textContent = build_text;
      condition_heading.textContent = "BUILD";
      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#FFD819";
      });

      // set null score for normed score calculation
      // nullScore = baseline();
      // scoreGap = math.subtract(1, nullScore);
      // trial.nullScore = nullScore;
      // trial.scoreGap = scoreGap;
    }

    var startPractice = function () {
      trial.buildStartTime = Date.now()
      zoom_message.style.display = "inline-block";
      occluder.style.display = "none";
      timer(trial.practice_duration, function () {
        clearP5Envs();
        clear_display_move_on();
      });
      occluder.removeEventListener('click', startPractice);
    };

    var resumePractice = function () {
      occluder.style.display = "none";
      occluder.removeEventListener('click', resumePractice);
    }



    // **** SCORING **** 

    function getCurrScore() {
      // call this to get: 
      // (1) F1 score for target vs. blank at beginning of each phase
      // (2) F1 score for target vs. blank at end of each phase
      current_score_to_return = getScore('defaultCanvas0', 'defaultCanvas1', 0.75, 64);
      return current_score_to_return;
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
      if (normedScore > trial.bonusThresholdHigh) { bonus = 0.05; }
      else if (normedScore > trial.bonusThresholdMid) { bonus = 0.03; }
      else if (normedScore > trial.bonusThresholdLow) { bonus = 0.01; }
      else { bonus = 0; console.log('No bonus earned.') }
      return bonus;
    }

    function getBonusEarned(rawScore, nullScore, scoreGap) {
      normedScore = getNormedScore(rawScore, nullScore, scoreGap);
      bonus = convertNormedScoreToBonus(normedScore);
      return bonus;
    }

    // hacky solution to obtaining scores at every block-settle event
    trial.getCurrScore = getCurrScore;
    trial.getNormedScore = (rawScore) => getNormedScore(rawScore, nullScore, scoreGap);


    // ****  TIMERS, EVENT HANDLERS **** 

    // start timing
    var start_time = Date.now();
    var time_bonus = 0;

    var seconds_passed = 0;

    function timer(time_left, callback = null) {

      var interval = setInterval(function () {
        // happens every second
        seconds_passed += 1;

        time_left -= 1;
        minutes = parseInt(time_left / 60, 10);
        seconds = parseInt(time_left % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        timer_text.textContent = minutes + ':' + seconds;

        if (time_left == 0) { // should happen once per timer
          clearInterval(interval)
          callback();
        }
      }, 1000);
      timers.push(interval);
    }

    function resetPressed() {
      /* Called to clear building environment window. 
      Works by resetting variables then building a new p5 instance.
      */
      if (trial.phase == 'explore'){
        trial.exploreResets += 1;
      } else {
        trial.buildResets += 1;
      }
      sendData('reset', trial);
      clearP5Envs();
      setupEnvs(trial);

      // update reset counter

    }

    function donePressed() {

      //scoring = true; //set global variable in ExperimentEnvironment to remove stim

      sleeping = blocks.filter((block) => block.body.isSleeping);
      allSleeping = sleeping.length == blocks.length;

      if (allSleeping) { // Only do something if world in resting state

        if (blocks.length > 0){
         sendData(eventType = 'settled', trial);
        }

        if (trial.condition == 'practice') {

          rawScore = getCurrScore();
          normedScore = getNormedScore(rawScore, nullScore, scoreGap);
          
          // jsPsych.pluginAPI.setTimeout(function () { // temporarily hide guides in build env
          //   scoring = false;
          // }, 100);


          trial.nPracticeAttempts += 1;
          trial.buildFinishTime = Date.now();
          sendData(eventType = 'trial_end', trial);
          trial.practiceAttempt += 1;

          // if-statements to be added here. Plus something that prevents multiple failures.
          practiceThreshold = 0.98;
          if (normedScore < practiceThreshold) {

            // if practice score is bad:
            // show occluder
            trial.nPracticeAttempts += 1;
            occluder_text.textContent = practice_feedback_text['failure'];
            occluder.addEventListener('click', resumePractice);

            trial.practiceSuccess = false;
            sendData('practice_attempt', trial);
            clearP5Envs();
            setupEnvs(trial);

          } else {
          // if practice score is good:
          // move on
            trial.practiceSuccess = true;
            sendData('practice_attempt', trial);
            occluder_text.textContent = practice_feedback_text['success'];
            zoom_message.style.display = "none";
            occluder.addEventListener('click', event => {
              trial.completed = true;
              endTrial(endReason = 'practice_success');
              clear_display_move_on();
            });
          };
          occluder.style.display = "block";
        }
        else { // if a normal trial, must be build phase
          if (blocks.length > 3) { //make sure they've actually built something
            trial.completed = true;
            endTrial(endReason = 'done-pressed');
            occluder_text.textContent += `Please wait for the next trial.`
            // uncomment to allow donePressed to move on to the next trial immediately
            // jsPsych.pluginAPI.setTimeout(function () {
            //   clear_display_move_on();
            // }, 2500);
          }
          else {
            condition_heading.textContent = "Please build the structure!"
            jsPsych.pluginAPI.setTimeout(function () {
              condition_heading.textContent = "BUILD"
            }, 2500);
          };
        };
      } else { // If not all blocks are stationary, then wait.
        done_button.textContent = 'Wait';
        setInterval(function () {
          sleeping = blocks.filter((block) => block.body.isSleeping);
          allSleeping = sleeping.length == blocks.length;
          if (allSleeping) {
            done_button.textContent = 'Done';
          }
        }, 500);
      }

    }

    // ****  CLEAN UP FUNCTIONS **** 

    function clearP5Envs() {
      // Removes P5 environments to start new experiment phase or trial
      removeEnv();
      removeStimWindow();
    }

    function endTrial(endReason = 'end_of_phase') {

      trial.buildFinishTime = Date.now();

      //calculate bonus earned
      rawScore = getCurrScore();
      normedScore = getNormedScore(rawScore, nullScore, scoreGap);
      trialPoints = Math.max(Math.ceil(normedScore*100), 0);

      if (trial.condition != 'practice') {
        currBonus = getBonusEarned(rawScore, nullScore, scoreGap);
        cumulBonus += parseFloat(currBonus.toFixed(2)); // TODO: this cumulBonus needs to be bundled into data sent to mongo
        points += trialPoints;
      }

      // update official bonus tallies
      trial.F1Score = rawScore;
      trial.endReason = endReason;
      trial.normedScore = normedScore;
      trial.currBonus = currBonus; // update trial var to reflect current bonus earned
      trial.score = cumulBonus; // update trial.score var to reflect cumulative bonustrial.nullScore = nullScore;
      trial.points = points;
      sendData('settled', trial);
      
      // console.log('raw: ' + rawScore);
      // console.log('null: ' + nullScore);
      // console.log('scoregap: ' + scoreGap);
      // console.log(endReason + '. Normed Score: ' + normedScore);
      // console.log(endReason + '. Bonus: ' + currBonus);

      occluder.style.fontSize = 'large';
      if (currBonus == 0.05) {
        occluder_text.textContent = `🤩 Amazing! ${trialPoints} Points! $0.05 bonus! \r\n`;
      } else if (currBonus == 0.03) {
        occluder_text.textContent = `😃 Great job! ${trialPoints} Points! $0.03 bonus! \r\n`;
      } else if (currBonus == 0.01) {
        occluder_text.textContent = `🙂 Not bad! ${trialPoints} Points! $0.01 bonus! \r\n`;
      } else {
        occluder_text.textContent = `😐 ${trialPoints} Points! Sorry, no bonus this round. \r\n`;
      }
      
      if (trial.condition != 'practice') {
        
        sendData(eventType='trial_end', trial);

        jsPsych.pluginAPI.setTimeout(function () {
          if (currBonus > 0) {    
            display_element.querySelector('#bonus-meter').style.border = "8px solid #66B03B"; 
          } else {
            display_element.querySelector('#bonus-meter').style.border = "8px solid #FFFFFF";
          }
        }, 4000);
      };

      occluder.style.display = "block";
      clearP5Envs(); // Clear everything in P5

    }

    // *** Handlers for starting experiment on mouseclick ***

    var startExplorePhase = function () { //Function needed for removeEventListener
      trial.exploreStartTime = Date.now()

      jsPsych.pluginAPI.setTimeout(function () { // change color of bonus back to white
        display_element.querySelector('#bonus-meter').style.border = "8px solid #FFFFFF";
      }, 3000);

      occluder.style.display = "none";
      occluder.removeEventListener('click', startExplorePhase);
      //console.log('timer starting for pre');
      timer(trial.explore_duration, function () { //set timer for exploration phase    
        
        sendData('explore_end', trial);
        clearP5Envs();

        // BUILD PHASE
        build(getCurrScore); // Setup build phase
        occluder.style.display = "block";

        occluder.addEventListener('click', startBuildPhase());
      });
    }

    var startBuildPhase = function () {
      trial.buildStartTime = Date.now()
      occluder.style.display = "none";
      occluder.removeEventListener('click', startBuildPhase);
      //console.log('timer starting for build');
      timer(trial.build_duration, function () { //set timer for build phase
        if (trial.completed == false) {
          trial.completed = true;
          endTrial(endReason = 'timeout'); // calculate bonuses and clear envs
        }

        jsPsych.pluginAPI.setTimeout(function () { //edit here to add punishment timeout
          if (trial.pMessingAround >= 0.8 && trial.normedScore < 0.5) {
            occluder.style.fontSize = 'large';
            occluder.textContent = "It seems like you're not trying 🤨 Waiting for an extra 30 seconds";
            jsPsych.pluginAPI.setTimeout(function () { //edit here to add punishment timeout
              clear_display_move_on();
            }, 32500);
          } else {
            clear_display_move_on();
          }
        }, 2500);

       
        
      });
    }


    // ****  BEGINNING OF TRIAL TIMELINE **** 

    // Set up button event listeners
    done_button.addEventListener('click', donePressed);
    reset_button.addEventListener('click', resetPressed);

    if (trial.condition != 'practice') {

      // EXPLORATION PHASE
      pre_build(getCurrScore); //Setup exploration phase
      occluder.style.display = "block";
      occluder.addEventListener('click', startExplorePhase);

    }
    else { // this is a practice trial
      done_button.style.display = "inline-block";
      trial.phase == 'practice';
      occluder_text.textContent = practice_text;

      p5stim, p5env = setupEnvs(trial); //create p5 instances for practice phase

      //Update trial appearance 
      condition_heading.textContent = "PRACTICE";

      Array.prototype.forEach.call(env_divs, env_div => {
        env_div.style.backgroundColor = "#FFD819";
      });

      // set null score for normed score calculation
      nullScore = getCurrScore();
      scoreGap = math.subtract(1, nullScore);
      trial.nullScore = nullScore;
      trial.scoreGap = scoreGap;

      occluder.addEventListener('click', startPractice);
    };



    function clear_display_move_on() {

      timers.forEach(interval => {
        clearInterval(interval);
      });

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial();

    };

    // // function to handle responses by the subject
    // function after_response(choice) {
    //   // console.log('after response function called');

    //   // // End timer
    //   // clearInterval(interval);
    //   // progressBar.stop();

    //   // measure rt
    //   var end_time = Date.now();
    //   var rt = end_time - start_time;
    //   response.rt = rt;

    //   // // after a valid response, the sketch will have the CSS class 'responded'
    //   // // which can be used to provide visual feedback that a response was recorded
    //   // display_element.querySelector('#jspsych-block-silhouette-sketch').className += ' responded';

    //   // // disable all the buttons after a response
    //   // for (var i = 0; i < trial.choices.length; i++) {
    //   //   $('#jspsych-block-silhouette-button-' + i).off('click');
    //   // }      

    //   // if (trial.response_ends_trial) {
    //   //   end_trial();
    //   // }
    // };

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
