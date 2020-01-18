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
        env.translate(x,y);
        env.rect(0,0,this.w*sF,this.h*sF);
        if (chocolateBlocks) {
            this.drawChocolateBlocks(env);
        }
        env.pop();

    }

    this.drawChocolateBlocks = function(env) {
        // draws unit squares on each block
        nRow = this.w;
        nCol = this.h;
        i = -nRow/2 + 0.5;
        while (i < nRow/2) {
            j = -nCol/2 + 0.5;
            while (j < nCol/2) { // draw one square
                env.translate(sF*i, sF*j);
                env.rect(0, 0, sF, sF);
                env.translate(-sF*i, -sF*j);
                j++;
            }
            i++;
        }
    }


    this.showGhost = function(env, mouseX, mouseY, rotated, disabledBlockPlacement = false, snapToGrid = true) {

        if(snapToGrid){
            if (this.w%2 == 1) {
                snappedX = (mouseX+stim_scale/2)%(stim_scale) < (stim_scale/2) ? mouseX - (mouseX%(stim_scale/2)) : mouseX - (mouseX%(stim_scale)) + (stim_scale/2);
            } else if (this.h%2 == 1) {
                snappedX = mouseX%(stim_scale) < (stim_scale/2) ? mouseX - mouseX%(stim_scale) : mouseX - mouseX%(stim_scale) + stim_scale;
            }
            else {
                snappedX = mouseX%(stim_scale) < (stim_scale/2) ? mouseX - mouseX%(stim_scale) : mouseX - mouseX%(stim_scale) + stim_scale;
            }

            mouseX = snappedX
        }

        env.push();
        env.translate(mouseX, mouseY);
        env.rectMode(env.CENTER);
        env.stroke([28,54,62,100]);
        env.strokeWeight(2);
        //fillColor = disabledBlockPlacement ? [100, 100, 100, 100] : [...this.blockColor];
        //fillColor[3] = 130;
        fillColor = env.color(this.blockColor);
        fillColor.setAlpha(150);
        env.fill(fillColor);
        if(rotated){
            env.rect(0,0,this.h*sF,this.w*sF);
        } else {
            env.rect(0,0,this.w*sF,this.h*sF);
        }
        if (chocolateBlocks) {
            this.drawChocolateBlocks(env);
        }
        env.pop();

    }

}