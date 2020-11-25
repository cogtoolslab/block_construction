var config = require("./displayConfig.js");
var trials = require('./trials.js');

class ChunkGame {

    constructor(gridDisplay){
        //setup in here
        this.gridDisplay = gridDisplay;
        this.trialList = trials.setupTrials();

        this.currentTrial = this.nextTrial();
        console.log('current trial: ', this.currentTrial.stimGrid);
        this.gridDisplay.updateGrid(this.currentTrial.stimGrid); // add stim to grid display
        
    }

    nextTrial(){
        // new empty array for coloring
        this.gameGrid = Array(config.discreteEnvWidth).fill().map(() => Array(config.discreteEnvHeight).fill(0));
        
        // start new trial
        return(this.trialList.shift());

    }

    startTrial(){        

    }

}

module.exports = {ChunkGame}