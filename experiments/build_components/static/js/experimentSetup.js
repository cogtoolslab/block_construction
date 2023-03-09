/** experimentSetup.js | Credit : WPM, YF, CW.
 * Sets up experiments from a config. Serving tihs expects a config with the following URL parameters:
  - configId: the name of the config file for the experiment.
  - experimentGroup: the name of the subdirectory containing the configs.
  - batchIndex: which batch of data to use when shuffling any stimuli.
 */

function setupExperiment() {
    var urlParams = getURLParams();
    var socket = io.connect();

    // var workerID = urlParams.PROLIFIC_PID;
    var workerID = urlParams.PROLIFIC_PID ? urlParams.PROLIFIC_PID : (urlParams.SONA_ID ? urlParams.SONA_ID : null)
    var studyLocation = urlParams.PROLIFIC_PID ? 'Prolific' : (urlParams.SONA_ID ? 'SONA' : null)
    const gameID = UUID();

    var metadata;
    var trialNumCounter = 0; //

    getStimListFromMongo();

    function getStimListFromMongo(config, callback) { //called in experiments where stimulus subsets are stored in mongo database

        socket.emit('getStim',
            {
                gameID: gameID,
                stimColName: expConfig.stimColName,
            });

        socket.on('stimulus', data => {
            console.log('received metadata', data);
            metadata = data;
            var trialList = [];

            // randomize key assignments
            metadata.response_key_list = _.shuffle(['m','z']);
            metadata.response_key_dict = {
                'new': metadata.response_key_list[0],
                'old': metadata.response_key_list[1]
            }
            metadata.response_key_invert = _.invert(metadata.response_key_dict)
            // console.log(metadata.response_key_dict);

            window.currTrialNum = 0; // keep track of current trial across experiment
            window.decodeTrialNum = 0;
            window.totalTrials = metadata.trials.length;

            setTimeout(() =>{
                sendMetadata(metadata);
            }, 500);

            // setupLearnPhase(trialList, trialList => {
                setupDecodePhase(trialList, trialList => {
                    setupOtherTrials(trialList);
                });
            // });
        });
    };

    setupLearnPhase = function (trialList, callback){
        /**
         * Create different trial types based on metadata received plus additional parameters in config
         * Towers from all conditions except foil should be converted into trials
         */

        // find non-foil trials
        encodeTrialMetadata = _.filter(metadata.trials, (trial) => trial['condition'] != 'foil');
        
        window.totalencodeTrials = encodeTrialMetadata.length;

        // console.log(encodeTrialMetadata);
        
        // map metadatumToTrial
        encodeTrials = _.map(encodeTrialMetadata, trialMetadatum => {
            return metadatumToLearningTrial(trialMetadatum)
        });

        // randomize order learning trials
        // TODO: checks on randomization
        // encodeTrials = _.shuffle(encodeTrials).slice(0, 6); // display first 6 learn trials
        encodeTrials = _.shuffle(encodeTrials);

        encodeTrials = psuedoRandomizeTrials(encodeTrials,
            (ts) => { return (longestSubsequence(_.map(ts, ( t ) => {return t['condition']})) <= 3)});

        encodeTrials.forEach(trial => {
            trialNumCounter += 1;
            trial['trialNum'] = trialNumCounter;
        });

        // add phase instructions
        learnPhaseInstructions = makeInstructions(expConfig['learnPhaseInstructions']);

        // append learning trials to (empty) trialList
        trialList = _.concat(trialList,
                             learnPhaseInstructions,
                             encodeTrials);

        // forward trial list to next setup function
        callback(trialList);
    };

    metadatumToLearningTrial = function(metadatum) {
        /**
         * Augments trial information from metadatum with parameters in config
         */

        // trial type determined by condition when learning, otherwise it is an oldNew trial
        trialType = metadatum.condition;

        // select plugin based on trialType
        let trialPlugin = expConfig["trialTypes"][trialType];

        // create trial and add parameters for trial type from config
        let trial = _.extend({
            type: trialPlugin,
            trialType: trialType,
            condition: metadatum.condition,
            towerDetails: getTowerDetails(metadatum),
            dataForwarder: () => forwardDataToMongo,
            stimulus: {'blocks': metadatum.stim_tall},
            offset: 4,
            iti: expConfig.experimentParameters.learningITI
        }, expConfig["taskParameters"][trialType]);

        return(trial);
    };

    getTowerDetails = function(metadatum){
        return {
            block_str: metadatum.block_str,
            tower_id: metadatum.tower_id_tall,
            tower_A_tall_id: metadatum.tower_A_tall_id,
            tower_A_wide_id: metadatum.tower_A_wide_id,
            tower_B_tall_id: metadatum.tower_B_tall_id,
            tower_B_wide_id: metadatum.tower_B_wide_id,
            tower_id_tall: metadatum.tower_id_tall,
            composite_id: metadatum.tower_id_tall
        }
    };

    metadatumToOldNewTrial = function(metadatum) {
        /**
         * Augments trial information from metadatum with parameters in config
         */

        // trial type determined by condition when learning, otherwise it is an oldNew trial
        trialType = 'oldNew';

        // select plugin based on trialType
        let trialPlugin = expConfig["trialTypes"][trialType];

        // create trial and add parameters for trial type from config
        let trial = _.extend({
            type: trialPlugin,
            trialType: trialType,
            condition: metadatum.condition,
            novelty: metadatum.condition == 'foil' ? 'new' : 'old',
            stimulus: {'blocks': metadatum.stim_tall},
            towerDetails: getTowerDetails(metadatum),
            assignment_number : metadatum.assignment_number,
            offset: 4,
            new_key: metadata.response_key_dict['new'],
            old_key: metadata.response_key_dict['old'],
            choices: [metadata.response_key_dict['new'], metadata.response_key_dict['old']]
        }, expConfig["taskParameters"][trialType]);

        return(trial);
    };

    createBuildRecallTrial = function(metadata) {
        /**
         * Creates a single building recall trial in which multiple towers can be built and submitted.
         */

        trialType = 'buildRecall';

        // select plugin based on trialType
        let trialPlugin = expConfig["trialTypes"][trialType];

        // create trial and add parameters for trial type from config
        let trial = _.extend({
            type: trialPlugin,
            trialType: trialType,
            dataForwarder: () => forwardDataToMongo,
            // condition: metadatum.condition,
            // novelty: metadatum.condition == 'foil' ? 'new' : 'old',
            // stimulus: {'blocks': metadatum.stim_tall},
            // towerDetails: getTowerDetails(metadatum),
            // assignment_number : metadatum.assignment_number,
            // offset: 4,
            // new_key: metadata.response_key_dict['new'],
            // old_key: metadata.response_key_dict['old'],
            // choices: [metadata.response_key_dict['new'], metadata.response_key_dict['old']]
        }, expConfig["taskParameters"][trialType]);

        return(trial);
    };

    setupDecodePhase = function (trialList, callback){
        /**
         * Create decode trials from metadata
         * Towers from all conditions.
         */

        // selects buildRecall if exists, otherwise an oldnew. refactor with more robust conditional and config setup if more experiment setups needed
        if (expConfig["trialTypes"]["buildRecall"]){
            // DO NOT map over all trials, instead create one trial in which many towers can be submitted.
            decodeTrials = [createBuildRecallTrial(metadata)];
            
        } else {
            // map over all trials
            decodeTrials = _.map(metadata.trials, trialMetadatum => {
                return metadatumToOldNewTrial(trialMetadatum)
            });
        };

        // psuedorandomize decode trials
        // decodeTrials = psuedoRandomizeTrials(decodeTrials,
        //     (ts) => { return (longestSubsequence(_.map(ts, ( t ) => {return t['condition']})) <= 3) && (longestSubsequence(_.map(ts, ( t ) => {return t['novelty']})) <= 3)});

        decodeTrials = _.shuffle(decodeTrials);

        decodeTrials.forEach(trial => {
            trialNumCounter += 1;
            trial.trialNum = trialNumCounter;
        });

        // add phase instructions
        decodePhaseInstructions = makeInstructions(_.map(expConfig['decodePhaseInstructions'], mapKeys));

        trialList = _.concat(trialList, 
                            decodePhaseInstructions,
                            decodeTrials);

        // forward trial list to next setup function
        callback(trialList);
    };

    mapKeys = function(instText) {
        return instText.replace(/new_key/i,metadata.response_key_dict['new'].toUpperCase()).replace(/old_key/i,metadata.response_key_dict['old'].toUpperCase())
    };

    // Set up additional trials (consent, instructions)
    setupOtherTrials = function (trialList) {

        // console.log(trialList);

        if (!expConfig.devMode) {

            var consent = {
                type: "external-html",
                url: "../html/consent-ucsd.html",
                cont_btn: "start",
            };

            var instructionPages = []

            if (expConfig.sonaCompInfo && studyLocation == 'SONA'){
                instructionPages = _.concat(instructionPages, expConfig.sonaCompensation);
            };

            // if (studyLocation == 'SONA'){
            //     instructionPages.push(expConfig.sonaInfo);
            // }

            if (expConfig.mainInstructions){
                instructionPages = _.concat(instructionPages, expConfig.mainInstructions);
            }

            var instructions = {
                type: 'instructions',
                pages: instructionPages,
                show_clickable_nav: true
            };

            trialList.unshift(instructions);
            trialList.unshift(consent); // add consent before instructions


            // Exit survey
            var cc = studyLocation == 'Prolific' ? expConfig.completionCode :
                (studyLocation == 'SONA' ? workerID : null)

            var exitSurvey = constructDefaultExitSurvey(studyLocation, cc);

            trialList.push(exitSurvey) //push

        };

        // initialize jspsych with timeline
        constructExperimentTimeline(trialList);

    };

    makeInstructions = function(instructionPages) {
        // converts list of instruction strings into jspsych instruction trials. Returns empty list if instructionPages is empty

        instructionTrials = instructionPages ? {
            type: 'instructions',
            pages: instructionPages,
            show_clickable_nav: true
        } : [];

        return instructionTrials;
    }

    let commonData = {
        experimentName: expConfig.experimentName,
        dbname: expConfig.dbname,
        colname: expConfig.colname,
        iterationName: expConfig.iterationName ? expConfig.iterationName : 'none_provided_in_config',
        configId: expConfig.configId,
        workerID: workerID,
        gameID: gameID,
        studyLocation: studyLocation
    };

    let sendMetadata = function (meta) {
        var postData = _.extend(
          {datatype: 'metadata'},
          commonData,
          meta
        );
        socket.emit("currentData", postData);
    };

    let forwardDataToMongo = function (withinTrialData) {
        var postData = _.extend(
          {},
          commonData,
          withinTrialData
        );
        socket.emit("currentData", postData);
    };

    // Add all trials to timeline

    function constructExperimentTimeline(trialList) {

        console.log(trialList);

        /* #### Initialize jsPsych with complete experimental timeline #### */
        jsPsych.init({
            timeline: trialList,
            show_progress_bar: false,
            default_iti: 600, //up from 600 in zipping_calibration_sona_pilot
            on_trial_finish: function (trialData) {
                // console.log('Trial data:', trialData);
                // Merge data from a single trial with
                // variables to be uploaded with all data
                var packet = _.extend({}, trialData, commonData, {
                    datatype: 'trial_end',
                    response_key_dict: metadata.response_key_dict
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
};
