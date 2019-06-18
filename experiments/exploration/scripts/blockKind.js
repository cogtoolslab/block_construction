function BlockKind(w,h,blockColor){
    this.w = w;
    this.h = h;
    this.color = blockColor;
    
    //var this.x;
    //var this.y;

    this.showMenuItem = function(sizeRatio,x,y) {
        //this.x = x;
        //this.y = y;

        push();
        rectMode(CENTER);
        fill(this.color);
        rect(x,y,sizeRatio*this.w,sizeRatio*this.h)
        pop();

    }

}