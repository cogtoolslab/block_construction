var callback;
var score = 0;
var numTrials = 8;
var shuffleTrials = false; // set to False to preserve order in db; set to True if you want to shuffle trials from db (scrambled10)

function sendData() {
  console.log('sending data to mturk');
  jsPsych.turk.submitToTurk({'score':score});
}

var goodbyeTrial = {
  type: 'instructions',
  pages: [
    '<p>Thanks for participating in our experiment! You are all done. Please \
     click the button to submit this HIT. <b> When the popup asks you if you want to leave, please say YES to LEAVE THIS PAGE and submit the HIT.</b></p>'
  ],
  show_clickable_nav: true,
  on_finish: function() { sendData();}
};

var consentHTML = {
  'str1' : '<p>In this HIT, you will see some cool shapes. For each shape, you will try to reconstruct it from a set of blocks. For really good reconstructions, you will receive a bonus. </p>',
  'str2' : '<p>We expect the average game to last approximately 10 minutes, including the time it takes to read instructions.</p>',
  'str3' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
	    "<p id='legal'>By completing this HIT, you are participating in a study being performed by cognitive scientists in the UC San Diego Department of Psychology. If you have questions about this research, please contact the <b>Sketchloop Admin</b> at <b><a href='mailto://sketchloop@gmail.com'>sketchloop@gmail.com</a> </b>. You must be at least 18 years old to participate. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you.</p>"].join(' ')
}

// add welcome page
var instructionsHTML = {
  'str1' : "<p> Here's how the game will work: On each trial, you will see a block structure appear on the left. Your goal is to use the blocks on the right to reconstruct it using as few blocks as possible. <div><img src='../images/recog_screen_cap.png' id='example_screen'></div>",
  'str2' : '<p> There are 8 trials in this HIT. For each correct response you make, you will receive an <b> bonus</b> of 1.5 cents.</p>',
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

// define trial object with boilerplate
function Trial () {
  this.type = 'block-silhouette';
  this.iterationName = 'testing';
  this.prompt = "Please reconstruct the tower using as few blocks as possible.";
  this.dev_mode = false;
};

function setupGame () {

  // number of trials to fetch from database is defined in ./app.js
  var socket = io.connect();

  // on_finish is called at the very very end of the experiment
  var on_finish = function(data) {
    score = data.score ? data.score : score;
    socket.emit('currentData', data);
  };

  // Start once server initializes us
  socket.on('onConnected', function(d) {

    // get workerId, etc. from URL (so that it can be sent to the server)
    var turkInfo = jsPsych.turk.turkInfo();    

    // extra information to bind to trial list
    var additionalInfo = {
      gameID: d.gameid,
      version: d.version, // dataset version: yoked, scrambled40, scrambled10
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
    
    // Stick welcome trial at beginning & goodbye trial at end
    if (!turkInfo.previewMode) { 
      trials.unshift(welcomeTrial);
    } else {
      trials.unshift(previewTrial); // if still in preview mode, tell them to accept first.
    }
    trials.push(goodbyeTrial);

    // print out trial list    
    console.log(trials);
      
    jsPsych.init({
      timeline: trials,
      default_iti: 1000,
      show_progress_bar: true
    });      

  });
}
