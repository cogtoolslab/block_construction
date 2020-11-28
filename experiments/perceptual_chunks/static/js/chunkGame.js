var config = require("./displayConfig.js");
var trials = require('./trials.js');
var ChunkCanvas = require('./chunkCanvases.js')['ChunkCanvas'];

class ChunkGame {

    constructor(gridDisplay){
        //setup in here
        this.gridDisplay = gridDisplay;
        this.trialList = trials.setupTrials();
        this.nColors = config.highlightColors.length;

        this.nextTrial();
        this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); // add stim to grid display

        $("#done-button").click(() => {
            //check if any blocks placed this turn, and let partner know if none placed
            this.nextTrial();
        
            // This prevents the form from submitting & disconnecting person
            return false;
          });


    }

    nextTrial(){
        console.log('next trial');

        this.currentTrial = this.trialList.shift();

        // reset stim grid
        this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); 

        // new empty array for coloring
        this.gameGrid = Array(config.discreteEnvWidth).fill().map(() => Array(config.discreteEnvHeight).fill(0));
        this.gridDisplay.setGameGrid(this.gameGrid);

        ChunkCanvas.p5chunks ? ChunkCanvas.p5chunks.remove() : false;
        ChunkCanvas.reset(this);
        return false;

    }

    startTrial(){        

    }

    onTarget(i, j){
        return this.currentTrial.stimGrid[i][j];
    }

    increment(i, j){
        this.gameGrid[i][j] = (this.gameGrid[i][j] + 1) % this.nColors; //double check this is right..
        
        this.gridDisplay.setGameGrid(this.gameGrid);
    }


}

module.exports = {ChunkGame}