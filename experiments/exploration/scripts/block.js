// Wrappers for Matter Bodies that instantiate a particular blockKind
function Block(blockKind){
    this.w = blockKind.w;
    this.h = blockKind.h;

    var options = blockKind.options;

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