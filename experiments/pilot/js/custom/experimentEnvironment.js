// Experiment frame, with Matter canvas and surrounding buttons

var imagePath = '../img/';
const socket = io.connect();

// TEMPORARY VARIABLES TO BE READ IN

// Aliases for Matter functions
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Sleeping = Matter.Sleeping,
    Runner = Matter.Runner;

// Environment parameters
var canvasHeight = 450;
var canvasWidth = 450;
var menuHeight = canvasHeight / 4.2;
var menuWidth = canvasWidth;
var floorY = (canvasHeight - menuHeight);
var floorHeight = canvasHeight / 3;
var aboveGroundProp = floorY / canvasHeight;

// Metavariables
const dbname = 'block_construction';
const colname = 'silhouette';

// Stimulus parameters
var stimCanvasWidth = canvasWidth;
var stimCanvasHeight = canvasHeight;
var stimX = stimCanvasWidth / 2;
var stimY = stimCanvasHeight / 2;

// p5 instances
var p5stim;
var p5env;

var scoring = false;

// Scaling values
var sF = 25; //scaling factor to change appearance of blocks
var worldScale = 2.2; //scaling factor within matterjs
var stim_scale = sF; //scale of stimulus silhouette

// Global Variables for Matter js and custom Matter js wrappers
var engine;
var ground;
var blocks = [];
var blockMenu;
var blockKinds = [];
var propertyList = [];
var blockProperties = [];

// Block placement variables
var isPlacingObject = false;
var rotated = false;
var selectedBlockKind = null;

// Task variables
var block_data; // data to send to mongodb about every block placement
var trial_data; // data to send to mongodb about every finished block structure
var newSelectedBlockKind; // init this variable so we can inspect it in the console
var newBlock; // init this variable so we can inspect it in the console

var blockDims = [
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 4],
    [4, 2]
];

/*
var block_colors = [
    [247, 239, 244, 210],
    [84, 19, 136, 210],
    [217, 3, 104, 210],
    [255, 212, 0, 210],
    [29, 223, 250, 210]]
    ;
*/

var block_colors = [
    [179, 47, 10, 210],
    [179, 47, 10, 210],
    [179, 47, 10, 210],
    [179, 47, 10, 210],
    [179, 47, 10, 210]]
    ;

