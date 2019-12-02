var callback;
var score = 0;
var points = 0;
var numTrials = 16;
var shuffleTrials = false; // set to False to preserve order in db; set to True if you want to shuffle trials from db (scrambled10)
var survey_data = null;

var practice_duration = 600;
var explore_duration = 30;
var build_duration = 60;

var iterationName = 'pilot1';

var randID =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
console.log(randID);


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
  'str2' : '<p>Your total time commitment is expected to be approximately 35 minutes, including the time it takes to read these instructions. For your participation in this study, you will be paid approximately $7/hour. To recognize good performance, you may be paid an additional bonus on top of this base amount. If you encounter technical difficulties during the study that prevent you from completing the experiment, please email the researcher (<b><a href="mailto://sketchloop@gmail.com">sketchloop@gmail.com</a></b>) to arrange for prorated compensation. </p>',
  'str3' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
	    "<p id='legal'>By completing this HIT, you are participating in a study being performed by cognitive scientists in the UC San Diego Department of Psychology. The purpose of this research is to find out more about how people solve problems. You must be at least 18 years old to participate. There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this study is completely voluntary and you can withdraw at any time by simply exiting the study. You may decline to answer any or all of the following questions. Choosing not to participate or withdrawing will result in no penalty. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you, and any information you provide will not be shared in association with any personally identifying information. If you have questions about this research, please contact the researchers by sending an email to <b><a href='mailto://sketchloop@gmail.com'>sketchloop@gmail.com</a></b>. These researchers will do their best to communicate with you in a timely, professional, and courteous manner. If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the UC San Diego Institutional Review Board. </p>"].join(' ')
}

// add welcome page
var instructionsHTML = {
  'str1' : "<p> Here's how the game will work: On each trial, you will see the silhouette of a block tower on the left. Your goal is to reconstruct this tower on the right. You will be given 60 seconds to do this using as few blocks as possible. In other words, when you are finished you want both towers to look identical.</p> <div><img src='assets/buildDemo.gif' id='example_screen'></div> <p> To build your tower, first select a block from the menu by clicking on it and then click again to drop it in the environment above. You can use a block of a specific size as many times as you want. As soon as you are finished, click the Done button. </p> <p> Your tower is also subject to gravity: it can become unstable and tip over, and blocks can fall if you release them from too high up. If this happens, you can clear the whole environment by clicking the Reset button. But try to avoid doing this too many times, because you may run out of time. <p> Note that you cannot move a block once it has been placed, and there is no way to 'undo' the placement of a block apart from deleting your entire structure.</p>",
  'str2' : "<p> There are 16 different block towers you will build in this HIT. For really accurate reconstructions, you will receive a <b> bonus</b> between $0.01 and $0.05.</p>",
  'str3' : "<p> Once you are finished, the HIT will be automatically submitted for approval. Please know that you can only perform this HIT one time.</p><p> Note: We recommend using Chrome. We have not tested this HIT in other browsers.</p>",
  'str4' : "<p> Before we begin, let's get some practice with the building tool. On this practice trial, you will be shown the exact locations to place each block. Please place the blocks as precisely as you can to ensure that you have the opportunity to proceed and participate in the experiment. No bonus can be earned on this practice trial. Please note that after you place a block, you will not be able to select a new block or press 'Done' until all of the blocks have come to rest. </p>",
};

var secondInstructionsHTML = {
  'str1' : "<p> Note that in the main experiment you will not be shown where to place each block. However, there will be a small tick mark on the center of the floor to help you make sure your tower is in the correct location.</p>",
  'str2' : "<p> In the main experiment, you will also have "+explore_duration+" seconds to <b>prepare</b> before reconstructing each tower.</p> <p> During this time, you will be asked to prepare in one of two ways: <b><font color='#E23686'>THINKING</font></b> or <b><font color='#4DE5F9'>PRACTICING</font></b>. <p> This is what the <b><font color='#E23686'>THINKING</font></b> preparation phase looks like: </p><div><img src='assets/internalDemo.gif' id='example_screen'></div> You will be able to think about how you will build your tower, you will not be able to place any blocks. <p> This is what the <b><font color='#4DE5F9'>PRACTICING</font></b> preparation phase looks like: </p><div><img src='assets/externalDemo.gif' id='example_screen'></div> You will get to practice building your tower before the final building phase. </p> <p> After your preparation time is up, you will move onto the <b><font color='#FFD819'>BUILDING</font></b> phase and you will have "+build_duration+" seconds to build your tower. The more accurate your tower, the larger the bonus you will receive. If you are finished with your tower before time runs out, press 'Done' to find out how much bonus you earned for that trial.</p>",
  'str3' : "<p> To summarize, there are TWO stages in each trial: </p><p><ul style='list-style: none;'><li> 1. <b>PREPARATION,</b> either by <b><font color='#E23686'>THINKING</font></b> or by <b><font color='#4DE5F9'>PRACTICING</font></b>.</li> <li>2. <b><font color='#FFD819'>BUILDING,</font></b> when you can earn a bonus for accuracy. </li></ul> <p> That's it! Click Next to begin the first trial. </p>"
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
  pages: [secondInstructionsHTML.str1, secondInstructionsHTML.str2, secondInstructionsHTML.str3],
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
  explore_duration: explore_duration,
  practice_duration: practice_duration,
  build_duration: build_duration,
  score: score,
  points: points,
};

