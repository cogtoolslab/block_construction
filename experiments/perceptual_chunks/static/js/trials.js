var _ = require('lodash');

var config = require("./displayConfig.js");
var gameConfig = require("../../config.json");
var structures = require("../assets/bitmapStructures.js");

var targetNames = Object.keys(structures.targets);
var ntargets = targetNames.length;

class Trial {

    constructor(trialNum, targetName, trialType, trialText="") {
        this.trialType = trialType;
        this.trialNum = trialNum;
        this.targetName = targetName;
        this.trialText = trialText;
        
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
        // trialList.push(new Trial(0,'demo-1','practice'));
        // trialList.push(new Trial(0,'demo-2','practice'));
        // trialList.push(new Trial(0,'demo-3','practice'));
        trialList.push(new Trial(0,'practice-structure-1','practice',trialText="Clicking a single square will change its color. Clicking and dragging will spread the color from that square to adjacent squares. Have a play, then try coloring this square with a single color, before pressing \'Done\'."));
        trialList.push(new Trial(0,'practice-structure-2','practice',trialText="Clicking and dragging is usually the fastest way to color multiple squares. Color this strip of squares, then press \'Done\'."));
        trialList.push(new Trial(0,'practice-structure-3','practice',trialText="Clicking on a grey grid-square will give you a new color (if there is one available). Remember that the specific colors don't matter, but you should use different colors for different 'parts'. The parts in this example are obvious, because they are not touching each other- try coloring them each in a different color."));
        trialList.push(new Trial(0,'practice-structure-4','practice', trialText="Great job! The parts in this shape are less certain. It kind of looks like the letter \'H\'. Can you color in the two vertical bars, then the four squares making up the bar in the middle? This is the last practice shape- after this one you'll start the actual shapes."));
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