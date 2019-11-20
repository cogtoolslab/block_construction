var callback;
var score = 0;
var numTrials = 16;
var shuffleTrials = false; // set to False to preserve order in db; set to True if you want to shuffle trials from db (scrambled10)

var practice_duration = 600;
var explore_duration = 5;
var build_duration = 60;

var randID =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
console.log(randID);
function submit2AMT() {
  console.log('attempting to send data to mturk! score = ', score);
  jsPsych.turk.submitToTurk({'score':score});
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
  'str1' : '<p>In this HIT, you will see some gnarly shapes. For each shape, you will try to reconstruct it from a set of blocks. For really good reconstructions, you will receive a bonus. </p>',
  'str2' : '<p>Your total time commitment is expected to last approximately 35 minutes, including the time it takes to read these instructions. For your participation in this study, you will be paid approximately $6/hour. To recognize good performance, you may be paid an additional bonus on top of this base amount. If you encounter technical difficulties during the study that prevent you from completing the experiment, please email the researcher (<b><a href="mailto://sketchloop@gmail.com">sketchloop@gmail.com</a></b>) to arrange for prorated compensation. </p>',
  'str3' : ["<u><p id='legal'>Consenting to Participate:</p></u>",
	    "<p id='legal'>By completing this HIT, you are participating in a study being performed by cognitive scientists in the UC San Diego Department of Psychology. The purpose of this research is to find out more about how people solve problems. You must be at least 18 years old to participate. There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this study is completely voluntary and you can withdraw at any time by simply exiting the study. You may decline to answer any or all of the following questions. Choosing not to participate or withdrawing will result in no penalty. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you. If you have questions about this research, please contact the researchers by sending an email to <b><a href='mailto://sketchloop@gmail.com'>sketchloop@gmail.com</a></b>. These researchers will do their best to communicate with you in a timely, professional, and courteous manner. If you have questions regarding your rights as a research subject, or if problems arise which you do not feel you can discuss with the researchers, please contact the UC San Diego Institutional Review Board. </p>"].join(' ')
}

// add welcome page
var instructionsHTML = {
  'str1' : "<p> Here's how the game will work: On each trial, you will see the silhouette of a block structure appear on the left. Your goal is to use the blocks on the right to reconstruct it using as few blocks as possible. <div><img src='assets/task_display.png' id='example_screen'></div>",
  'str2' : "<p> There are 16 trials in this HIT. For really accurate reconstructions, you can receive a <b> bonus</b> of up to $0.05 per trial.</p>",
  'str3' : "<p> If you encounter a problem or error, send the researchers an email (sketchloop@gmail.com) to arrange for prorated compensation. Please pay attention and do your best! </p><p> Note: We recommend using Chrome. We have not tested this HIT in other browsers.</p>",  
  'str4' : "<p> Once you are finished, the HIT will be automatically submitted for approval. Please know that you can only perform this HIT one time.</p>",
  'str5' : "<p> Before we begin, you will get some practice with the reconstruction task. On this practice trial, you will be shown the exact locations to place each block. Please do your best on this practice trial to ensure that you have the opportunity to proceed and participate in the experiment. Also, you might notice that you can't place blocks or press 'Done' until all the blocks have come to rest.</p>"
};

var secondInstructionsHTML = {
  'str1' : "<p> Great job! If you make a structure that good in the following trials then you will earn a bonus! Remember that in these ones there will be no guides to help you.</p>",
  'str2' : "<p> There is another difference between the real trials and the practice. Before reconstructing the silhouette, you will have the opportunity to think about the structure you are going to build.</p><p>In some trials the border will go <b><font color='#FE5D26'>red</font></b>, meaning you should think about how best to make the structure.</p><p>In other trials, the border will go <b><font color='#6DEBFF'>blue</font></b>. This means that you can also test out structures.</p><p>After you have either tested structures or thought about what you are going to do the trial will advance to the reconstruction stage. Here the border will go <b><font color='#75E559'>green</font></b>, and you will have a limited time to build the structure. Its only in this stage that your structure will be evaluated for a bonus. You'll get feedback after you press 'Done'.</p>",
  'str3' : "<p> To summarize: there will be two stages in each trial- where first you plan (either by thinking or by building), and then you build for real. There will be reminders throughout. </p><p> Continue when you are ready to begin the experiment.</p>"
}

