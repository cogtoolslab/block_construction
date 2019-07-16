// Wrappers for Matter Bodies that instantiate a particular BlockKind
function Block(blockKind, x, y){
    this.w = blockKind.w;
    this.h = blockKind.h;

    var options = blockKind.options;

    this.body = Bodies.rectangle(x,y,this.w,this.h, options);
    World.add(engine.world, this.body); 

    // Display the block (maybe separate out view functions later?)
    this.show = function() {

        var pos = this.body.position;
        var angle = this.body.angle;

        push(); //saves the current drawing style settings and transformations
        translate(pos.x, pos.y);
        rectMode(CENTER);
        rotate(angle);
        stroke(200);
        fill(150);
        rect(0,0,this.w,this.h);

        pop();

    }

}