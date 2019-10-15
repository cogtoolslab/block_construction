// Experiment frame, with Matter canvas and surrounding buttons

var imagePath = '../img/';

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
var menuHeight = 100;
var menuWidth = 500;
let rotateIcon;
var floorY = 50;
var canvasY = 500;
var canvasX = 500;

// Stimulus Display

var stimCanvasX = canvasX;
var stimCanvasY = canvasY;

//var gravity = 0.003;
var sF = 3;

// Global Variables
var engine;
var ground;
var blocks = [];
var mConstraint; // mouse constraint for moving objects. Will delete?
var blockMenu;
var blockKinds = [];

// Block placement variables
var isPlacingObject = false;
var rotated = false;
var selectedBlockKind = null;

// Task variables
var targets;
var blockDims = [
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 4],
    [4, 2]
];

var setupEnvironment = function (env) {

    // Processing JS Function, defines initial environment.
    env.setup = function() {

        // Create Experiment Canvas
        var environmentCanvas = env.createCanvas(canvasX, canvasY); // creates a P5 canvas (which is a wrapper for an HTML canvas)
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

        blockDims.forEach(dims => {
            w = dims[0]
            h = dims[1]
            blockKinds.push(new BlockKind(w * 20 * sF, h * 20 * sF, [15, 139, 141, 100]));
        });
        /*
        blockKinds[i]
        blockKindA = new BlockKind(120*sF,40*sF,[15, 139, 141, 100]);
        blockKindB = new BlockKind(80*sF,40*sF,[41, 51, 92, 100]);
        blockKindC = new BlockKind(40*sF,40*sF,[211, 62, 67, 100]);
        blockKindD = new BlockKind(120*sF,40*sF,[15, 139, 141, 100]);
        blockKindE = new BlockKind(80*sF,40*sF,[41, 51, 92, 100]);
        blockKinds.push(blockKindA);
        blockKinds.push(blockKindB);
        blockKinds.push(blockKindC);
        */

        //TEMP: first block kind is selected
        selectedBlockKind = blockKinds[0]; //should really be first in list

        // Create Block Menu
        blockMenu = new BlockMenu(menuHeight, blockKinds);

        // Add things to the physics engine world
        ground = new Boundary(200 * sF, (environmentCanvas.height - menuHeight) * sF, 800 * sF, 60 * sF);
        //box1 = new Box(200, 100, 30, 30);

        // Start physics engine

        //Engine.run(engine);

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


    env.draw = function() { // Called continuously by Processing JS 
        env.background(51);
        ground.show(env);

        // Menu
        blockMenu.show(env);
        // Rotate button
        env.noFill();
        env.stroke(200);
        env.arc(canvasX - 50, 50, 50, 50, env.TWO_PI, env.PI + 3 * env.QUARTER_PI);
        env.line(canvasX - 50 + 25, 50 - 23, canvasX - 50 + 25, 40);
        env.line(canvasX - 50 + 12, 40, canvasX - 50 + 25, 40);

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
            selectedBlockKind.showGhost(env,env.mouseX, env.mouseY, rotated);
        }
        /*
        if (mouseY < canvasY - menuHeight){
            if (isPlacingObject){
                noCursor(); //feel like this is horribly ineffecient...
                selectedBlockKind.showGhost(mouseX, mouseY, rotated);
            }
        } else {
            cursor();
        }
        */

    }

    env.mouseClicked = function() {
        //check to see if in env

        if (env.mouseY < 80 && env.mouseX > canvasX - 80 && isPlacingObject) {
            rotated = !rotated;
        }
        else if (env.mouseY > 0 && (env.mouseY < canvasY - menuHeight) && (env.mouseX > 0 && env.mouseX < canvasX)) {
            console.log('done');
            if (isPlacingObject) {
                blocks.forEach(b => {
                    Sleeping.set(b.body, false);
                });
    
                blocks.push(new Block(selectedBlockKind, env.mouseX * sF, env.mouseY * sF, rotated));
                selectedBlockKind = null;
                env.cursor();
                isPlacingObject = false;
                rotated = false;
                
            }
        }
        else { //or if in menu then update selected blockkind
            // is mouse clicking a block?
            newSelectedBlockKind = blockMenu.hasClickedButton(env.mouseX, env.mouseY, selectedBlockKind);
            if (newSelectedBlockKind) {
                if (newSelectedBlockKind == selectedBlockKind) {
                    rotated = !rotated;
                } else {
                    rotated = false;
                }
                selectedBlockKind = newSelectedBlockKind;
                isPlacingObject = true;
            }
        }
    }

}

// Sketch Two
var setupStimulus = function (stim) {

    stim.setup = function () {
        stimulusCanvas = stim.createCanvas(stimCanvasX,stimCanvasX);
        stimulusCanvas.parent('stimulus-window'); // add parent div 
    };

    stim.draw = function () {
        stim.background(100);

    };
};

var p5stim = new p5(setupStimulus,'stimulus-canvas');
var p5env = new p5(setupEnvironment,'environment-canvas');
