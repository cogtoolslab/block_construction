// BlockKinds are a type of block- of which several might be placed in the environment. To be concretely instantiated, a Block must be created that inherets its properties from a BlockKind
// BlockKind also holds the information for displaying the menu item associated with that blockKind.
function BlockKind(w,h,blockColor, blockName = ''){
    // BlockKind width and height should be given in small integers. They are scaled in the block class.
    this.w = w;
    this.h = h;
    this.blockColor = blockColor;
    this.blockName = blockName;
    
    var x;
    var y;

    // removed: options variable- add in later when we need different properties with different block kinds

    // show block scaled according to given ratio, in a given location
    this.showMenuItem = function(env,x,y) {

        this.x = x;
        this.y = y;
        env.push();
        env.rectMode(env.CENTER);
        env.fill(this.blockColor);
        env.stroke([60,90,110]);
        env.strokeWeight(2);
        env.rect(x,y,this.w*sF,this.h*sF)
        env.pop();

    }

    this.showGhost = function(env, mouseX, mouseY, rotated, disabledBlockPlacement = false) {

        env.push();
        env.translate(mouseX, mouseY);
        env.rectMode(env.CENTER);
        env.stroke([28,54,62,100]);
        env.strokeWeight(2);
        fillColor = disabledBlockPlacement ? [100, 100, 100, 100] : [...this.blockColor];
        fillColor[3] = 130;
        env.fill(fillColor);
        if(rotated){
            env.rect(0,0,this.h*sF,this.w*sF);
        } else {
            env.rect(0,0,this.w*sF,this.h*sF);
        }
        env.pop();

    }

}