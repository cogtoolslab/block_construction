/** experimentSetup.js | Credit : WPM, YF, CW.
 * Sets up experiments from a config. Serving tihs expects a config with the following URL parameters:
  - configId: the name of the config file for the experiment.
  - experimentGroup: the name of the subdirectory containing the configs.
  - batchIndex: which batch of data to use when shuffling any stimuli.
 */

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
        // trialList = setupZippingTrials(trialList);
      });

      // setup building trials

        // metadata;

        // // shuffle trials
        // let shuffle = true; // TODO: make more flexible
        // var stimList;

        // if (shuffle){
        //   stimList = _.shuffle(_trials.stimNumbers);
        // } else {
        //   stimList = _trials
        // }
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

            // create trial objects
            buildingTrials = _.map(metadata.building_chunks, chunk_name => {

                stimURL = metadata.chunk_building_url_stem + chunk_name.slice(-3) + '.json'

                return {
                    type: 'block-construction',
                    stimulus: stimURLsToJSONs[stimURL],
                    chunk_id: chunk_name,
                    stimURL: stimURL
                }
    
            });

            console.log('building trials:', buildingTrials);

            // _.map(buildingTrials, buildingTrial => {
            //     trialList.push(buildingTrial);
            // })

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

        // create trial objects
        zippingTrials = _.map(metadata.zipping_trials, zipping_trial => {

            stimURL = metadata.composite_url_stem + zipping_trial.talls_name + '.png';

            return {
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
                compatible_condition: zipping_trial.compatible_condition,
                // stimulus_duration: 300,
                // trial_duration: 2000
            }

        });

        console.log('zipping trials:', zippingTrials);

        var zipping_preload = {
            type: 'preload',
            auto_preload: true,
            trials: [zippingTrials]
        };

        trialList.push(zipping_preload);

        _.map(zippingTrials, zippingTrial => {
            trialList.push(zippingTrial);
        });

        callback(trialList);
    }


    /* Set up trials */

    // Instructions

    setupOtherTrials = function(trialList) {

        var instructions = {
            type: 'instructions',
            pages: [
                'Welcome to the experiment. Click next to begin.',
                'This is the second page of instructions.',
                'This is the final page.'
            ],
            show_clickable_nav: true
        };


        // trialList.unshift(instructions)



        // Exit survey
        // var exitSurvey = ...

        // trialList.push(exitSurvey)

        

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
            on_trial_finish: function (trialData) {
                // Merge data from a single trial with
                // variables to be uploaded with all data
                var packet = _.extend({}, trialData, {
                    // prolificId(s): TODO: Hash and store prolific ID(s) in other file
                    datatype: 'trial_end',
                    experimentName: expConfig.experimentName,
                    dbname: expConfig.dbname,
                    colname: expConfig.colname,
                    iterationName: expConfig.iteration_name ? expConfig.iteration_name : 'none_provided_in_config',
                    configId: expConfig.configId,
                    // condition: condition, // get from batch?
                    workerID: workerID,
                    gameID: gameID
                });

                // console.log(trialData);
                socket.emit("currentData", packet); //save data to mongo
            },
            on_finish: function () {
                //console.log(jsPsych.data.get().values());
            },

        });
    };

}
