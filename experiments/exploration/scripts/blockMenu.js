function BlockMenu (h) {
    
    var blockKinds = [];

    this.h = h;

    this.addBlockKinds = function(newBlockKinds) {

        newBlockKinds.forEach(bK => {
            blockKinds.push(bK);    
        });
        

    }


    this.show = function() {

        push();
        rectMode(CORNER);
        stroke(200);
        fill(120);
        rect(0,canvas.width-this.h,windowWidth,this.h);
        
        var i;
        for (i = 0; i < blockKinds.length; i++) { 
            blockKinds[i].showMenuItem(1,((i+1)*(canvas.width/(blockKinds.length+1))),canvas.height - menuHeight/2);;
        } 
        pop();

    }
}