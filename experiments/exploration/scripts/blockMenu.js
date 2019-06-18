function BlockMenu (h) {
    this.h = h;
    this.show = function() {

        push();
        rectMode(CORNER);
        stroke(200);
        fill(120);
        rect(0,canvas.width-this.h,windowWidth,this.h);
        pop();

    }
}