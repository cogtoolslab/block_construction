// Playing with matter JS constraints
// Constraints allow you to link object together with an invisible spring

var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint;
    MouseConstraint = Matter.MouseConstraint;
    Mouse = Matter.Mouse;

var engine;
var ground;
var box1;
var mConstraint;


function setup() {
    var canvas = createCanvas(400,400); // creates a P5 canvas
    engine = Engine.create();
    ground = new Boundary(200, 400, 800, 60);
    box1 = new Box(200, 100, 30, 30);
    Engine.run(engine);


    // Mouse Constraint
    var canvasMouse = Mouse.create(canvas.elt); //canvas.elt is the html element associated with the P5 canvas
    canvasMouse.pixelRation = pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

    var options = {
        mouse: canvasMouse,
        //constraint: 0.05
    }
    
    mConstraint = MouseConstraint.create(engine, options);
    mConstraint.constraint.stiffness = 0.2; // can change properties of mouse interaction by playing with this constraint
    mConstraint.constraint.angularStiffness = 1;
    World.add(engine.world, mConstraint);
    console.log(mConstraint);

    
}

function mouseClicked() {
    // Do nothing
}

function draw(){
    background(51);
    ground.show();
    box1.show();

    
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