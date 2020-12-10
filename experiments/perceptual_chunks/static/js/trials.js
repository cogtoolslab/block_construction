var _ = require('lodash');

var config = require("./displayConfig.js");
var gameConfig = require("../../config.json");
var structures = require("../assets/bitmapStructures.js");

var targetNames = Object.keys(structures.targets);
var ntargets = targetNames.length;

class Trial {

    constructor(trialNum, targetName, trialType, trialText="", successCondition=null) {
        this.trialType = trialType;
        this.trialNum = trialNum;
        this.targetName = targetName;
        this.trialText = trialText;
        this.successCondition = successCondition;
        
        if (trialType == 'practice') {
            this.bitmap = structures.practice[this.targetName];
        } else {
            this.bitmap = structures.targets[this.targetName];
        }

        this.stimGrid = this.setupStimGrid();
        this.nReset = 0;
        this.timeReset = Date.now();
        this.trialStartTime = Date.now();
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
        // demo trials
        // trialList.push(new Trial(0,'demo-1','practice'));
        // trialList.push(new Trial(0,'demo-2','practice'));
        // trialList.push(new Trial(0,'demo-2','practice'));
        trialList.push(new Trial(0,'practice-structure-1','practice',trialText="Clicking a single square will change its color. Clicking and dragging will spread the color from that square to adjacent squares. Have a play, then try coloring this square with a single color, before pressing \'Done\'.", successCondition = (gameGrid) => {
            if(gameGrid[8][3]==0){console.error('something wrong with grid setup')};
            return(
                (gameGrid[8][3] == gameGrid[8][4]) &
                (gameGrid[8][4] == gameGrid[9][3]) &
                (gameGrid[9][3] == gameGrid[9][4])
                )
        }));
        trialList.push(new Trial(0,'practice-structure-2','practice',trialText="Clicking and dragging is usually the fastest way to color multiple squares. Color this strip of squares, then press \'Done\'.", successCondition = (gameGrid) => {
            let first = gameGrid[5][3];
            let pass = true;
            var i;
            for (i=5; i<=12; i++) {
                pass = pass & (gameGrid[i][3] == first);
            }
            return pass;
        }));
        trialList.push(new Trial(0,'practice-structure-3','practice',trialText="Clicking on a grey grid-square will give you a new color (if there is one available). Remember that the specific colors don't matter, but you should use different colors for different 'parts'. The parts in this example are obvious, because they are not touching each other- try coloring them each in a different color."));
        trialList.push(new Trial(0,'practice-structure-4','practice', trialText="Great job! The parts in this shape are less clear. It kind of looks like the letter \'H\' made from a left vertical bar, a right vertical bar, and four squares making up the bar in the middle. Can you color these three parts in different colors? This is the last practice shape- after this one you'll start the actual shapes!",  successCondition = (gameGrid) => {
            // left
            var left = true;
            let first_l = gameGrid[6][1];
            var i;
            for (i=6; i<=7; i++) {
                var j;
                for (j=1; j<=6; j++) {
                    left = left & (gameGrid[i][j] == first_l);
                }
            }

            // right
            let first_r = gameGrid[10][1];
            var right = first_r != first_l;
            var i;
            for (i=10; i<=11; i++) {
                var j;
                for (j=1; j<=6; j++) {
                    right = right & (gameGrid[i][j] == first_r);
                }
            }

            // middle
            let first_m = gameGrid[8][3];
            var middle = (first_m != first_r) & (first_m != first_l);

            var i;
            for (i=8; i<=9; i++) {
                var j;
                for (j=3; j<=4; j++) {
                    middle = middle & (gameGrid[i][j] == first_m);
                }
            }
            return (left & right & middle);
        }));
    }

    let trialNum = 0;
    _.shuffle(targetNames).forEach(targetName => {
        trialNum += 1;
        trialList.push(new Trial(trialNum,targetName,'normal-trial'));
    });

    trialList = [new Trial(1,'hand_selected_008','normal-trial')];

    return trialList
}


module.exports = {
    setupTrials: setupTrials
    };