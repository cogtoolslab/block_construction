var dispConfig = require('./displayConfig.js');
var gridDisplay = require('./gridDisplay.js')['gridDisplay'];
var p5 = require('./p5.js');

class ChunkCanvas{

    constructor(){
        this.p5chunks = null;
    }

    setupChunkingCanvas(p5Canvas, game) {

        //var testStim = trialObj.targetBlocks;

        p5Canvas.setup = function () {
            let stimulusCanvas = p5Canvas.createCanvas(dispConfig.canvasHeight, dispConfig.canvasWidth);
            stimulusCanvas.parent('chunking-canvas'); // add parent div 

            game.startTrial();

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
                    let [i,j]  = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
                    let onTarget = game.onTarget(i,j);

                    if(onTarget){ //should be inside game?
                        dragging = true;
                        game.increment(i,j);
                        dragSetGroup = game.gameGrid[i][j];
                        dragSet.push([i,j]);
                    } else {
                        dragging = false;
                    }

                }
            }
        }.bind(this);

        p5Canvas.mouseDragged = function () {

            if (p5Canvas.mouseY > 0 && (p5Canvas.mouseY < (dispConfig.canvasHeight - dispConfig.floorHeight)) &&
                (p5Canvas.mouseX > 0 && p5Canvas.mouseX < dispConfig.canvasWidth)) {

                if (dragging) {
                    let [i,j]  = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
                    if (!dragSet.includes([i,j])){
                        game.gameGrid[i][j] = dragSetGroup;
                        dragSet.push([i,j]);
                    }
                }
            } else {
                dragging = false;
            }

        }

        p5Canvas.mouseReleased = function () {
            dragging = false;
        }

    };

    setupCanvas(game) {
        this.p5chunks 
        this.p5chunks = new p5((env) => {
            this.setupChunkingCanvas(env, game)
        }, 'chunking-canvas');
        return this.p5chunks
    };

    reset(game){
        this.oldp5chunks = this.p5chunks;
        this.oldp5chunks ? this.oldp5chunks.remove() : false;
        this.p5chunks = this.setupCanvas(game);
    };

}

module.exports = {
    ChunkCanvas: new ChunkCanvas()
    };