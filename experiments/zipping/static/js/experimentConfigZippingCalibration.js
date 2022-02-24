expConfig = {
    "experimentName": "block_construction_zipping",
    "dbname": "block_construction",
    "colname": "zipping_calibration",
    "stimColName": "zipping_calibration_trials", //_color
    "iterationName": "zipping_calibration_dev", // sona_pilot
    "completionCode": "5C772792",
    "devMode": true,
    "experimentParameters": {
      "stimuliShuffleSeed": 0,
      "s3Bucket": "none_specified",
      "s3StimuliPathFormat": "none_specified",
      "shuffleTrialsInJS": false,
      "shuffleBlocksInJS": false,
      "miniBlocksWithinBlock": true,
      "shuffleWithinMiniBlock": false,
    },
    "zippingPracticeTrials": [
      {
        'stimURL': '../img/practice_trials/practice_1_whole_composite.png',
        'part_type':'tall',
        'part_a_stimulus': '../img/practice_trials/practice_1_valid_tall_a.png',
        'part_b_stimulus': '../img/practice_trials/practice_1_valid_tall_b.png',
        'stimDuration': 600,
        "chunkDuration": 1000,
        "chunkOnset": 1000,
        "validity": "valid",
      },
      {
        'stimURL': '../img/practice_trials/practice_1_whole_composite.png',
        'part_type':'wide',
        'part_a_stimulus': '../img/practice_trials/practice_1_valid_wide_a.png',
        'part_b_stimulus': '../img/practice_trials/practice_1_valid_wide_b.png',
        'stimDuration': 600,
        "chunkDuration": 1000,
        "chunkOnset": 1000,
        "validity": "valid",
      },
      {
        'stimURL': '../img/practice_trials/practice_1_whole_composite.png',
        'part_type':'tall',
        'part_a_stimulus': '../img/practice_trials/practice_1_invalid_tall_a.png',
        'part_b_stimulus': '../img/practice_trials/practice_1_invalid_tall_b.png',
        'stimDuration': 600,
        "chunkDuration": 1000,
        "chunkOnset": 1000,
        "validity": "invalid",
      },
      {
        'stimURL': '../img/practice_trials/practice_1_whole_composite.png',
        'part_type':'wide',
        'part_a_stimulus': '../img/practice_trials/practice_1_invalid_wide_a.png',
        'part_b_stimulus': '../img/practice_trials/practice_1_invalid_wide_b.png',
        'stimDuration': 600,
        "chunkDuration": 1000,
        "chunkOnset": 1000,
        "validity": "invalid",
      },
    ],
    "chunkDuration": 1000,
    "chunkOnset": 500, // Increase with high stim durations (i.e. above a couple hundred ms)
    "buildingReps": 0,
    "compensationInfo":'<p>Thank you for participating in our study! We estimate that it will take around 25 minutes, including the time to read these instructions. When you are finished, the study will be automatically be submitted to SONA. You can only perform this study one time. Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: we recommend using Chrome, and putting your browser in full screen. This study has not been tested in other browsers.</p>',
    "zippingInstructions": '<p>In this study you will be shown various shapes and asked to make judgements about their parts.</p><p>The study consists of many "trials". In each trial, you will first be shown a <strong>large shape</strong>, like this one:</p><img src="../img/instruction_images/1_whole.png" style="max-width: 200px"><p>It will then disappear, and you will be shown <strong>two smaller shapes</strong>, like these:</p><img src="../img/instruction_images/1_valid_tall.png" style="max-width: 200px"><p><strong>Your task is to say whether or not the large shape could be made by placing the two smaller shapes next to each other.</strong> For example, this <i>is</i> the case for the shapes you\'ve just seen- if the small shapes were "pushed" together so that they were touching, they would make the large shape above. You would respond <strong>yes</strong> in this case, by pressing "M". On the other hand, the two shapes below would <i>not</i> make up the larger shape when moved together:</p><img src="../img/instruction_images/1_invalid_tall.png" style="max-width: 200px"></br><p>You would respond <strong>no</strong> in this case, by pressing "Z".</p><p>Sometimes the two smaller shapes will appear side by side, as they do in the examples above. In other trials, you\'ll see two shapes on top of one another, like this:</p><img src="../img/instruction_images/1_valid_wide.png" style="max-width: 200px"></br><p>The task is the same- you have to decide whether the small shapes can make up the larger one- but in these trials you would have to imagine whether they could be pushed together vertically to make the big shape. Here are some more examples:</p><img src="../img/instruction_images/example_responses.png" style="max-width: 500px"></br><p>Please try to respond as quickly and accurately as possible. After your response you will see the large shape again, with a green border if your response was correct or a red border if it was incorrect. There will be 3 blocks of 48 trials, and you will have a chance to take a break between each of these blocks.</p><p>First we\'ll give you a chance to practice the task.</p>',
    "zippingBlockIntro": 'Press Next to start the experiment.'
  }
  