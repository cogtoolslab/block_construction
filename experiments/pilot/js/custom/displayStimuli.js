var worldHeight = 8;
var worldWidth = 8;

function showStimulus(p5stim,stimulus){
    Array.prototype.forEach.call(stimulus, block => {
        showBlock(p5stim, block)
    });
}

function showBlock(p5stim, block){
    width = block.width;
    height = block.height;
    x_left = block.x - worldWidth/2;
    x_center = x_left + block.width/2;
    y_bottom = worldHeight - block.y - worldHeight/2;
    y_center =  y_bottom - block.height/2;
    
    y_top = y_bottom - height;

    p5stim.push(); //saves the current drawing style settings and transformations
    p5stim.translate(stimX + stim_scale*x_center, stimY + stim_scale*y_center);
    p5stim.rectMode(p5stim.CENTER);
    p5stim.noStroke()
    p5stim.fill(0);
    p5stim.rect(0,0,stim_scale*width,stim_scale*height);
    p5stim.pop();
    
}

