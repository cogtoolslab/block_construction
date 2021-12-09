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
            setupBuildingTrials(trialList, trialList => {
                setupZippingTrials(trialList, trialList => {
                    setupOtherTrials(trialList);
                });
            });
        });
    };

    setupBuildingTrials = function (trialList, callback) {
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
                        chunk_type: chunk_name.substring(0, 4),
                        stimURL: stimURL,
                        condition: metadata.condition,
                        rep: rep,
                        offset: chunk_name.substring(0, 4) == 'tall' ? 5 : 4
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


    setupZippingTrials = function (trialList, callback) {
        /**
         * Set up zipping/ perceptual test trials
         * Grabs list of ids from metadata
         * Converts to URLs
         * 
         */

        var repeatInstructions = {
            type: 'instructions',
            pages: ['Great job! Now on to Part 2. Press Next to remind yourself of the instructions.',
                expConfig.zippingInstructions],
            show_clickable_nav: true
        };

        trialList.push(repeatInstructions);

        var zippingBlocks = [];

        // stimDurations is a list of durations provided in metadata (of the same length e.g. [32,32,32])
        metadata.stimDurations.forEach((stimDuration, i) => {

            const reps = {};

            // create trial objects
            // zippingTrials = _.map(metadata.zipping_trials, zipping_trial => {

            metadata.zipping_trials.forEach(zipping_trial => {

                stimURL = metadata.composite_url_stem + zipping_trial.composite_talls_name + '.png';

                let trialObj = {
                    type: 'tower-zipping',
                    stimulus: stimURL,
                    stimURL: stimURL,
                    composite_id: zipping_trial.composite_talls_name,
                    rep: zipping_trial.rep,
                    validity: zipping_trial.validity,
                    composite_talls_name: zipping_trial.composite_talls_name,
                    composite_wides_name: zipping_trial.composite_wides_name,
                    part_type: zipping_trial.part_type,
                    part_a_id: zipping_trial.part_a,
                    part_a_stimulus: metadata.chunk_zipping_url_stem + zipping_trial.part_a.slice(-3) + '.png',
                    part_a_url: metadata.chunk_zipping_url_stem + zipping_trial.part_a.slice(-3) + '.png',
                    part_b_id: zipping_trial.part_b,
                    part_b_url: metadata.chunk_zipping_url_stem + zipping_trial.part_b.slice(-3) + '.png',
                    part_b_stimulus: metadata.chunk_zipping_url_stem + zipping_trial.part_b.slice(-3) + '.png',
                    participantCondition: metadata.condition,
                    participantRotationName: metadata.rotation_name,
                    participantRotation: metadata.rotation,
                    stimVersion: metadata.version,
                    stimVersionInd: metadata.versionInd,
                    compatibleCondition: zipping_trial.compatible_condition,
                    compositeDuration: stimDuration,
                    gapDuration: expConfig.chunkOnset - stimDuration,
                    chunkDuration: expConfig.chunkDuration
                }

                if (!reps[zipping_trial.rep]) {
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
                    '<p>Starting block ' + (i + 1) + ' of ' + zippingBlocksShuffled.length + '. Feel free to take a short break inbetween blocks.</p><p>Press <strong>"Z" if the small shapes cannot</strong> be combined to make the big one, press <strong>"M" if they can</strong>.</p><p>Press Next to start.</p>'
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

    setupOtherTrials = function (trialList) {

        if (!expConfig.devMode) {

            var consent = {
                type: "external-html",
                url: "../html/consent-ucsd.html",
                cont_btn: "start",
            };

            var instructions = {
                type: 'instructions',
                pages: [
                    '<p>Thank you for participating in our experiment. It should take a total of <strong>30 minutes</strong>, including the time it takes to read these instructions. You will receive $7.50 for completing this study (approx. $15/hr).</p><p>When you are finished, the study will be automatically submitted to be reviewed for approval. You can only perform this study one time. We take your compensation and time seriously! Please message us if you run into any problems while completing this study, or if it takes much more time than expected.</p></br><p>Note: we recommend using Chrome, and putting your browser in full screen. This study has not been tested in other browsers.</p>',
                    expConfig.buildingInstructions,
                    expConfig.zippingInstructions,
                    'That\'s all you need to know! Press Next to start Part 1.'

                ],
                show_clickable_nav: true
            };

            trialList.unshift(instructions);
            trialList.unshift(consent);


            // Exit survey
            var exitSurvey = constructDefaultExitSurvey(expConfig.completionCode);

            trialList.push(exitSurvey)

        };

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
                console.log('TRIAL DATA', trialData);
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