// define trial object with boilerplate
function Trial () {
  this.type = 'block-silhouette';
  this.prompt = "Please build the tower using as few blocks as possible.";
  this.dev_mode = false;
  this.F1Score = 0; // F1 score
  this.normedScore = 0;
  this.currBonus = 0; // current bonus
  this.nullScore = NaN;
  this.scoreGap = NaN;
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'.
  this.phase = 'NA';
  this.buildResets = 0;
  this.exploreResets = 0;
  this.exploreStartTime = 0;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
  this.trialBonus = 0;
  this.completed = false,
  this.nPracticeAttempts = NaN;
  this.practiceAttempt = 0
};

function PracticeTrial () {
  this.type = 'block-silhouette';
  this.prompt = "Please build your tower using as few blocks as possible.";
  this.dev_mode = false;
  this.condition = 'practice';
  this.targetBlocks = practice_structure.blocks;
  this.targetName = 'any';
  this.F1Score = 0; // F1 score
  this.normedScore = 0; // WANT TO RECORD THIS FOR EVERY ATTEMPT IN PRACTICE
  this.currBonus = 0; // current bonus
  this.score = score; // cumulative bonus 
  this.points = 0;
  this.nullScore = NaN;
  this.scoreGap = NaN;
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'. 
  this.buildResets = 0; 
  this.exploreResets = 0;
  this.nPracticeAttempts = 0;
  this.practiceAttempt = 0; // indexing starts at 0.
  this.trialNum = NaN;
  this.exploreStartTime = 0;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
  this.phase = 'practice'
  
};


// // define trial object with boilerplate
// function Trial () {
//   this.randID = randID;
//   this.type = 'block-silhouette';
//   this.iterationName = iterationName;
//   this.prompt = "Please build the tower using as few blocks as possible.";
//   this.dev_mode = false;
//   this.explore_duration = explore_duration; // time limit in seconds
//   this.build_duration = build_duration; // time limit in seconds
//   this.practice_duration = practice_duration; // time limit in seconds
//   this.F1Score = 0; // F1 score
//   this.normedScore = 0;
//   this.currBonus = 0; // current bonus
//   this.nullScore = NaN;
//   this.scoreGap = NaN;
//   this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'.
//   this.phase = 'NA';
//   this.completed = false;
//   this.buildResets = 0;
//   this.exploreResets = 0;
//   this.exploreStartTime = 0;
//   this.buildStartTime = 0;
//   this.buildFinishTime = 0;
//   this.trialBonus = 0;
//   this.score = score;
//   this.points = 0;
//   this.nPracticeAttempts = NaN;
//   this.practiceAttempt = 0
// };

// function PracticeTrial () {
//   this.randID = randID;
//   this.type = 'block-silhouette';
//   this.iterationName = iterationName;
//   this.prompt = "Please build your tower using as few blocks as possible.";
//   this.dev_mode = false;
//   this.condition = 'practice';
//   this.targetBlocks = practice_structure.blocks;
//   this.targetName = 'any';
//   this.explore_duration = explore_duration; // time limit in seconds
//   this.build_duration = build_duration; // time limit in seconds
//   this.practice_duration = practice_duration; // time limit in seconds
//   this.F1Score = 0; // F1 score
//   this.normedScore = 0; // WANT TO RECORD THIS FOR EVERY ATTEMPT IN PRACTICE
//   this.currBonus = 0; // current bonus
//   this.score = score; // cumulative bonus 
//   this.points = 0;
//   this.nullScore = NaN;
//   this.scoreGap = NaN;
//   this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'. 
//   this.buildResets = 0; 
//   this.exploreResets = 0;
//   this.nPracticeAttempts = 0;
//   this.practiceAttempt = 0; // indexing starts at 0.
//   this.trialNum = NaN;
//   this.exploreStartTime = 0;
//   this.buildStartTime = 0;
//   this.buildFinishTime = 0;
//   this.phase = 'practice'
  
// };

function setupGame () {

  // number of trials to fetch from database is defined in ./app.js
  var socket = io.connect();
  
  // on_finish is called at the very very end of the experiment
  var on_finish = function(data) {    
    score = Math.max(cumulBonus, score); // updates the score variable    
    points = data.points ? data.points : points;
    console.log('updated global score to: ', score);
    console.log('updated global points to: ', points);
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

    // extra information to bind to trial list
    var additionalInfo = {
      gameID: d.gameid,
      version: d.versionInd,
      post_trial_gap: 1000, // add brief ITI between trials
      num_trials : numTrials,
      on_finish : on_finish
    };

    var trialTemplates = d.trials;

    setupRandomTrialList(trialTemplates); //randomize trial order and condition

    // Bind trial data with boilerplate
    var rawTrialList = shuffleTrials ? _.shuffle(d.trials) : d.trials;
    var trials = _.flatten(_.map(rawTrialList, function(trialData, i) {
      var trial = _.extend(new Trial, trialData, allTrialInfo, additionalInfo, {
        trialNum : i
      });
      return trial
    }));

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