var welcomeTrial = {
  type: 'instructions',
  pages: [
    consentHTML.str1, consentHTML.str2, consentHTML.str3, 
    instructionsHTML.str1, instructionsHTML.str2, instructionsHTML.str3, instructionsHTML.str4, instructionsHTML.str5
  ],
  show_clickable_nav: true,
  allow_keys: true
};

var readyTrial = {
  type: 'instructions',
  pages: [secondInstructionsHTML.str1, secondInstructionsHTML.str2, secondInstructionsHTML.str3],
  show_clickable_nav: true,
  allow_keys: true  
}

var acceptHTML = {
  'str1' : '<p> In this HIT, you will see some gnarly shapes. For each shape, you will try to reconstruct it from a set of blocks. </p> <p> <b> If you are interested in learning more about this HIT, please first accept the HIT in MTurk before continuing further</b>. </p>'  
}

var previewTrial = {
  type: 'instructions',
  pages: [acceptHTML.str1],
  show_clickable_nav: false,
  allow_keys: true  
}

var surveyTrial = {
  type: 'survey-text',
  questions: [
    {prompt: "Thank you for participating in our study! Any comments?",rows: 5, columns: 40, placeholder: "How was that for you? Did you notice any issues?"}
  ],
};

// define trial object with boilerplate
function Trial () {
  this.randID = randID;
  this.type = 'block-silhouette';
  this.iterationName = 'testing1';
  this.prompt = "Please reconstruct the tower using as few blocks as possible.";
  this.dev_mode = false;
  this.explore_duration = explore_duration; // time limit in seconds
  this.build_duration = build_duration; // time limit in seconds
  this.practice_duration = practice_duration; // time limit in seconds
  this.F1Score = 0; // F1 score
  this.normedScore = 0;
  this.currBonus = 0; // current bonus
  this.cumulBonus = 0; // cumulative bonus  
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'.
  this.phase = 'NA';
  this.completed = false;
  this.resets = 0;
  this.exploreStartTime = 0;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
  this.trialBonus = 0;
  this.cumulBonus = 0;
  this.nPracticeAttempts = NaN;
  this.practiceAttempt = 0;
};

function PracticeTrial () {
  this.randID = randID;
  this.type = 'block-silhouette';
  this.iterationName = 'testing1';
  this.prompt = "Please reconstruct the tower using as few blocks as possible.";
  this.dev_mode = false;
  this.condition = 'practice';
  this.targetBlocks = practice_structure.blocks;
  this.targetName = 'any';
  this.explore_duration = explore_duration; // time limit in seconds
  this.build_duration = build_duration; // time limit in seconds
  this.practice_duration = practice_duration; // time limit in seconds
  this.F1Score = 0; // F1 score
  this.normedScore = 0; // WANT TO RECORD THIS FOR EVERY ATTEMPT IN PRACTICE
  this.currBonus = 0; // current bonus
  this.cumulBonus = 0; // cumulative bonus 
  this.endReason = 'NA'; // Why did the trial end? Either 'timeOut' or 'donePressed'. 
  this.resets = 0; 
  this.nPracticeAttempts = 0;
  this.practiceAttempt = 0; // indexing starts at 0.
  this.trialNum = NaN;
  this.exploreStartTime = 0;
  this.buildStartTime = 0;
  this.buildFinishTime = 0;
};

function setupGame () {

  // number of trials to fetch from database is defined in ./app.js
  var socket = io.connect();
  

  // on_finish is called at the very very end of the experiment
  var on_finish = function(data) {    
    score = data.score ? data.score : score; // updates the score variable    
    console.log('updated global score to: ', score);
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
      version: d.versionInd,
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

    // insert final instructions page between practice trial and first "real" experimental trial
    trials.unshift(readyTrial);    

    // insert practice trial before the first "real" experimental trial
    var practiceTrial = new PracticeTrial;
    //trials.unshift(practiceTrial);
    
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