var setupEnvironment = function (env, trialObj = null) {

    // Processing JS Function, defines initial environment.
    env.setup = function () {

        // Create Experiment Canvas
        environmentCanvas = env.createCanvas(canvasWidth, canvasHeight); // creates a P5 canvas (which is a wrapper for an HTML canvas)
        environmentCanvas.parent('environment-window'); // add parent div 

        // Set up Matter Physics Engine
        engineOptions = {
            enableSleeping: true,
            velocityIterations: 24,
            positionIterations: 12
        }

        world = World.create({
            gravity: {
                y: 2
            }
        })
        engine = Engine.create(engineOptions);
        engine.world = world;

        // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.

        blockDims.forEach((dims, i) => {
            w = dims[0]
            h = dims[1]
            if (trialObj.phase == 'explore' && trialObj.condition == 'mental') {
                blockKinds.push(new BlockKind(w, h, [100, 100, 100, 30]));
            } else {
                blockKinds.push(new BlockKind(w, h, block_colors[i]));
            }
        });

        // Create Block Menu
        blockMenu = new BlockMenu(menuHeight, blockKinds);

        // Add things to the physics engine world
        ground = new Boundary(canvasWidth / 2, floorY, canvasWidth * 1.5, floorHeight);
        //box1 = new Box(200, 100, 30, 30);

        // Runner- use instead of line above if changes to game loop needed
        runner = Matter.Runner.create({
            isFixed: true
        });
        Runner.run(runner, engine);

        // Set up interactions with physics objects
        // TO DO: stop interactions with menu bar rect
        var canvasMouse = Mouse.create(environmentCanvas.elt); //canvas.elt is the html element associated with the P5 canvas
        canvasMouse.pixelRatio = env.pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

        var options = {
            mouse: canvasMouse // set object to mouse object in canvas
        }

    }


    env.draw = function () { // Called continuously by Processing JS 
        env.background(220);
        ground.show(env);

        // Menu
        blockMenu.show(env);
        /*
        // Rotate button
        env.noFill();
        env.stroke(200);
        env.arc(canvasWidth - 50, 50, 50, 50, env.TWO_PI, env.PI + 3 * env.QUARTER_PI);
        env.line(canvasWidth - 50 + 25, 50 - 23, canvasWidth - 50 + 25, 40);
        env.line(canvasWidth - 50 + 12, 40, canvasWidth - 50 + 25, 40);
        */

        if (trialObj.condition == 'practice' && !scoring) {
            showStimulus(env, trialObj.targetBlocks, individual_blocks = true);
        }

        blocks.forEach(b => {
            b.show(env);
        });

        if (isPlacingObject) {
            env.noCursor(); //feel like this is horribly ineffecient...

            sleeping = blocks.filter((block) => block.body.isSleeping); // Would rather not be calculating this constantly.. update to eventlistener?
            allSleeping = sleeping.length == blocks.length;

            selectedBlockKind.showGhost(env, env.mouseX, env.mouseY, rotated, diabled = !allSleeping);
        }


    }

    env.mouseClicked = function () {
        //check to see if in env

        /* //Is clicking in top right of environment
        if (env.mouseY < 80 && env.mouseX > canvasWidth - 80 && isPlacingObject) {
            rotated = !rotated;
        }
        */

        if (!(trialObj.phase == 'explore' && trialObj.condition == 'mental')) { //environment will be disabled in some conditions

            // if mouse in main environment
            if (env.mouseY > 0 && (env.mouseY < canvasHeight - menuHeight) && (env.mouseX > 0 && env.mouseX < canvasWidth)) {
                if (isPlacingObject) {
                    // test whether all blocks are sleeping
                    sleeping = blocks.filter((block) => block.body.isSleeping);
                    allSleeping = sleeping.length == blocks.length;

                    if (allSleeping) {
                        // SEND WORLD DATA AFTER PREVIOUS BLOCK HAS SETTLED
                        // Sends information about the state of the world prior to next block being placed

                        if (blocks.length != 0) { //if a block has already been placed, send settled world state
                            sendData('settled', trialObj);
                        }

                        //test whether there is a block underneath this area
                        test_block = new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated, testing_placement = true);
                        if (test_block.can_be_placed()) {
                            newBlock = new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated);
                            blocks.push(newBlock);
                            // blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
                            selectedBlockKind = null;
                            env.cursor();
                            isPlacingObject = false;
                            blocks.forEach(b => {
                                Sleeping.set(b.body, false);
                            });

                            // send initial data about block placement
                            sendData('initial', trialObj);

                        }

                    }

                }
            }
            else if (env.mouseY > 0 && (env.mouseY < canvasHeight) && (env.mouseX > 0 && env.mouseX < canvasWidth)) { //or if in menu then update selected blockkind

                // is mouse clicking a block?
                newSelectedBlockKind = blockMenu.hasClickedButton(env.mouseX, env.mouseY, selectedBlockKind);
                if (newSelectedBlockKind) {
                    if (newSelectedBlockKind == selectedBlockKind) {

                        //rotated = !rotated; // uncomment to allow rotation by re-selecting block from menu
                    } else {
                        rotated = false;
                    }
                    selectedBlockKind = newSelectedBlockKind;
                    isPlacingObject = true;
                }

            }
        }
    }

}

var setupStimulus = function (p5stim, stimBlocks) {

    var testStim = stimBlocks;

    p5stim.setup = function () {
        stimulusCanvas = p5stim.createCanvas(stimCanvasWidth, stimCanvasWidth);
        stimulusCanvas.parent('stimulus-window'); // add parent div 
    };

    p5stim.draw = function () {
        p5stim.background(220);
        showStimulus(p5stim, testStim);
        showFloor(p5stim);
    };

};

var setupEnvs = function (trialObj) {
    p5stim = new p5((env) => {
        setupStimulus(env, trialObj.targetBlocks)
    }, 'stimulus-canvas');
    p5env = new p5((env) => {
        setupEnvironment(env, trialObj = trialObj)
    }, 'environment-canvas');
    return p5stim, p5env
}

var removeEnv = function () {

    // remove environment
    p5env.remove();

    // Update variables
    blocks = [];
    blockKinds = [];
    isPlacingObject = false;
    rotated = false;
    selectedBlockKind = null;
    // setup new environment   
}

var removeStimWindow = function () {
    // remove environment
    p5stim.remove();

}


