// Wrapper for Bodies.rectangle class to create boundaries/ walls. 
// Also includes a show function which draws the box using P5.

function Boundary(x, y, w, h){
    
    var options = {
        isStatic: true, // static i.e. not affected by gravity
        friction: 0.9,
        restitution: 0.6
    }
    
    this.w = w;
    this.h = h;

    this.body = Bodies.rectangle(x,y,w,h, options);
    World.add(engine.world, this.body); 

    // Display the boundary on the screen
    this.show = function() {

        var pos = this.body.position;
        var angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rectMode(CENTER);
        rotate(angle);
        stroke(200);
        fill(20);
        rect(0,0,this.w,this.h);
        pop();

    }

}