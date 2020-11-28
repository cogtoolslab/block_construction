var _ = require('lodash');

var config = require("./displayConfig.js");
var structures = require("../assets/bitmapStructures.js");

var targetNames = Object.keys(structures.bitmaps);
var ntargets = targetNames.length;

var printStructure = function(trialNumber){
    console.log(structures.bitmaps[targetNames[trialNumber]]);
}

class Trial {

    constructor(trialNum, targetName) {
        this.trialNum = trialNum;
        this.targetName = targetName;
        this.bitmap = structures.bitmaps[this.targetName];
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

}


function setupTrials() {

    var trialList = [];

    var trialNum = 0
    targetNames.forEach(targetName => {
        trialList.push(new Trial(trialNum,targetName));
    });

    trialList = _.shuffle(trialList);

    return trialList
}


module.exports = {
    printStructure: printStructure,
    setupTrials: setupTrials
    };