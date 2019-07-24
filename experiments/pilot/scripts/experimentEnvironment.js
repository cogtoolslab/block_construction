// Experiment frame, with Matter canvas and surrounding buttons

// Aliases for Matter functions
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint;
    MouseConstraint = Matter.MouseConstraint;
    Mouse = Matter.Mouse;
    Sleeping = Matter.Sleeping;
    Runner = Matter.Runner;

// Parameters
var menuHeight = 100;
var floorY = 50;
var canvasY = 600;
var canvasX = 600;
//var gravity = 0.003;
var sF = 1;

// Global Variables
var engine;
var ground;
var blocks = [];
var mConstraint; // mouse constraint for moving objects. Will delete?
var blockMenu;
var blockKinds = [];

// Block placement variables
var isPlacingObject = true;
var selectedBlockKind;

// Task variables
var targets;

// Processing JS Function, defines initial environment.
function setup() {

    //noCursor();

    // Create Canvas
    var canvas = createCanvas(canvasX,canvasY); // creates a P5 canvas (which is a wrapper for an HTML canvas)
    // Set up Matter Physics Engine
    engineOptions = {
        enableSleeping: true,
        velocityIterations: 30,
        positionIterations: 20,
    }
    engine = Engine.create(engineOptions);
    //engine.world.gravity.y= 2;
    


    // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.
    blockKindA = new BlockKind(20*sF,90*sF,[0, 100,200,100]);
    blockKindB = new BlockKind(50*sF,50*sF,[0,200,190,100]);
    blockKindC = new BlockKind(90*sF,20*sF,[0, 220,100,100]);
    blockKinds.push(blockKindA);
    blockKinds.push(blockKindB);
    blockKinds.push(blockKindC);

    //TEMP: first block kind is selected
    selectedBlockKind = blockKindA; //should really be first in list

    // Create Block Menu
    blockMenu = new BlockMenu(menuHeight, blockKinds);

    // Add things to the physics engine world
    ground = new Boundary(200*sF, (canvas.height - menuHeight)*sF, 800*sF, 60*sF);
    //box1 = new Box(200, 100, 30, 30);
    
    // Start physics engine
    
    Engine.run(engine);
    
    // Runner- use instead of line above if changes to game loop needed
    /*
    runner = Matter.Runner.create({
        isFixed: true
    });
    Runner.run(runner, engine);
    */

    
    // Set up interactions with physics objects
    // TO DO: stop interactions with menu bar rect
    var canvasMouse = Mouse.create(canvas.elt); //canvas.elt is the html element associated with the P5 canvas
    canvasMouse.pixelRatio = pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

    var options = {
        mouse: canvasMouse // set object to mouse object in canvas
    }
    /* set up constraint between mouse and block- used to move around blocks with mouse click
    mConstraint = MouseConstraint.create(engine, options); // Create 'constraint' (like a spring) between mouse and 'body' object. 'body' is defined when mouse clicked.
    mConstraint.constraint.stiffness = 0.2; // can change properties of mouse interaction by playing with this constraint
    mConstraint.constraint.angularStiffness = 1;
    World.add(engine.world, mConstraint); // add the mouse constraint to physics engine world    
    */

    // Set up task (add to task function later)
    targets = new ConnectingTargets(300*sF, 80*sF, 300*sF, 450*sF);

}

function mouseClicked() {
    //check to see if in env

    if (mouseY > 0 && mouseY < canvasY - menuHeight && mouseX > 0 && mouseX < canvasX &&isPlacingObject) {
        blocks.push(new Block(selectedBlockKind,mouseX*sF,mouseY*sF));
        blocks.forEach(b => {
            Sleeping.set(b.body, false);
        });
    }

    else  { //or if in menu then update selected blockkind
        // is mouse clicking a block?
        selectedBlockKind = blockMenu.hasClickedButton(mouseX, mouseY, selectedBlockKind);
        isPlacingObject == true;
        
    }
}



function draw(){ // Called continuously by Processing JS 
    background(51);
    ground.show();
    blockMenu.show();
    blocks.forEach(b => {
        b.show();
    });
    /* For moving blocks with mouse drag
    if (mConstraint.body) { //if the constraint exists
        var pos = mConstraint.body.position;
        var offset = mConstraint.constraint.pointB;
        var m = mConstraint.mouse.position;
        stroke(0, 255, 0);
        line(pos.x + offset.x, pos.y + offset.y, m.x, m.y); // draw line of mouse constraint
    }*/

    if (mouseY < canvasY - menuHeight){
        if (isPlacingObject){
            noCursor(); //feel like this is horribly ineffecient...
            selectedBlockKind.showGhost(mouseX, mouseY);
        }
    } else {
        cursor();
    }
    targets.show(); // show targets from task

}