// Wrappers for Matter Bodies that instantiate a particular BlockKind
function Block(blockKind, x, y, rotated){

    if(rotated){
        this.w = blockKind.h * sF;
        this.h = blockKind.w * sF;
    }else{
        this.w = blockKind.w * sF;
        this.h = blockKind.h * sF;
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

    this.body = Bodies.rectangle(x*worldScale,y*worldScale,this.w*worldScale,this.h*worldScale, options);
    World.add(engine.world, this.body); 
    

    // Display the block (maybe separate out view functions later?)
    this.show = function(env) {

        var pos = this.body.position;
        var angle = this.body.angle;

        env.push(); //saves the current drawing style settings and transformations
        env.translate(pos.x/worldScale, pos.y/worldScale);
        env.rectMode(env.CENTER);
        env.rotate(angle);
        env.stroke(100);
        env.fill(150);
        if(this.body.isSleeping) {
            env.fill(200);
        }
        env.rect(0,0,this.w,this.h);

        env.pop();
        

    }

}