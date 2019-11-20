var worldHeight = 8;
var worldWidth = 8;

function showStimulus(p5stim, stimulus, individual_blocks = false){
    Array.prototype.forEach.call(stimulus, block => {
        showBlock(p5stim, block, individual_blocks = individual_blocks)
    });
}

function showBlock(p5stim, block, individual_blocks = false){
    width = block.width;
    height = block.height;
    x_left = block.x - worldWidth/2;
    x_center = x_left + block.width/2;
    y_bottom = worldHeight - block.y - worldHeight/2;
    y_center =  y_bottom - block.height/2;
    
    y_top = y_bottom - height;

    p5stim.push(); //saves the current drawing style settings and transformations
    p5stim.translate(stimX + stim_scale*x_center, (canvasHeight - floorHeight) - (canvasHeight - floorY) + stim_scale*y_center - 26);
    p5stim.rectMode(p5stim.CENTER);
    //p5stim.noStroke();
    p5stim.stroke([28,54,62]);
    p5stim.fill([28,54,62]);
    if (individual_blocks) {
        p5stim.stroke(150);
        p5stim.fill([200,200,200,200]);
    }
    p5stim.rect(0,0,stim_scale*width,stim_scale*height);
    p5stim.pop();
    
}

//still to do!
function showFloor(p5stim){

    floorX = canvasWidth/2, 
    floorY = (canvasWidth - menuHeight)*1.15, 
    floorWidth = canvasWidth*1.5
    floorHeight = canvasHeight/3
    p5stim.push();
    p5stim.translate(floorX, floorY);
    p5stim.rectMode(p5stim.CENTER);
    p5stim.stroke(220);
    p5stim.fill([12,27,36]);
    p5stim.rect(0,0,floorWidth,floorHeight);
    p5stim.pop();
    showMarker(p5stim);
}

function showMarker(p5stim){
    p5stim.push();
    p5stim.stroke([255,0,0]);
    p5stim.strokeWeight(1)
    p5stim.line(canvasWidth/2,canvasHeight-floorHeight+10,canvasWidth/2,canvasHeight-floorHeight+35);
    p5stim.pop();
}