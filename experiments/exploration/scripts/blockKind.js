function BlockKind(w,h,blockColor){
    this.w = w;
    this.h = h;
    this.color = blockColor;

    // show block scaled according to given ratio, in a given location
    this.showMenuItem = function(sizeRatio,x,y) {

        push();
        rectMode(CENTER);
        fill(this.color);
        rect(x,y,sizeRatio*this.w,sizeRatio*this.h)
        pop();

    }

}