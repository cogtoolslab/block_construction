var dispConfig = require('./displayConfig.js');
var p5 = require('./p5.js');

function setupChunkingCanvas(p5stim, trialObj) {

    //var testStim = trialObj.targetBlocks;

    p5stim.setup = function () {
        stimulusCanvas = p5stim.createCanvas(dispConfig.canvasHeight, dispConfig.canvasWidth);
        stimulusCanvas.parent('chunking-canvas'); // add parent div 
    };

    p5stim.draw = function () {
        p5stim.background(220);
        // showStimulus(p5stim, testStim, individual_blocks = false, blockColor = trialObj.blockColor);
        //showGrid(p5stim);
        // showFloor(p5stim);
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