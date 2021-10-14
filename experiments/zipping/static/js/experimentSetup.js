/** experimentSetup.js | Credit : WPM, YF, CW.
 * Sets up experiments from a config. Serving tihs expects a config with the following URL parameters:
  - configId: the name of the config file for the experiment.
  - experimentGroup: the name of the subdirectory containing the configs.
  - batchIndex: which batch of data to use when shuffling any stimuli.
 */

// const { forEach } = require("lodash");

function setupExperiment() {
    var urlParams = getURLParams();
    var socket = io.connect();

    // var main_on_finish = function (data) {
    //     socket.emit("currentData", data);
    //     console.log("emitting data");
    // };
    
    var workerID = urlParams.PROLIFIC_PID;
    const gameID = UUID();

    var metadata;

    getStimListFromMongo();

    function getStimListFromMongo(config, callback) { //called in experiments where stimulus subsets are stored in mongo database

      socket.emit('getStim', 
        {
          gameID: gameID,
          stimColName: expConfig.stimColName, // should check if exists (but could do above when choosing whether or not to call this function)
        }); 

      socket.on('stimulus', data => {
        console.log('received', data);
        metadata = data;
        var trialList = [];
        // setupBuildingTrials(trialList, trialList => {
            setupZippingTrials(trialList, trialList => {
                setupOtherTrials(trialList);
            });
        });
    //   });
    };

    setupBuildingTrials = function(trialList, callback) {
        /**
         * Set up building trials
         * Grabs list of ids from metadata
         * Converts to URLs
         * Loads jsons
         * 
         * TODO: 
         * - add multiple building repetitions
         * - shuffle each rep
         */

        stimURLs = _.map(metadata.building_chunks, chunk_name => {
            return metadata.chunk_building_url_stem + chunk_name.slice(-3) + '.json'
        });

        // load stimulus jsons
        getTowerStimuliJSONsFromUrls(stimURLs, stimURLsToJSONs => {

            for (let rep = 0; rep < expConfig.buildingReps; rep++) {

                // create trial objects
                var repTrials = _.map(metadata.building_chunks, chunk_name => {

                    stimURL = metadata.chunk_building_url_stem + chunk_name.slice(-3) + '.json'
                    console.log(stimURLsToJSONs[stimURL]);
                    return {
                        type: 'block-construction',
                        stimulus: stimURLsToJSONs[stimURL],
                        stimId: chunk_name.slice(-3), // number stim in S3
                        chunk_id: chunk_name, //experiment specific
                        chunk_type: chunk_name.substring(0,4),
                        stimURL: stimURL,
                        condition: metadata.condition,
                        rep: rep,
                        offset: chunk_name.substring(0,4) == 'tall' ? 5 : 4
                    }
                    
        
                });

                _.map(_.shuffle(repTrials), buildingTrial => {
                    trialList.push(buildingTrial);
                });
                
                
            };

            console.log('building trials:', trialList);

            // send to next trial setup function (setupZippingTrials)
            callback(trialList);

        });

    }


    setupZippingTrials = function(trialList, callback) {
        /**
         * Set up zipping/ perceptual test trials
         * Grabs list of ids from metadata
         * Converts to URLs
         * 
         * TODO: 
         * - shuffle each rep
         */

        var zippingBlocks = [];

        expConfig.stimDurations.forEach((stimDuration, i) => {

            const reps = {};

            // create trial objects
            // zippingTrials = _.map(metadata.zipping_trials, zipping_trial => {

                metadata.zipping_trials.forEach(zipping_trial => {
                    
                stimURL = metadata.composite_url_stem + zipping_trial.talls_name + '.png';

                let trialObj = {
                    type: 'tower-zipping',
                    stimulus: stimURL,
                    stimURL: stimURL,
                    chunk_id: zipping_trial.composite,
                    rep: zipping_trial.rep,
                    validity: zipping_trial.validity,
                    talls_name: zipping_trial.talls_name,
                    wides_name: zipping_trial.wides_name,
                    part_type: zipping_trial.part_type,
                    part_a_id: zipping_trial.part_a,
                    part_a_stimulus: metadata.chunk_zipping_url_stem + zipping_trial.part_a.slice(-3) + '.png',
                    part_a_url: metadata.chunk_zipping_url_stem + zipping_trial.part_a.slice(-3) + '.png',
                    part_b_id: zipping_trial.part_b,
                    part_b_url: metadata.chunk_zipping_url_stem + zipping_trial.part_b.slice(-3) + '.png',
                    part_b_stimulus: metadata.chunk_zipping_url_stem + zipping_trial.part_b.slice(-3) + '.png',
                    participantCondition: metadata.condition,
                    compatibleCondition: zipping_trial.compatible_condition,
                    compositeDuration: stimDuration,
                    chunkDuration: stimDuration, // set composite and chunk duration to be the same
                }

                if (!reps[zipping_trial.rep]){
                    reps[zipping_trial.rep] = [trialObj];
                } else {
                    reps[zipping_trial.rep].push(trialObj);
                };
            });

            var zippingTrials = [];

            // shuffle zipping trials
            for (const repNum in reps) {
                var repTrialsShuffled = _.shuffle(reps[repNum]);
                reps[repNum] = repTrialsShuffled;
                zippingTrials = zippingTrials.concat(repTrialsShuffled);
            };

            zippingBlocks.push(zippingTrials);

        });

        var zippingBlocksShuffled = _.shuffle(zippingBlocks);

        zippingBlocksShuffled.forEach((zippingBlock, i) => {

            // add block intro
            var blockIntro = {
                type: 'instructions',
                pages: [
                    '<p>Part 2. Starting block ' + (i+1) + ' of ' + zippingBlocksShuffled.length + '. Feel free to take a short break if you would like.</p><p>Press "M" if the small shapes can be combined to make the big one, press "Z" if not.</p><p>Press Next to start.</p>'
                ],
                show_clickable_nav: true
            };

            // add preload
            var zippingPreload = {
                type: 'preload',
                auto_preload: true,
                trials: [zippingBlock]
            };

            trialList.push(zippingPreload);
            trialList.push(blockIntro)

            // add to trial list
            zippingBlock.forEach((trial) => {
                trial.blockNumber = i;
                trialList.push(trial);
            });

        });

        callback(trialList);
    }


    /* Set up trials */

    // Instructions

    setupOtherTrials = function(trialList) {

        var instructions = {
            type: 'instructions',
            pages: [
                '<p>Thank you for participating in our experiment. It should take a total of <strong>30 minutes</strong>, including the time it takes to read these instructions. You will receive $7.50 for completing this study (approx. $15/hr).</p><p>When you are finished, the study will be automatically submitted to be reviewed for approval. You can only perform this study one time. We take your compensation and time seriously! Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: we recommend using Chrome, and putting your browser in full screen. This study has not been tested in other browsers.</p>',
                '<p>This experiment consists of two parts. In <strong>Part 1</strong>, you will see  a series of shapes, and will asked build block towers that match each shape.</p><p>The shape will appear in the window on the left. In the right window, you can click on a block to pick it up. A transparent block will appear to show you where your block will fall, and you can click again to place it in that location.</p><img src="../img/zip_demo_building.png" style="max-width: 100%"><p>Your goal is to build a single tower of exactly the same shape as is shown on the left, somewhere in the right window. Blocks cannot be moved once placed, but you can remove all of the blocks and restart by pressing the reset button. You have as long as you need to build the tower, but you will only move on to the next trial when you have perfectly copied the shape, so the faster you build it correctly the sooner you will be done with the experiment.</p>',
                '<p><strong>Part 2</strong> of the experiment does not involve any building. Instead, you will be shown different shapes, and asked to make judgements about their parts.</p><p>In each trial, you wil first see a <strong>big shape</strong>, like this one:</p><img src="../img/zip_demo_composite.png" style="max-width: 100%"><p>The big shape will quickly disappear, and you will then see <strong>two smaller shapes</strong>, like these:</p><img src="../img/zip_demo_parts_tall.png" style="max-width: 100%"><p><strong>Your task is to say whether or not the big shape could be made by combining these two small shapes.</strong> This <strong>is</strong> the case for the shapes you\'ve just seen- you could push them together to make the big shape.</p><p>In some trials the small shapes will appear side-by-side, as above. In other trials, you will two small shapes on top of each other. Here you are still saying whether or not you could combine the small shapes to make the big one. For example, these shapes could pushed together to make the big one:</p><img src="../img/zip_demo_parts_wide.png" style="max-width: 100%"></br><p>To respond, if you think the small shapes can be combined to make the big shape, you should press "M". Alternatively, if you do not think the small shapes can be combined to make the big shape, you should press "Z". We will remind you what buttons to press when you reach Part 2. Here are some examples: </p><img src="../img/zip_demo_responses.png" style="max-width: 100%"><p>After your response you will see the big shape again, with a green border if you pressed the correct button, or a red border if you pressed the wrong button. Please try to respond as quickly and accurately as possible!</p>',
                'That\'s all you need to know! Press Next to start Part 1.'

            ],
            show_clickable_nav: true
        };


        trialList.unshift(instructions)

        

        // Exit survey
        var exitSurvey = constructDefaultExitSurvey(expConfig.completionCode);

        trialList.push(exitSurvey)

        

        // initialize jspsych with timeline
        constructExperimentTimeline(trialList);

    };



    // Add all trials to timeline

    //trials.push(test_zipping_trial);

    function constructExperimentTimeline(trialList) {

        /* #### Initialize jsPsych with complete experimental timeline #### */
        jsPsych.init({
            timeline: trialList,
            show_progress_bar: true,
            default_iti: 600,
            on_trial_finish: function (trialData) {
                console.log('TRIAL DATA',trialData);
                // Merge data from a single trial with
                // variables to be uploaded with all data
                var packet = _.extend({}, trialData, {
                    // prolificId(s): TODO: Hash and store prolific ID(s) in other file
                    datatype: 'trial_end',
                    experimentName: expConfig.experimentName,
                    dbname: expConfig.dbname,
                    colname: expConfig.colname,
                    iterationName: expConfig.iterationName ? expConfig.iterationName : 'none_provided_in_config',
                    configId: expConfig.configId,
                    // condition: condition, // get from batch?
                    workerID: workerID,
                    gameID: gameID
                });

                // console.log(trialData);
                socket.emit("currentData", packet); //save data to mongo
            },
            on_finish: function () {
                window.experimentFinished = true;
                //console.log(jsPsych.data.get().values());
            },

        });
    };

}
