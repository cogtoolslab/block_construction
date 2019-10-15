// Wrapper for Bodies.rectangle class to create boundaries/ walls. 
// Also includes a show function which draws the box using P5.

function Boundary(x, y, w, h){
    
    var options = {
        isStatic: true, // static i.e. not affected by gravity
        friction: 0.9,
        frictionStatic: 2
        //slop: 0,
        //restitution: 0
    }
    
    this.w = w;
    this.h = h;

    this.body = Bodies.rectangle(x,y,w,h, options);
    World.add(engine.world, this.body); 

    // Display the boundary on the screen
    this.show = function(env) {

        var pos = this.body.position;
        var angle = this.body.angle;

        env.push();
        env.translate(pos.x/sF, pos.y/sF);
        env.rectMode(env.CENTER);
        env.rotate(angle);
        env.stroke(200);
        env.fill(20);
        env.rect(0,0,this.w/sF,this.h/sF);
        env.pop();

    }

}