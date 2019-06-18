// Experiment frame, with Matter canvas and surrounding buttons

// Aliases for Matter functions
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint;
    MouseConstraint = Matter.MouseConstraint;
    Mouse = Matter.Mouse;

// Parameters
var menuHeight = 50;
var floorY = 50;
var canvasY = 400;
var canvasX = 400;

// Global Variables
var engine;
var ground;
var box1;
var mConstraint;
var isPlacingObject = false;
var blockMenu;

// Processing JS Function, defines initial environment.
function setup() {
    // Create Canvas
    var canvas = createCanvas(canvasX,canvasY); // creates a P5 canvas (which is a wrapper for an HTML canvas)
    
    // Set up Matter Physics Engine
    engine = Engine.create();

    // TODO Create Block Menu
    blockMenu = new BlockMenu (menuHeight);

    // Add things to the physics engine world
    ground = new Boundary(200, 400, 800, 60);
    box1 = new Box(200, 100, 30, 30);
    
    // Start physics engine
    Engine.run(engine);


    // Set up interactions with physics objects
    var canvasMouse = Mouse.create(canvas.elt); //canvas.elt is the html element associated with the P5 canvas
    canvasMouse.pixelRatio = pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

    var options = {
        mouse: canvasMouse, // set object to mouse objet in canvas
    }
    
    mConstraint = MouseConstraint.create(engine, options); // Create 'constraint' (like a spring) between mouse and 'body' object. 'body' is defined when mouse clicked.
    mConstraint.constraint.stiffness = 0.2; // can change properties of mouse interaction by playing with this constraint
    mConstraint.constraint.angularStiffness = 1;
    World.add(engine.world, mConstraint); // add the mouse constraint to physics engine world    
    
}

function mouseClicked() {
    // Do nothing
}

function draw(){ // Called continuously by Processing JS 
    background(51);
    ground.show();
    box1.show();
    blockMenu.show();
    //rect(0,canvas.w-this.h,windowWidth,this.h);

    
    if (mConstraint.body) { //if the constraint exists
        var pos = mConstraint.body.position;
        var offset = mConstraint.constraint.pointB;
        fill(0,255,0);
        ellipse(pos.x,pos.y, 20,20)
        var m = mConstraint.mouse.position;
        stroke(0, 255, 0);
        line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
    }

}