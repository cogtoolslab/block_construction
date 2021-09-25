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

    


    /* Fetch stimuli */


    

    
    var trials = [];

    // function getStimListFromMongo(config, callback) { //called in experiments where stimulus subsets are stored in mongo database

    //   socket.emit('getStim', 
    //     {
    //       gameID: gameID,
    //       colname: config.stimColName, // should check if exists (but could do above when choosing whether or not to call this function)
    //     }); 

    //   socket.on('stimulus', _trials => {
    //     console.log('received', _trials)

    //     stimMetadata = _trials;

    //     // shuffle trials
    //     let shuffle = true; // TODO: make more flexible
    //     var stimList;

    //     if (shuffle){
    //       stimList = _.shuffle(_trials.stimNumbers);
    //     } else {
    //       stimList = _trials
    //     }


    /* Set up trials */

    // Instructions

    var instruction_1 = {
        type: 'instructions',
        pages: [
            'Welcome to the experiment. Click next to begin.',
            'This is the second page of instructions.',
            'This is the final page.'
        ],
        show_clickable_nav: true
    };

    // Building trials
    var test_building_trial = {
        type: 'block-construction',
    }


    // Perception test

    // Exit survey



    // Add all trials to timeline

    trials.push(test_building_trial);


    /* #### Initialize jsPsych with complete experimental timeline #### */
    jsPsych.init({
        timeline: trials,
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

}
