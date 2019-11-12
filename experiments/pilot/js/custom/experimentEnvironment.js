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

// Parameters
// var menuHeight = 100;
// var menuWidth = 500;
// let rotateIcon;
// var floorY = 50;
// var canvasHeight = 500;
// var canvasWidth = 500;
var canvasHeight = 450; //actually height
var canvasWidth = 450; //actually width
var menuHeight = canvasHeight / 5;
var menuWidth = canvasWidth;
var floorY = (canvasHeight - menuHeight);
var floorHeight = canvasHeight / 3;
var aboveGroundProp = floorY / canvasHeight;

// Metavariables
const dbname = 'block_construction';
const colname = 'silhouette';
const iterationName = 'testing';
var phase = 'build';

// Stimulus Display
var stimCanvasWidth = canvasWidth;
var stimCanvasHeight = canvasHeight;
var stimX = stimCanvasWidth / 2;
var stimY = stimCanvasHeight / 2;

// p5 instances
var p5stim;
var p5env;

// Scaling values
var sF = 20; //scaling factor to change appearance of blocks
var worldScale = 2.2; //scaling factor within matterjs
var stim_scale = sF; //scale of stimulus silhouette

// Global Variables
var engine;
var ground;
var blocks = [];
var mConstraint; // mouse constraint for moving objects. Will delete?
var blockMenu;
var blockKinds = [];
var propertyList = [];
var blockProperties = [];

// Block placement variables
var isPlacingObject = false;
var rotated = false;
var selectedBlockKind = null;

// Task variables
var targets;
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

var setupEnvironment = function (env, disabledEnvironment = false, phaseType = 'build') {

    phase = phaseType;

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
        //engine.world.gravity.y= 2;



        // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.

        blockDims.forEach((dims, i) => {
            w = dims[0]
            h = dims[1]
            if (disabledEnvironment) {
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
        /* set up constraint between mouse and block- used to move around blocks with mouse click
        mConstraint = MouseConstraint.create(engine, options); // Create 'constraint' (like a spring) between mouse and 'body' object. 'body' is defined when mouse clicked.
        mConstraint.constraint.stiffness = 0.2; // can change properties of mouse interaction by playing with this constraint
        mConstraint.constraint.angularStiffness = 1;
        World.add(engine.world, mConstraint); // add the mouse constraint to physics engine world    
        */

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

        blocks.forEach(b => {
            b.show(env);
        });
        /* For moving blocks with mouse drag
        if (mConstraint.body) { //if the constraint exists
            var pos = mConstraint.body.position;
            var offset = mConstraint.constraint.pointB;
            var m = mConstraint.mouse.position;
            stroke(0, 255, 0);
            line(pos.x + offset.x, pos.y + offset.y, m.x, m.y); // draw line of mouse constraint
        }*/
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

        if (!disabledEnvironment) { //environment will be disabled in some conditions

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
                            sendData(eventType = 'settled');
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

                            sendData(eventType = 'initial', newBlock = newBlock);

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

    p5stim.setup = function () {
        stimulusCanvas = p5stim.createCanvas(stimCanvasWidth, stimCanvasWidth);
        stimulusCanvas.parent('stimulus-window'); // add parent div 
    };

    p5stim.draw = function () {
        p5stim.background(220);
        var testStim = stimBlocks;
        showStimulus(p5stim, testStim);
        showFloor(p5stim);
    };

};

var trial = function (condition = 'external') {
    if (condition == 'external') {
        explore()
    }
    else if (condition == 'internal') {
        simulate()
    }
    else {
        console.log('Unrecognised condition type, use `external` or `internal`')
    }
    //wait until returned, then
    /*
    p5stim = new p5(setupStimulus,'stimulus-canvas');
    p5env = new p5(setupEnvironment,'environment-canvas');*/

    // then
    //resetStimWindow()

}
var exploreMental = function (targetBlocks) {
    p5stim = new p5((env) => {
        setupStimulus(env, targetBlocks)
    }, 'stimulus-canvas');
    p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = true, phaseType = 'mental')
    }, 'environment-canvas');
    return p5stim, p5env
}

var explorePhysical = function (targetBlocks) {
    p5stim = new p5((env) => {
        setupStimulus(env, targetBlocks)
    }, 'stimulus-canvas');
    p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = false, phaseType = 'physical')
    }, 'environment-canvas');
    return p5stim, p5env
}

var buildStage = function (targetBlocks) {
    p5stim = new p5((env) => {
        setupStimulus(env, targetBlocks)
    }, 'stimulus-canvas');
    p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = false, phaseType = 'build')
    }, 'environment-canvas');
    return p5stim, p5env
}

