expConfig = {
    "experimentName": "block_construction_build_components",
    "dbname": "block_construction",
    "colname": "build_components",
    "stimColName": "build_components_6_towers",
    "iterationName": "build_components_build_recall_prolific_pilot_6_towers",
    "completionCode": "C1C4940F",
    "devMode": true,
    "experimentParameters": { // parameters for the experiment.
      "learningITI": 1000
    },
    "prolificCompInfo":"<p>Thank you for participating in our study. It will take around <strong>15 minutes</strong> total to complete, including the time it takes to read these instructions. You will be paid $3.88 (around $15.50 per hour). You can only perform this study one time.</p><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    // "compensationInfo":"<p>Thank you for participating in our experiment. It should take a total of <strong>25 minutes</strong>, including the time it takes to read these instructions. You will receive $6.00 for completing this study (approx. $15/hr).</p><p>When you are finished, the study will be automatically submitted to be reviewed for approval. You can only perform this study one time. We take your compensation and time seriously! Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: we recommend using Chrome, and putting your browser in full screen. This study has not been tested in other browsers.</p>",
    "mainInstructions":['<p>In this study you will be presented with a series of <i>block towers</i> that look like this: </p><img src="../img/instruction_images/tower_example.png" style="max-width: 150px"><p>Afterwards, you will be asked some questions about these towers.</p> '],
    "learnPhaseInstructions":['<p>For each tower you see, you will be asked to perform one of two tasks: "<strong>LOOK</strong>" or "<strong>BUILD</strong>".</p>',
    '<p>In the "<strong>LOOK</strong>" task, you should <strong>carefully study the shape of the tower</strong>.</p><p><i>Please focus on the tower for the entire time it is on screen</i>. The tower will stay on screen for around 15 seconds, then you will automatically move on to the next tower.</p></br><img src="../img/instruction_images/look_demo.png" style="max-width: 300px">',
    '<p>In the "<strong>BUILD</strong>" task, your goal is to <strong>perfectly reconstruct the tower</strong> on the left in the window on the right.</p><p>Click to pick up blocks and click again to place them. Blocks can be placed on on the ground or on top of other blocks, and will stay where they are when placed. You can undo blocks with (ctl/cmd + z), or press the "Reset" button to start building again from scratch. You will move on to the next tower once you have perfectly copied the tower anywhere in the building window.</p></br><img src="../img/instruction_images/tower_build_demo.gif" style="max-width: 600px">',
    '<p>Remember to pay close attention to all of the towers. <em>You will be asked about them later!</em></p><p>That\'s all you need to know for now. Press Next to start.</p>'],
    "decodePhaseInstructions":['<p>Great job! Now we want to see how well you remember the towers you have just seen.</p><p>On the next screen you\'ll be shown another building window, similar to the one you were using when asked to BUILD towers before. Here though, instead of copying towers, your task is to build as many towers as you can remember from the previous part of the study. Include towers that you built and looked at: there were 6 in total. Build your towers one at a time, pressing "Submit" to save it and start a new tower.</p>',
    '<p>Once you submit a tower, it will appear at the top of the screen, and cannot be changed or deleted. You can only submit up to 6 towers, so make sure to only submit towers that you think are correct. However, if you only half-remember a tower, please do try your best to submit a tower that is as close as possible to the one remember.</p>'],
    "taskParameters": { // parameter for indivudal trial types. Majority of task parameters are set in metadata.
      "build" : {
        afterBuildPauseDuration : 3000,
        prompt : "BUILD",
        },
      "view" : {
        towerDuration : 15000, // 15s to match Wammes 2019
        prompt : "LOOK",
        },
      "buildRecall" : {
        iti : 1000,
        prompt : "BUILD",},
    },
    "trialTypes":{
      "build": "block-tower-building-undo",
      "view": "block-tower-viewing",
      "buildRecall": "block-tower-build-recall",
    }
  }
  