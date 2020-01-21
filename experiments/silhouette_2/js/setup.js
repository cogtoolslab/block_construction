var callback;
var score = 0;
var points = 0;
var numTrials = 24;
var survey_data = null;
var blockColors = ['#78878C','#791E94','#6B4623','#FF4A1C','#E85D75','#16BF51','#82203C','#F7EA31','#A','#B','#C','#D','#E','#F','#G','#H'];

var practice_duration = 600;
var build_duration = 60;

// trial order info
var numTargets = 8;
var setSize = 4;
var numReps = 2;

var dev_mode = false;

if (dev_mode) {
  practice_duration = 60;
  build_duration = 60;
}

var iterationName = 'Exp2Pilot2-test';

var randID =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//console.log(randID);
//console.log('iteration: ', iterationName);

function submit2AMT() {
  scoreToTurk = Math.max(score,cumulBonus);
  console.log('attempting to send data to mturk! score = ', scoreToTurk);
  jsPsych.turk.submitToTurk({'score':scoreToTurk});
}

var goodbyeTrial = {
  type: 'instructions',
  pages: [
    '<p>Thanks for participating in our experiment! You are all done. Please \
     click the button to submit this HIT. <b> If a popup appears asking you if you want to leave, please say YES to LEAVE THIS PAGE and submit the HIT.</b></p>'
  ],
  show_clickable_nav: true,
  on_finish: function() { submit2AMT();}
};

var consentHTML = {
  'str1' : '<p>Welcome! In this HIT, you will play a fun game in which you build block towers. </p>',
  'str2' : '<p>Your total time commitment is 30-35 minutes, including the time it takes to read these instructions. For your participation in this study, you will be paid $4. To recognize good performance, you may be paid an additional bonus on top of this base amount. If you encounter technical difficulties during the study that prevent you from completing the experiment, please email the researcher (<b><a href="mailto://sketchloop@gmail.com">sketchloop@gmail.com</a></b>) to arrange for prorated compensation. </p>',
  'str3' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
	    "<p id='legal'>By completing this HIT, you are participating in a study being performed by cognitive scientists in the UC San Diego Department of Psychology. The purpose of this research is to find out more about how people solve problems. You must be at least 18 years old to participate. There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this study is completely voluntary and you can withdraw at any time by simply exiting the study. You may decline to answer any or all of the following questions. Choosing not to participate or withdrawing will result in no penalty. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you, and any information you provide will not be shared in association with any personally identifying information. If you have questions about this research, please contact the researchers by sending an email to <b><a href='mailto://sketchloop@gmail.com'>sketchloop@gmail.com</a></b>. These researchers will do their best to communicate with you in a timely, professional, and courteous manner. If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the UC San Diego Institutional Review Board. </p>"].join(' ')
}

// add welcome page
var instructionsHTML = {
  'str1' : "<p> Here's how the game will work: On each trial, you will see the silhouette of a block tower on the left. Your goal is to reconstruct this tower in the window on the right. You will have 60 seconds. Here's an example: </p> <div><img src='assets/buildDemo.gif' id='example_screen'></div> <p>To build a tower, select a block from the menu by clicking on it. Click again to place it in the window above.</p><p> There are only a certain number of viable locations, corresponding to the grid in the background. You'll see a slightly transparent block that 'snaps' to these locations, indicating where the block will appear when you click. However, you can't place a block anywhere- once placed, blocks will be subject to gravity.</p><p>This means they can fall! If this happens, your turn will end and you'll have to wait until the next trial to continue. Here's an example:</p><div><img src='assets/failDemo.gif' id='example_screen'></div> <p> Be careful when you place blocks, as there is no way to move a block after it is placed- nor is there any way to reset your tower and start again. </p><p>Your job is to try and create the most accurate tower you can on <b>every trial</b>.</p>",
  'str2' : "<p> There are 24 trials in this HIT. In each trial you will either build a new tower, or one you've built before.</p><p>For really accurate towers, you will receive a <b> bonus</b> between $0.01 and $0.05.</p><p>You can also earn a time bonus of up to 1¢ by finishing your tower quickly, but you'll only earn this if your tower is <b>also accurate.</b></p>",
  'str3' : "<p> Once you are finished, the HIT will be automatically submitted for approval. Please know that you can only perform this HIT one time.</p><p> Note: We recommend using Chrome. We have not tested this HIT in other browsers.</p>",
  'str4' : "<p> Before we begin, let's get some practice with the building tool. On this practice trial, you will be shown the exact locations to place each block. No bonus can be earned on this practice trial. Please place the blocks precisely over these guides to ensure that you have the opportunity to proceed and participate in the experiment.</p><p>Please note that after you place a block, you will not be able to select a new block or press 'Done' until all of the blocks have come to rest. </p>",
};

