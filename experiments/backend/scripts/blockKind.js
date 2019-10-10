// BlockKinds are a type of block- of which several might be placed in the environment. To be concretely instantiated, a Block must be created that inherets its properties from a BlockKind
// BlockKind also holds the information for displaying the menu item associated with that blockKind.
function BlockKind(w,h,blockColor){
    this.w = w;
    this.h = h;
    this.color = blockColor;
    var x;
    var y;

    // removed: options variable- add in later when we need different properties with different block kinds

    // show block scaled according to given ratio, in a given location
    this.showMenuItem = function(sizeRatio,x,y) {

        this.x = x;
        this.y = y;
        push();
        rectMode(CENTER);
        fill(this.color);
        rect(x,y,sizeRatio*this.w/sF,sizeRatio*this.h/sF)
        pop();

    }

    this.showGhost = function(mouseX, mouseY, rotated) {

        // update to include scrolling to rotate? https://p5js.org/reference/#/p5/mouseWheel
        push();
        translate(mouseX, mouseY);
        rectMode(CENTER);
        stroke(200);
        fill(blockColor);
        if(rotated){
            rect(0,0,this.h/sF,this.w/sF);
        } else {
            rect(0,0,this.w/sF,this.h/sF);
        }
        pop();

    }

}