var sendData = function (eventType, trialObj) {
    /** eventType one of:
     *  - initial, first placement of block. Sends data of type:
     *      - blockData (note that state of world can be inferred from previous settled state)
     *      - also state of the world
     *  - settled, state of world when that block has been placed. Sends data of type:
     *      - worldData (note that block placement can be inferred from previous settled state)
     *  - reset, when reset button pressed and world emptied. Sends data of type:
     *      - resetData
    */

    // info from mturk
    var turkInfo = jsPsych.turk.turkInfo();

    // common info to send to mongo
    var commonInfo = {
        // ppt and game info
        dbname: dbname, 
        colname: colname,
        iterationName: trialObj.iterationName,
        workerId: turkInfo.workerId,
        hitID: turkInfo.hitId,
        aID: turkInfo.assignmentId,
        gameID: trialObj.gameID,
        version: trialObj.versionInd,
        randID: trialObj.randID, // additional random ID in case none assigned from other sources
        timeRelative: performance.now(), // time since session began
        timeAbsolute: Date.now(),
        phase: trialObj.phase,
        condition: trialObj.condition,
        trialNum: trialObj.trialNum, 
        //scoring
        nullScore: trialObj.nullScore,
        scoreGap: trialObj.scoreGap,
        F1Score: trialObj.F1Score,
        normedScore: trialObj.normedScore,
        currBonus: trialObj.currBonus,
        score: trialObj.score,
        numTrials: trialObj.num_trials, 
        //trial vars
        trialList: trialObj.trialList,
        targetName: trialObj.targetName,
        targetBlocks: trialObj.targetBlocks,
        prompt: trialObj.prompt, 
        //global vars
        practiceDuration: trialObj.practice_duration,
        exploreDuration: trialObj.explore_duration,
        buildDuration: trialObj.build_duration,
        devMode: trialObj.dev_mode
    };

    if (eventType == 'survey_data'){

        survey_data = _.extend(commonInfo, JSON.parse(trialObj.text_data), JSON.parse(trialObj.multi_choice_data), {
            dataType: eventType,
            eventType: eventType
        });
        console.log(survey_data);
        socket.emit('currentData', survey_data);

    } else {
        // general info about world params, bundled into worldInfo
        floorBody = ground.body;
        // test out sending newBlock info to server/mongodb
        floorPropertyList = Object.keys(floorBody); // extract block properties;
        floorPropertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
        floorProperties = _.pick(floorBody['body'], propertyList); // pick out all and only the block body properties in the property list    
        vertices = _.map(floorBody.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

        worldInfo = {
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth,
            menuHeight: menuHeight,
            menuWidth: menuWidth,
            floorY: floorY,
            stimCanvasWidth: stimCanvasWidth,
            stimCanvasHeight: stimCanvasHeight,
            stimX: stimX,
            stimY: stimY,
            scalingFactor: sF,
            worldScale: worldScale,
            stim_scale: stim_scale,
            allBlockDims: [
                [1, 2],
                [2, 1],
                [2, 2],
                [2, 4],
                [4, 2]
            ],
            worldWidthUnits: 8,
            worldHeightUnits: 8,
            blockOptions: { //update if changed in block
                friction: 0.9,
                frictionStatic: 1.4,
                density: 0.0035,
                restitution: 0.001,
                sleepThreshold: 30
            },
            floorOptions: {
                isStatic: true, // static i.e. not affected by gravity
                friction: 0.9,
                frictionStatic: 2
            },
            floorProperties: floorProperties, //properties of floor body
            vertices: vertices
        };

        // glom commonInfo and worldInfo together
        _.extend(commonInfo, worldInfo);

        //console.log('commonInfo: ', commonInfo);
        //console.log('trialObj: ', trialObj);

        if (eventType == 'none') {
            console.log('Error: Null eventType sent');
        };

        //console.log('Trying to send ' + eventType + ' data from ' + phase + ' phase');

        if (eventType == 'initial') {
            // Send data about initial placement of a block
            // Could be in Build 

            // test out sending newBlock info to server/mongodb
            propertyList = Object.keys(newBlock.body); // extract block properties;
            propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
            blockProperties = _.pick(newBlock['body'], propertyList); // pick out all and only the block body properties in the property list

            // custom de-borkification
            vertices = _.map(newBlock.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

            block_data = _.extend({}, commonInfo, {
                dataType: 'block',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                phase: trialObj.phase,
                blockDimUnits: [newBlock.blockKind.w, newBlock.blockKind.h],
                blockWidth: newBlock['w'],
                blockHeight: newBlock['h'],
                blockCenterX: newBlock['body']['position']['x'],
                blockCenterY: newBlock['body']['position']['y'],
                blockVertices: vertices,
                blockBodyProperties: blockProperties
            })

            // console.log('block_data', block_data);
            socket.emit('currentData', block_data);
        }
        else if (eventType == 'settled') {

            //hacky solution to get current score from trial object
            //console.log('CurrScore: ' + trialObj.getCurrScore());
            //console.log('NormedScore: ' + trialObj.getNormedScore(trialObj.getCurrScore()));
            var incrementalScore = trialObj.getCurrScore()
            var normedIncrementalScore = trialObj.getNormedScore(trialObj.getCurrScore());
            // A world is, primarily, a list of blocks and locations
            // Get this list of blocks

            var bodiesForSending = blocks.map(block => {
                // test out sending newBlock info to server/mongodb
                propertyList = Object.keys(block.body); // extract block properties;
                propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
                propertyList = _.pullAll(propertyList, ['collisionFilter', 'constraintImpulse', 'density', 'force', 'friction', 'frictionAir', 'frictionStatic', 'isSensor', 'label', 'render', 'restitution', 'sleepCounter', 'sleepThreshold', 'slop', 'timeScale', 'type']);  // omit extraneus matter properties
                blockProperties = _.pick(block.body, propertyList); // pick out all and only the block body properties in the property list
                return blockProperties
            });

            world_data = _.extend({}, commonInfo, {
                dataType: 'world',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                allBlockBodyProperties: bodiesForSending, // matter information about bodies of each block. Order is order of block placement
                numBlocks: bodiesForSending.length,
                incrementalScore: incrementalScore,
                normedIncrementalScore: normedIncrementalScore
                // need to add bonuses
            });

            //console.log('world_data', world_data);
            socket.emit('currentData', world_data);
        }
        else if (eventType == 'reset') {
            // Event to show that reset has occurred
            // We can infer from the existence of this event that the world is empty

            // Do we calculate anything about the reset?
            reset_data = _.extend({}, commonInfo, {
                dataType: 'reset',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                numBlocks: blocks.length //number of blocks before reset pressed
            });

            console.log('reset_data', reset_data);
            socket.emit('currentData', reset_data);

        } else if (eventType == 'practice_attempt' || eventType == 'explore_end' || eventType == 'explore_end' || eventType == 'trial_end') {

            // Data for all blocks
            var bodiesForSending = blocks.map(block => {
                // test out sending newBlock info to server/mongodb
                propertyList = Object.keys(block.body); // extract block properties;
                propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
                propertyList = _.pullAll(propertyList, ['collisionFilter', 'constraintImpulse', 'density', 'force', 'friction', 'frictionAir', 'frictionStatic', 'isSensor', 'label', 'render', 'restitution', 'sleepCounter', 'sleepThreshold', 'slop', 'timeScale', 'type']);  // omit extraneus matter properties
                blockProperties = _.pick(block.body, propertyList); // pick out all and only the block body properties in the property list
                return blockProperties
            });

            // Data for world
            world_data = _.extend({}, commonInfo, {
                dataType: 'world',
                eventType: eventType, // initial block placement decision vs. final block resting position.
                allBlockBodyProperties: bodiesForSending, // matter information about bodies of each block. Order is order of block placement
                numBlocks: bodiesForSending.length
                // need to add bonuses
            });

            if (eventType == 'practice_attempt') {
                // Summary data for 
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'practice_attempt',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    exploreStartTime: trialObj.exploreStartTime,
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    score: trialObj.score,
                    success: trialObj.practiceSuccess,
                    exploreResets: trialObj.exploreResets,
                    nPracticeAttempts: trialObj.nPracticeAttempts,
                    practiceAttempt: trialObj.practiceAttempt
                });
                console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            } else if (eventType == 'explore_end') {
                // Summary data for entire explore phase
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'explore_end',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    exploreStartTime: trialObj.exploreStartTime,
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    score: trialObj.score,
                    exploreResets: trialObj.exploreResets,
                    nPracticeAttempts: trialObj.nPracticeAttempts,
                });
                console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            } /* else if (eventType == 'build_end') {
                // Summary data for 
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'build_end',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    buildStartTime: trialObj.buildStartTime,
                    buildFinishTime: trialObj.buildFinishTime,
                    endReason: trialObj.endReason,
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    score: trialObj.score,
                    endReason: trialObj.endReason,
                    buildResets: trialObj.buildResets,
                    nPracticeAttempts: trialObj.nPracticeAttempts
                });
                console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            }*/
            else if (eventType == 'trial_end') {
                // Summary data for 
                trial_end_data = _.extend({}, commonInfo, world_data, {
                    dataType: 'trial_end',
                    eventType: eventType, // initial block placement decision vs. final block resting position.
                    numBlocks: blocks.length, //number of blocks before reset pressed
                    exploreStartTime: trialObj.exploreStartTime,
                    buildStartTime: trialObj.buildStartTime,
                    buildFinishTime: trialObj.buildFinishTime,
                    endReason: trialObj.endReason,
                    completed: trialObj.completed,
                    F1Score: trialObj.F1Score, // raw score
                    normedScore: trialObj.normedScore,
                    currBonus: trialObj.currBonus,
                    score: trialObj.score,
                    buildResets: trialObj.buildResets,
                    exploreResets: trialObj.exploreResets,
                    nPracticeAttempts: trialObj.nPracticeAttempts
                });
                console.log('trial_end_data: ', trial_end_data);
                socket.emit('currentData', trial_end_data);

            };
        };
    };

};
