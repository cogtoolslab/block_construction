// Wrapper for Bodies.rectangle class to create boxes and add them to the world. 
// Also includes a show function which draws the box using P5.

function Box(x, y, w, h){
    this.w = w;
    this.h = h;
    var options = {
        friction: 0.4,
        restitution: 0.6
    }

    this.body = Bodies.rectangle(x,y,w,h, options);
    World.add(engine.world, this.body); 

    this.show = function() {

        var pos = this.body.position;
        var angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rectMode(CENTER);
        rotate(angle);
        stroke(200);
        fill(150);
        rect(0,0,this.w,this.h);

        pop();

    }

}