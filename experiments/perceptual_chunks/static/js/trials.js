var _ = require('lodash');

var config = require("./displayConfig.js");
var gameConfig = require("../../config.json");
var structures = require("../assets/bitmapStructures.js");

var targetNames = Object.keys(structures.targets);
var ntargets = targetNames.length;

class Trial {

    constructor(trialNum, targetName, trialType) {
        this.trialType = trialType;
        this.trialNum = trialNum;
        this.targetName = targetName;
        
        if (trialType == 'practice') {
            this.bitmap = structures.practice[this.targetName];
        } else {
            this.bitmap = structures.targets[this.targetName];
        }

        this.stimGrid = this.setupStimGrid();
        this.nReset = 0;
    }

    setupStimGrid(){

        var stimGrid = Array(config.discreteEnvWidth).fill().map(() => Array(config.discreteEnvHeight).fill(0));

        const yOffset = 0;
        const xOffset = 5;

        var x = 0
        while (x < this.bitmap.length){
            var y = 0
            while (y < this.bitmap[x].length){
                stimGrid[xOffset+x][yOffset+y] = this.bitmap[x][y];
                y = y+1;
            }
            x = x+1;
        }
        return stimGrid;
    }

    nSquaresInTarget(){
        //console.log(_.sum(_.flatten(this.bitmap)));
        return _.sum(_.flatten(this.bitmap));
    }

}


function setupTrials() {

    let trialList = [];
    
    if (!gameConfig.devMode){
        trialList.push(new Trial(0,'practice-structure-1','practice'));
        trialList.push(new Trial(0,'practice-structure-2','practice'));
        trialList.push(new Trial(0,'practice-structure-3','practice'));
        trialList.push(new Trial(0,'practice-structure-4','practice'));
    }

    let trialNum = 0;
    _.shuffle(targetNames).forEach(targetName => {
        trialNum += 1;
        trialList.push(new Trial(trialNum,targetName,'normal-trial'));
    });

    return trialList
}


module.exports = {
    setupTrials: setupTrials
    };