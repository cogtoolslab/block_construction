var callback;
var score = 0;
var numTrials = 16;
var shuffleTrials = false; // set to False to preserve order in db; set to True if you want to shuffle trials from db (scrambled10)

function sendData() {
  console.log('sending data to mturk');
  jsPsych.turk.submitToTurk({'score':score});
}

var goodbyeTrial = {
  type: 'instructions',
  pages: [
    '<p>Thanks for participating in our experiment! You are all done. Please \
     click the button to submit this HIT. <b> If a popup appears asking you if you want to leave, please say YES to LEAVE THIS PAGE and submit the HIT.</b></p>'
  ],
  show_clickable_nav: true,
  on_finish: function() { sendData();}
};

var consentHTML = {
  'str1' : '<p>In this HIT, you will see some gnarly shapes. For each shape, you will try to reconstruct it from a set of blocks. For really good reconstructions, you will receive a bonus. </p>',
  'str2' : '<p>Your total time commitment is expected to last approximately 35 minutes, including the time it takes to read these instructions. For your participation in this study, you will be paid approximately $6/hour. For very accurate performance, you may be paid an additional bonus on top of this base amount. If you begin but choose not to complete the study, please contact the researcher directly to receive prorated compensation. </p>',
  'str3' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
	    "<p id='legal'>By completing this HIT, you are participating in a study being performed by cognitive scientists in the UC San Diego Department of Psychology. The purpose of this research is to find out more about how people solve problems. You must be at least 18 years old to participate. There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this study is completely voluntary and you can withdraw at any time by simply exiting the study. You may decline to answer any or all of the following questions. Choosing not to participate or withdrawing will result in no penalty. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you. If you have questions about this research, please contact the researchers by sending an email to <b><a href='mailto://sketchloop@gmail.com'>sketchloop@gmail.com</a> </b>. These researchers will do their best to communicate with you in a timely, professional, and courteous manner. If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the UC San Diego Institutional Review Board. </p>"].join(' ')
}

// add welcome page
var instructionsHTML = {
  'str1' : "<p> Here's how the game will work: On each trial, you will see a block structure appear on the left. Your goal is to use the blocks on the right to reconstruct it using as few blocks as possible. <div><img src='images/task_display.png' id='example_screen'></div>",
  'str2' : '<p> There are 8 trials in this HIT. For really good reconstructions, you will receive a <b> bonus</b> of X.X cents.</p>',
  'str3' : "<p>If you encounter a problem or error, send us an email (sketchloop@gmail.com) and we will make sure you're compensated for your time! Please pay attention and do your best! </p><p> Note: We recommend using Chrome. We have not tested this HIT in other browsers.</p>",  
  'str4' : "<p> Once you are finished, the HIT will be automatically submitted for approval. Please know that you can only perform this HIT one time. Before we begin, please complete a brief questionnaire to show you understand how this HIT works.</p>"
};

var welcomeTrial = {
  type: 'instructions',
  pages: [
    consentHTML.str1, consentHTML.str2, consentHTML.str3, 
    instructionsHTML.str1, instructionsHTML.str2, instructionsHTML.str3, instructionsHTML.str4
  ],
  show_clickable_nav: true,
  allow_keys: false
};

var acceptHTML = {
  'str1' : '<p> Welcome! In this HIT, you will see some sketches of objects. For each sketch, you will try to guess which of the objects is the best match. </p> <p> <b> If you are interested in learning more about this HIT, please first accept the HIT in MTurk before continuing further</b>. </p>'  
}

var previewTrial = {
  type: 'instructions',
  pages: [acceptHTML.str1],
  show_clickable_nav: false,
  allow_keys: false  
}

var surveyTrial = {
  type: 'survey-text',
  questions: [
    {prompt: "Thank you for participating in our study! Any comments?",rows: 5, columns: 40, placeholder: "How was that for you? Did you notice any issues?"}
  ],
};

// define trial object with boilerplate
function Trial () {
  this.type = 'block-silhouette';
  this.iterationName = 'testing1';
  this.prompt = "Please reconstruct the tower using as few blocks as possible.";
  this.dev_mode = false;
};

function PracticeTrial () {
  this.type = 'block-silhouette';
  this.iterationName = 'testing1';
  this.prompt = "Please reconstruct the tower using as few blocks as possible.";
  this.dev_mode = false;
  this.condition = 'practice';
  this.targetBlocks = [];
  this.targetName = 'any';
};

function setupGame () {

  // number of trials to fetch from database is defined in ./app.js
  var socket = io.connect();
  

  // on_finish is called at the very very end of the experiment
  var on_finish = function(data) {
    score = data.score ? data.score : score; // updates the score variable
  };

  // Start once server initializes us
  socket.on('onConnected', function(d) {

    // contents of d
    //console.log(d);

    // get workerId, etc. from URL (so that it can be sent to the server)
    var turkInfo = jsPsych.turk.turkInfo();    

    // extra information to bind to trial list
    var additionalInfo = {
      gameID: d.gameid,
      version: d.version,
      post_trial_gap: 1000, // add brief ITI between trials
      num_trials : numTrials,
      on_finish : on_finish
    };
    
    // Bind trial data with boilerplate
    var rawTrialList = shuffleTrials ? _.shuffle(d.trials) : d.trials;
    var trials = _.flatten(_.map(rawTrialList, function(trialData, i) {
      var trial = _.extend(new Trial, trialData, additionalInfo, {
        trialNum : i
      });
      return trial
    }));

    var practiceTrial = new PracticeTrial;
    trials.unshift(practiceTrial);
    
    // Stick welcome trial at beginning & goodbye trial at end
    if (!turkInfo.previewMode) { 
      trials.unshift(welcomeTrial);
    } else {
      trials.unshift(previewTrial); // if still in preview mode, tell them to accept first.
    }
    trials.push(surveyTrial); // add debriefing survey
    trials.push(goodbyeTrial); // goodbye and submit HIT

    // print out trial list    
    //console.log(trials);
      
    jsPsych.init({
      timeline: trials,
      default_iti: 1000,
      show_progress_bar: true
    });

  });
}