var secondInstructionsHTML = {
  'str1' : "<p> From now on you will not be shown where to place each block. However, there will be a small red tick mark on the center of the floor to help you make sure your tower is in the correct location. Make sure your tower is in the same place relative to this tick mark as the tower you are copying.</p><p>All trials last 60 seconds- if you finish early please just hold tight until the next trial.</p>",
  'str2' : "<p> That's it! When you're ready click Next to begin the first trial.</p>"
}

var welcomeTrial = {
  type: 'instructions',
  pages: [
    consentHTML.str1, consentHTML.str2, consentHTML.str3, 
    instructionsHTML.str1, instructionsHTML.str2, instructionsHTML.str3, instructionsHTML.str4
  ],
  show_clickable_nav: true,
  allow_keys: false
};

var readyTrial = {
  type: 'instructions',
  pages: [secondInstructionsHTML.str1, secondInstructionsHTML.str2],
  show_clickable_nav: true,
  allow_keys: false  
}

var acceptHTML = {
  'str1' : '<p>Welcome! In this HIT, you will play a fun game in which you build block towers. </p> <p> <b> If you are interested in learning more about this HIT, please first accept the HIT in MTurk by clicking the Accept button below</b>. </p>'  
}

var previewTrial = {
  type: 'instructions',
  pages: [acceptHTML.str1],
  show_clickable_nav: false,
  allow_keys: false  
}

function MultiChoicePage () {
  this.type = 'survey-multi-choice';
  this.questions = [
    {
      prompt: "What is your sex?", 
      options: ["Male", "Female"], 
      horizontal: true,
      required: true,
      name: 'sex'
    }, 
    {
      prompt: "Which of the following did you use for this experiment?", 
      options: ["Mouse", "Trackpad", "Other"], 
      horizontal: true,
      required: true,
      name: 'inputDevice'
    },
    {
      prompt: "From 1-7, how difficult did you find this experiment? (1: very easy, 7: very hard)", 
      options: ["1","2","3","4","5","6","7"], 
      horizontal: true,
      required: true,
      name: 'difficulty'
    },
    {
      prompt: "From 1-7, how much fun was this experiment? (1: not fun at all, 7: very fun)", 
      options: ["1","2","3","4","5","6","7"],
      horizontal: true,
      required: true,
      name: 'fun'
    }    
  ];
  this.randomize_question_order = true;
};

function TextPage () {
  this.type = 'survey-text';
  this.questions = [
    {name: 'comments', prompt: "Thank you for participating in our study! We would love to hear how you found it. Any comments?", rows: 5, columns: 40, placeholder: "How was that for you? Did you notice any issues?"},
    {name: 'age', prompt: "How old are you?", placeholder: ""}, 
    {name: 'strategies', prompt: "Did you use any strategies?", rows: 5, columns: 50,  placeholder: ""}
  ];
};

var allTrialInfo = {
  randID: randID,
  iterationName: iterationName,
  practice_duration: practice_duration,
  practiceThreshold: 0.98,
  build_duration: build_duration,
  timeThresholdYellow: 30000,
  timeThresholdRed: 15000,
  score: score,
  points: points,
  bonusThresholdHigh: 0.95,
  bonusThresholdMid: 0.88,
  bonusThresholdLow: 0.75,
  numTargets: numTargets,
  setSize: setSize,
  numReps: numReps,
};

// define trial object with boilerplate
function Trial () {
  this.type = 'block-silhouette-build';
  this.prompt = "Please build the tower using as few blocks as possible.";
  this.dev_mode = dev_mode;
  this.F1Score = 0; // F1 score
  this.normedScore = 0;
  this.currBonus = 0; // current bonus
  this.cumulBonus = 0;
  this.timeBonus = 0; // current bonus
  this.nullScore = NaN;
  this.scoreGap = NaN;
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'.
  this.phase = 'NA';
  this.buildResets = 0;
  this.buildTime = 0;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
  this.timeLastPlaced = 0;
  this.timetoBuild = 0;
  this.trialBonus = 0;
  this.completed = false,
  this.nPracticeAttempts = NaN;
  this.practiceAttempt = 0;
  this.pMessingAround = 0;
  this.doNothingRepeats = 0;
  this.blockColors = blockColors;
  this.blockFell = false
};

