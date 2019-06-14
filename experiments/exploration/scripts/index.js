var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var ground;
var boxes = [];

function setup() {
    createCanvas(400,400);
    engine = Engine.create();
    ground = Bodies.rectangle(200, 400, 800, 60, { isStatic: true });
    
    Engine.run(engine);
    World.add(engine.world, [ground]);
    
}

function mouseClicked() {

    boxes.push(new Box(mouseX,mouseY,20,20));
}

function draw(){
    background(51);
    boxes.forEach(b => {
        b.show();
    });
}