function Boundary(x, y, w, h){
    
    var options = {
        isStatic: true,
        friction: 0.4,
        restitution: 0.6
    }
    
    this.w = w;
    this.h = h;

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
        fill(20);
        rect(0,0,this.w,this.h);

        pop();

    }

}