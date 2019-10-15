// Wrappers for Matter Bodies that instantiate a particular BlockKind
function Block(blockKind, x, y, rotated){

    if(rotated){
        this.w = blockKind.h;
        this.h = blockKind.w;
    }else{
        this.w = blockKind.w;
        this.h = blockKind.h;
    }

    //var options = blockKind.options;

    var options = {
        friction: 0.7,
        frictionStatic: 1.3,
        //frictionAir: 0.07,
        //slop: 0.1,
        density: 0.0025,
        restitution: 0.001,
        sleepThreshold: 80
    }

    this.body = Bodies.rectangle(x,y,this.w,this.h, options);
    World.add(engine.world, this.body); 
    

    // Display the block (maybe separate out view functions later?)
    this.show = function(env) {

        var pos = this.body.position;
        var angle = this.body.angle;

        env.push(); //saves the current drawing style settings and transformations
        env.translate(pos.x/sF, pos.y/sF);
        env.rectMode(CENTER);
        env.rotate(angle);
        env.stroke(200);
        env.fill(150);
        if(this.body.isSleeping) {
            env.fill(100);
        }
        env.rect(0,0,this.w/sF,this.h/sF);

        env.pop();
        

    }

}