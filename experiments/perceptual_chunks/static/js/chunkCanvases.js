var dispConfig = require('./displayConfig.js');
var gridDisplay = require('./grid.js');
var trials = require('./trials.js');
var p5 = require('./p5.js');

function setupChunkingCanvas(p5Canvas, trialObj) {

    //var testStim = trialObj.targetBlocks;

    p5Canvas.setup = function () {
        stimulusCanvas = p5Canvas.createCanvas(dispConfig.canvasHeight, dispConfig.canvasWidth);
        stimulusCanvas.parent('chunking-canvas'); // add parent div 
        gridDisplay.grid.setup();
        trials.printStructure();

    };

    p5Canvas.draw = function () {
        p5Canvas.background(220);
        gridDisplay.grid.show(p5Canvas);


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