expConfig = {
    "experimentName": "block_construction_build_components",
    "dbname": "block_construction",
    "colname": "build_components",
    "stimColName": "build_components_pilot",
    "iterationName": "build_components_pilot_2",
    "completionCode": "CWRO95FQ",
    "devMode": false,
    "experimentParameters": { // parameters for the experiment.
      "learningITI": 1000
    },
    "sonaCompInfo":"<p>Thank you for participating in our study. It will take around <strong>15 minutes</strong> total to complete, including the time it takes to read these instructions. You will be paid $3.75 (around $15 per hour). You can only perform this study one time.</p><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    // "compensationInfo":"<p>Thank you for participating in our experiment. It should take a total of <strong>25 minutes</strong>, including the time it takes to read these instructions. You will receive $6.00 for completing this study (approx. $15/hr).</p><p>When you are finished, the study will be automatically submitted to be reviewed for approval. You can only perform this study one time. We take your compensation and time seriously! Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: we recommend using Chrome, and putting your browser in full screen. This study has not been tested in other browsers.</p>",
    "mainInstructions":['<p>In this study you will first be presented with a series of block towers that look like this: </p><img src="../img/instruction_images/tower_example.png" style="max-width: 150px"><p> Afterwards, you will be asked some questions about the towers.</p> '],
    "learnPhaseInstructions":['<p>For each tower you see, you could be asked to perform one of two tasks: "<strong>LOOK</strong>" or "<strong>BUILD</strong>".</p>',
    '<p>In the "<strong>LOOK</strong>" task, you should <strong>carefully study the shape of the tower</strong>.</p><p><em>Please focus on the tower for the entire time it is on screen</em>. The tower will stay on screen for around 15 seconds, then you will automatically move on to the next tower.</p><img src="../img/instruction_images/look_demo.png" style="max-width: 300px">',
    '<p>In the "<strong>BUILD</strong>" task, your goal is to <strong>perfectly reconstruct the tower</strong> in the window on the right.</p><p>Click to pick up blocks and click again to place them. Blocks can be placed on on the ground or on top of other blocks, and will stay where they are when placed. Be careful though, because you cannot undo blocks or move them once they are placed. If you make a mistake, press the "Reset" button to start building again from scratch. You will move on to the next tower once you have perfectly copied the tower anywhere in the building window.</p><img src="../img/instruction_images/tower_build_demo.gif" style="max-width: 600px">',
    '<p>Remember to pay close attention to all of the towers, as you will be asked about them later!</p><p>That\'s all you need to know. Press Next to start.</p>'],
    "recallPhaseInstructions":['<p>Great job! Now we want to see how well you remember the towers you have just seen. You will be shown towers, one by one, and asked whether they are "<strong>old</strong>" or "<strong>new</strong>".</p><p>If you <strong>have seen the tower before</strong>, either when looking or building, press "<strong>OLD_KEY</strong>" to respond "<strong>old</strong>".</br>If you <strong>have not seen the tower before</strong>, press "<strong>NEW_KEY</strong>" to respond "<strong>new</strong>".</p><p>The towers you see in this part of the study will be <em>very similar</em> to each other. However, you won\'t see the same tower more than once in this part, so you should only answer "old" if you think you saw the tower in the previous part of the study. If you are unsure, please make your best guess.</p>'],
    "taskParameters": { // parameter for indivudal trial types. Majority of task parameters are set in metadata.
      "build" : {
        afterBuildPauseDuration : 3000,
        prompt : "BUILD",
        },
      "view" : {
        towerDuration : 15000, // 15s to match Wammes 2019
        prompt : "LOOK",
        },
      "oldNew" : {
        iti : 1000,
        prompt : "old or new?",},
    },
    "trialTypes":{
      "build": "block-tower-building",
      "view": "block-tower-viewing",
      "oldNew": "block-tower-old-new",
    }
  }
  