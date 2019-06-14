function Box(x, y, w, h){
    this.w = w;
    this.h = h;

    this.body = Bodies.rectangle(x,y,w,h);
    World.add(engine.world, this.body); 

    this.show = function() {

        var pos = this.body.position;
        var angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rectMode(CENTER);
        rotate(angle);
        rect(0,0,this.w,this.h);

        pop();

    }

}