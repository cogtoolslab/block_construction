// Wrappers for Matter Bodies that instantiate a particular BlockKind
function Block(blockKind, x, y){
    this.w = blockKind.w;
    this.h = blockKind.h;

    //var options = blockKind.options;

    var options = {
        friction: 0.3,
        frictionStatic: 1.5,
        frictionAir: 0.07,
        slop: 0.05,
        density: 0.002,
        restitution: 0.001
    }

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
        if(this.body.isSleeping) {
            fill(100);
        }
        rect(0,0,this.w,this.h);

        pop();
        

    }

}