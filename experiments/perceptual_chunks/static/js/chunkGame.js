var config = require("./displayConfig.js");
var trials = require('./trials.js');

class ChunkGame {

    constructor(gridDisplay){
        //setup in here
        this.gridDisplay = gridDisplay;
        this.trialList = trials.setupTrials();
        this.nColors = config.highlightColors.length;

        this.currentTrial = this.nextTrial();
        this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); // add stim to grid display
        
    }

    nextTrial(){
        console.log('next trial');
        // new empty array for coloring
        this.gameGrid = Array(config.discreteEnvWidth).fill().map(() => Array(config.discreteEnvHeight).fill(0));
        this.gridDisplay.setGameGrid(this.gameGrid);

        // start new trial
        return(this.trialList.shift());

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