function BlockMenu (h) {
    
    var blockKinds = [];

    this.h = h;

    // Adds a type of block to the menu
    this.addBlockKinds = function(newBlockKinds) {

        newBlockKinds.forEach(bK => {
            blockKinds.push(bK);    
        });
        

    }

    // Display menu
    this.show = function() {

        push();
        rectMode(CORNER);
        stroke(200);
        fill(120);
        rect(0,canvasY-this.h,canvasX,this.h);
        
        var i;
        for (i = 0; i < blockKinds.length; i++) { 
            blockKinds[i].showMenuItem(1,((i+1)*(canvasX/(blockKinds.length+1))),canvasY - menuHeight/2);;
        } 
        pop();

    }



}