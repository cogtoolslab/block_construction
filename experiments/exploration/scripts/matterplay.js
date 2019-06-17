var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var ground;
var boxes = [];

function setup() {
    createCanvas(400,400);
    engine = Engine.create();
    ground = new Boundary(200, 400, 800, 60);
    Engine.run(engine);
    World.add(engine.world, [ground]);
    console.log(engine);
    
}

function mouseClicked() {

    boxes.push(new Box(mouseX,mouseY,20,20));
}

function draw(){
    background(51);
    boxes.forEach(b => {
        b.show();
    });
    ground.show();
}