function PracticeTrial () {
  this.type = 'block-silhouette-build';
  this.prompt = "Please build your tower using as few blocks as possible.";
  this.dev_mode = dev_mode;
  this.condition = 'practice';
  this.targetBlocks = practice_structure.blocks;
  this.targetName = 'any';
  this.F1Score = 0; // F1 score
  this.normedScore = 0;  // F1 score normed to area of structure
  this.currBonus = 0; // current bonus
  this.score = score; // cumulative bonus 
  this.points = 0;
  this.nullScore = NaN;
  this.scoreGap = NaN;
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'. 
  this.buildResets = 0; 
  this.nPracticeAttempts = 0;
  this.practiceAttempt = 0; // indexing starts at 0.
  this.trialNum = NaN;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
  this.buildTime = 0;
  this.phase = 'practice';
  this.blockColor = '#B13B00';
  this.blockColorID = 0;
};

function setupGame () {

  // number of trials to fetch from database is defined in ./app.js
  var socket = io.connect();
  
  // on_finish is called at the very very end of the experiment
  var on_finish = function(data) {    
    score = Math.max(cumulBonus, score); // updates the score variable    
    points = data.points ? data.points : points;
    //console.log('updated global score to: ', score);
    //console.log('updated global points to: ', points);
  };

  socket.on('redirect', function(d){
    window.location.href = d;
  });

  // Start once server initializes us
  socket.on('onConnected', function(d) {

    // contents of d
    //console.log(d);

    // get workerId, etc. from URL (so that it can be sent to the server)
    var turkInfo = jsPsych.turk.turkInfo(); 

    //console.log(turkInfo.workerId);

    var structures = d.trials;

    setRandomColors(structures, blockColors, numTargets = numTargets);

    session = prePostStimList(structures, numTargets = numTargets, setSize = setSize, numReps = numReps);

    // extra information to bind to trial list
    var additionalInfo = {
      gameID: d.gameid,
      version: d.versionInd,
      post_trial_gap: 1000, // add brief ITI between trials
      num_trials : session.length,
      on_finish : on_finish
    };

    // Bind trial data with boilerplate
    var rawTrialList = session;
    var trials = _.flatten(_.map(rawTrialList, function(trialData, i) {
      var trial = _.extend(new Trial, trialData, allTrialInfo, additionalInfo, {
        trialNum : i
      });
      return trial
    }));

    if (!dev_mode) {

      // insert final instructions page between practice trial and first "real" experimental trial
      trials.unshift(readyTrial);    

      // insert practice trial before the first "real" experimental trial
      var practiceTrial = _.extend(new PracticeTrial, allTrialInfo, additionalInfo, {
        trialNum : NaN
      });;

      trials.unshift(practiceTrial);
      
      // Stick welcome trial at beginning & goodbye trial at end
      if (!turkInfo.previewMode) { 
        trials.unshift(welcomeTrial);
      } else {
        trials.unshift(previewTrial); // if still in preview mode, tell them to accept first.
      }

    }

    // print out trial list    
    //console.log(trials);

    var multi_choice_page = _.extend(new MultiChoicePage, allTrialInfo, additionalInfo, {
      trialNum : NaN,
      randID: randID,
      iterationName: iterationName,
      on_finish: function(data){
        sendData(eventType = 'survey_data',  _.extend(multi_choice_page, allTrialInfo, {
          multi_choice_data: data.responses,
          text_data: survey_data.responses,
          iterationName: iterationName
        }));
      }
    });

    var text_page = _.extend(new TextPage, additionalInfo, {
      trialNum : NaN,
      randID: randID,
      iterationName: iterationName,
      on_finish: function(data){
        survey_data = data;
      }
    });

    trials.push(text_page);
    trials.push(multi_choice_page);

    
    
    trials.push(goodbyeTrial); // goodbye and submit HIT
   
      
    jsPsych.init({
      timeline: trials,
      default_iti: 1000,
      show_progress_bar: true
    });

  });
}
