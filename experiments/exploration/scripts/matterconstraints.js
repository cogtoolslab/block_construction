// Playing with matter JS constraints
// Constraints allow you to link object together with an invisible spring

var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint;

var engine;
var ground;
var boxes = [];
var box1;
var box2;

function setup() {
    createCanvas(400,400);
    engine = Engine.create();
    ground = new Boundary(200, 400, 800, 60);
    box1 = new Box(200, 100, 30, 30);
    box2 = new Box(230, 140, 30, 30);
    boxes.push(box1);
    boxes.push(box2);
    Engine.run(engine);

    var options = {
        bodyA: box1.body,
        bodyB: box2.body,
        length: 50,
        stiffness: 0.2,
    }

    var constraint = Constraint.create(options);
    World.add(engine.world, constraint);

    
}

function mouseClicked() {
    // Do nothing
}

function draw(){
    background(51);
    ground.show();
    boxes.forEach(b => {
        b.show();
    });
}