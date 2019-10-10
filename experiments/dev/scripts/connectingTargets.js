// Class representing information about target in 'connecting' task
// For now, all measurements are given in raw pixels. This should be changed later.

function ConnectingTargets(startX, startY, finishX, finishY){

    this.startX = startX;
    this.startY = startY;
    this.finishX = finishX;
    this.finishY = finishY;
    this.w = 10; //temporarily hardcoded
    this.h = 10; //temporarily hardcoded
    

    var options = {
        isStatic: true // static i.e. not affected by gravity
    }
    

    
    this.bodyA = Bodies.rectangle(startX,startY,this.w,this.h,options);
    this.bodyA.collisionFilter.group = 2;
    this.bodyA.collisionFilter.mask = []; //stop colliding with normal objects
    World.add(engine.world, this.bodyA); 

    this.bodyB = Bodies.rectangle(finishX,finishY,this.w,this.h,options);
    this.bodyB.collisionFilter.group = 3;
    this.bodyB.collisionFilter.mask = []; //stop colliding with normal objects
    World.add(engine.world, this.bodyB); 

    // Display the boundary on the screen
    this.show = function() {

        var pos = this.bodyA.position;
        var angle = this.bodyA.angle;


        push();
        strokeWeight(3);
        stroke(20,255,20,200);
        fill(0,0,0,0);

        push();
        translate(pos.x/sF, pos.y/sF);
        rectMode(CENTER);
        rotate(angle);
        rect(0,0,this.w/sF,this.h/sF);
        pop();

        var pos2 = this.bodyB.position;
        var angle2 = this.bodyB.angle;

        push();
        translate(pos2.x/sF, pos2.y/sF);
        rectMode(CENTER);
        rotate(angle2);
        rect(0,0,this.w/sF,this.h/sF);
        pop();

        pop();

    }

    this.hasConnected = function() {
        checkConnected(5,6);
    }

    this.startBlocks = function(){
        
    }


}