var resetEnv = function () {

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

var resetStimWindow = function () {
    // remove environment
    p5stim.remove();

}

// Not implemented yet- contents copied from block placement
var sendData = function (eventType = 'none', newBlock = null, trialObj = null) {
    /** eventType one of:
     *  - expStart, general details about set up of experiment and matter environment. Sends data of type:
     *      - gameInit
     *  - initial, first placement of block. Sends data of type:
     *      - blockData (note that state of world can be inferred from previous settled state)
     *  - settled, state of world when that block has been placed. Sends data of type:
     *      - worldData (note that block placement can be inferred from previous settled state)
     *  - phaseEnd, state of world after last block has been placed. Sends data of type:
     *      - worldData
     *  - reset, when reset button pressed and world emptied. Sends data of type:
     *      - resetData
     *  - expEnd, state of game when final trial over. Sends data of type:
     *      - gameData
    */

    if (eventType == 'none') {
        console.log('Error: Null eventType sent');
    }

    console.log('Trying to send ' + eventType + ' data from ' + phase + ' phase');

    if (eventType == 'initial') {
        // Send data about initial placement of a block
        // Could be in Build 

        // test out sending newBlock info to server/mongodb
        propertyList = Object.keys(newBlock.body); // extract block properties;
        propertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
        blockProperties = _.pick(newBlock['body'], propertyList); // pick out all and only the block body properties in the property list

        // custom de-borkification
        vertices = _.map(newBlock.body.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

        block_data = {
            dbname: dbname,
            colname: colname,
            iterationName: iterationName,
            dataType: 'block',
            eventType: 'initial', // initial block placement decision vs. final block resting position.
            phase: phase,
            gameID: gameid,
            version: version,
            time: performance.now(), // time since session began
            timeAbsolute: Date.now(),
            blockWidth: newBlock['w'],
            blockHeight: newBlock['h'],
            blockCenterX: newBlock['body']['position']['x'],
            blockCenterY: newBlock['body']['position']['y'],
            blockVertices: vertices,
            blockBodyProperties: blockProperties
        };
        console.log('block_data', block_data);
        socket.emit('block', block_data);
    }
    else if (eventType == 'settled') {

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

        world_data = {
            dbname: dbname,
            colname: colname,
            iterationName: iterationName,
            dataType: 'world',
            eventType: eventType, // initial block placement decision vs. final block resting position.
            phase: phase,
            gameID: gameid,
            version: version,
            time: performance.now(), // time since session began
            timeAbsolute: Date.now(),
            allBlockBodyProperties: bodiesForSending, // matter information about bodies of each block. Order is order of block placement
            numBlocks: bodiesForSending.length
        };
        console.log('world_data', world_data);
        socket.emit('world', world_data);
    }
    else if (eventType == 'reset') {
        // Event to show that reset has occurred
        // We can infer from the existence of this event that the world is empty

        // Do we calculate anything about the reset?

        reset_data = {
            dbname: dbname,
            colname: colname,
            iterationName: iterationName,
            dataType: 'world',
            eventType: eventType, // initial block placement decision vs. final block resting position.
            phase: phase,
            gameID: gameid,
            version: version,
            time: performance.now(), // time since session began
            timeAbsolute: Date.now(),
            numBlocks: blocks.length //number of blocks before reset pressed
        };

        console.log('reset_data', reset_data);
        socket.emit('reset', reset_data);

    }
    else if (eventType == 'expStart') {
        // Send data about initial setup of experiment

        floorBody = ground.body
        // test out sending newBlock info to server/mongodb
        floorPropertyList = Object.keys(floorBody); // extract block properties;
        floorPropertyList = _.pullAll(propertyList, ['parts', 'plugin', 'vertices', 'parent']);  // omit self-referential properties that cause max call stack exceeded error
        floorProperties = _.pick(floorBody['body'], propertyList); // pick out all and only the block body properties in the property list

        // custom de-borkification
        vertices = _.map(floorBody.vertices, function (key, value) { return _.pick(key, ['x', 'y']) });

        exp_data = {
            dbname: dbname,
            colname: colname,
            iterationName: iterationName,
            dataType: 'block',
            eventType: 'initial', // initial block placement decision vs. final block resting position.
            phase: phase,
            gameID: gameid,
            version: version,
            time: performance.now(), // time since session began
            timeAbsolute: Date.now(),
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
            blockDims: [
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
        console.log('exp_data', exp_data);
        socket.emit('experiment', exp_data);
    }

}
