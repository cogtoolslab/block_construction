var dispConfig = require('./displayConfig.js');
var gridDisplay = require('./gridDisplay.js')['gridDisplay'];
var p5 = require('./p5.js');
var ChunkGame = require('./chunkGame.js')['ChunkGame'];

function setupChunkingCanvas(p5Canvas, trialObj) {

    //var testStim = trialObj.targetBlocks;

    p5Canvas.setup = function () {
        stimulusCanvas = p5Canvas.createCanvas(dispConfig.canvasHeight, dispConfig.canvasWidth);
        stimulusCanvas.parent('chunking-canvas'); // add parent div 
        p5Canvas.game = new ChunkGame(gridDisplay);

        p5Canvas.game.startTrial();

    };

    p5Canvas.draw = function () {
        p5Canvas.background(220);
        gridDisplay.show(p5Canvas);

    };

    let dragging = false;
    let dragSet = [];
    let dragSetGroup = [0,0,0];

    p5Canvas.mousePressed = function () {
        
        //var toolSelected = true; // some condition to prevent clicking

        if (!dragging) {
  
          // if mouse in main environment
          if (p5Canvas.mouseY > 0 && (p5Canvas.mouseY < (dispConfig.canvasHeight - dispConfig.floorHeight)) &&
            (p5Canvas.mouseX > 0 && p5Canvas.mouseX < dispConfig.canvasWidth)) {

                // query grid display object
                [i,j]  = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
                onTarget = p5Canvas.game.onTarget(i,j);

                if(onTarget){ //should be inside game?
                    dragging = true;
                    p5Canvas.game.increment(i,j);
                    dragSetGroup = p5Canvas.game.gameGrid[i][j];
                    dragSet.push([i,j]);
                } else {
                    dragging = false;
                }

            }
          }
      }.bind(this);

      p5Canvas.mouseDragged = function () {

        if (dragging) {
            [i,j]  = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
            if (!dragSet.includes([i,j])){
                p5Canvas.game.gameGrid[i][j] = dragSetGroup;
                dragSet.push([i,j]);
            }
          }

      }

      p5Canvas.mouseReleased = function () {
        dragging = false;
      }

};

function setupCanvas(trialObj) {
    p5chunks = new p5((env) => {
        setupChunkingCanvas(env, trialObj = trialObj)
    }, 'chunking-canvas');
    return p5chunks
}


function reset() {
    // remove environment
    p5chunks.remove();
    setup();

}

module.exports = {
    setupCanvas, 
    reset
    };