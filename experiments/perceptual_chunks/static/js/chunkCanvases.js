var dispConfig = require('./displayConfig.js');
var gridDisplay = require('./gridDisplay.js')['gridDisplay'];
var p5 = require('./p5.js');
var ChunkGame = require('./chunkGame.js')['ChunkGame'];

function setupChunkingCanvas(p5Canvas, trialObj) {

    //var testStim = trialObj.targetBlocks;

    p5Canvas.setup = function () {
        stimulusCanvas = p5Canvas.createCanvas(dispConfig.canvasHeight, dispConfig.canvasWidth);
        stimulusCanvas.parent('chunking-canvas'); // add parent div 
        game = new ChunkGame(gridDisplay);

        game.startTrial();

    };

    p5Canvas.draw = function () {
        p5Canvas.background(220);
        gridDisplay.show(p5Canvas);

    };

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