expConfig = {
    "experimentName": "block_construction_zipping",
    "dbname": "block_construction",
    "colname": "zipping",
    "stimColName": "zipping_post_wm_dev", // CHANGE TO ALIGN ZIPPING AND BUILDING STIMS (both silhouettes or both blocks)
    "iterationName": "post_wm_dev",
    "completionCode": "5C772792",
    "devMode": true,
    "experimentParameters": {
      "stimuliShuffleSeed": 0,
      "s3Bucket": "none_specified",
      "s3StimuliPathFormat": "none_specified",
      // "shuffleBlocksInJS": true,
      // "shuffleBlocksInJS": true, // now done in python
      "prePostZipping": true,
      "postOnly": true,
      "workingMemoryVersion": true, // if so, use different plugins
      "wmBuildingParams" : {
        "compositeExposure" : 3000,
      }
    },
    "useMasks": true,
    "maskURLStem": 'https://zipping-masks-monochrome-16x16.s3.amazonaws.com/zipping-masks-monochrome-16x16-small-',
    "compensationInfo":"<p>Thank you for participating in our experiment. It should take around <strong>20 minutes</strong> total to complete, including the time it takes to read these instructions. You will receive $5.00 for completing this study (approx. $15/hr).</p><p>When you are finished, the study will be automatically submitted to be reviewed for approval. You can only perform this study one time. We take your compensation and time seriously! Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    "sonaInfo":"<p>Thank you for participating in our experiment. It should take around <strong>30 minutes</strong> total to complete, including the time it takes to read these instructions. You can only perform this study one time.</p><p>Note: We recommend maximizing your browser window to ensure everything is displayed correctly. Please do not refresh the page or press the back button.</p>",
    "chunkDuration": 1000,
    "chunkOnset": 1000, // changed from 500 to 1000 so that 500ms composite duration doesn't go immediately to chunks
    "buildingReps": 4,
    // change instructions
    "mainInstructions": "<p>This experiment consists of <strong>Two</strong> parts. We will give you instructions for each part as they come up.<p>",
    "buildingInstructions":'<p>In this part, you will be asked to build towers of blocks from memory. You will first be shown a tower in the window on the left. After a few seconds the tower will disappear and you will be able to place blocks in the window on the right. </p><p><strong>Your goal is to perfectly reconstruct the tower, anywhere in the right window.</strong></p><img src="../img/instruction_images/zipping_building_demo_mono.gif" style="max-width: 800px"><p>To start building your tower, select a block from the bottom of the right window by clicking on it. Blocks can only be placed on the floor or on top of other blocks. When you hover your cursor over the right window a transparent block will be displayed telling you where your block will appear when you click again.</p><p>Once a block has been placed, it will not move and cannot be picked up again. If you make a mistake (or forget what the tower on the left looked like) you can press Restart to see the tower and start again.</p><p>Each tower is made from four blocks. When you have placed four blocks, your tower will be checked to see if it matches the tower on the left. If it does, you\'ll move on to the next tower. If not, you\'ll have to press Restart and try again.</p><p>You will build 16 towers, then move on to Part Two. Click Next to start.</p>',
    // "preIntro": '<p>Part <strong>One</strong>. Press Next to Continue.</p>',
    "postIntro": '<p>Great job! Now on to Part <strong>Two</strong>. In this part you\'ll be doing a different task from the one you just did. Press Next to see the instructions for this task.</p>',
    "zippingInstructions": '<p>In this part of the study you will be shown larger towers and asked to make judgements about their parts.</p><p>In each trial, you will first see a <strong>large tower</strong>, like this one:</p><img src="../img/instruction_images/composite_mono.png" style="max-width: 150px"><p>This tower will quickly <strong>disappear behind a grid of blue squares</strong>, and you then will be shown <strong>two smaller towers</strong>, that might look something like this:</p><img src="../img/instruction_images/composite_tall_valid_mono.png" style="max-width:150px"><p><strong>Your task is to say whether or not the large tower could be made by placing the two smaller towers next to each other.</strong> For example, this <i>is</i> the case for the towers you\'ve just seen- if the small towers were "pushed" together so that they were touching, it would create the same shape as the large tower above. You would respond <strong>yes ✅</strong> in this case, by pressing "YES_KEY". On the other hand, the two towers below would <i>not</i> make up the larger tower when moved together:</p><img src="../img/instruction_images/composite_tall_invalid_mono.png" style="max-width: 150px"></br><p>You would respond <strong>no ❌</strong> in this case, by pressing "NO_KEY".</p><p>Sometimes the two smaller towers will appear side by side, as they do in the examples above. In other trials, you\'ll see two towers on top of one another, like this:</p><img src="../img/instruction_images/composite_wide_valid_mono.png" style="max-width: 150px"></br><p>The task is the same- you have to decide whether the small towers can make up the larger one- but in these trials you would have to imagine whether they could be pushed together vertically to make the big tower. The small towers will always appear the right way up, which means you won\'t need to rotate them in your head to answer yes or no. But make sure you look at <strong>both</strong> towers carefully, as both parts need to be right for you to answer yes. Here are some more examples:</p><img src="../img/instruction_images/responses_mono.png" style="max-width: 500px"></br><p>Between trials, you will see be a center cross (+) on the screen so that you know where to look. When the small towers appear the cross will turn blue (<span class="blue-text">+</span>), letting you know that you can respond. <i>Please try to press the correct key as quickly as possible</i>. Once you\'ve pressed a key, you\'ll be told whether your response was right or wrong. There will be 2 blocks of 36 trials, and you will have a chance to take a quick break between each of these blocks. Press next to load the task and continue.</p>', 
    "buildingIntro": 'Part <strong>One</strong>. This is the shorter of the two parts. Press Next to continue.',
    "zippingPracticeTrials": [
      {
        'stimURL': '../img/practice_trials/practice_square_composite_mono.png',
        'part_type':'tall',
        'part_a_stimulus': '../img/practice_trials/practice_square_valid_tall_A_mono.png',
        'part_b_stimulus': '../img/practice_trials/practice_square_valid_tall_B_mono.png',
        'stimDuration': 1000,
        "chunkDuration": 10000,
        "chunkOnset": 2000,
        "validity": "valid",
      },
      {
        'stimURL': '../img/practice_trials/practice_square_composite_mono.png',
        'part_type':'wide',
        'part_a_stimulus': '../img/practice_trials/practice_square_valid_wide_A_mono.png',
        'part_b_stimulus': '../img/practice_trials/practice_square_valid_wide_B_mono.png',
        'stimDuration': 1000,
        "chunkDuration": 10000,
        "chunkOnset": 2000,
        "validity": "valid",
      },
      {
        'stimURL': '../img/practice_trials/practice_square_composite_mono.png',
        'part_type':'tall',
        'part_a_stimulus': '../img/practice_trials/practice_square_invalid_tall_A_mono.png',
        'part_b_stimulus': '../img/practice_trials/practice_square_invalid_tall_B_mono.png',
        'stimDuration': 1000,
        "chunkDuration": 10000,
        "chunkOnset": 2000,
        "validity": "invalid",
      },
      {
        'stimURL': '../img/practice_trials/practice_square_composite_mono.png',
        'part_type':'wide',
        'part_a_stimulus': '../img/practice_trials/practice_square_invalid_wide_A_mono.png',
        'part_b_stimulus': '../img/practice_trials/practice_square_invalid_wide_B_mono.png',
        'stimDuration': 1000,
        "chunkDuration": 10000,
        "chunkOnset": 2000,
        "validity": "invalid",
      },
    ], 
  }
  