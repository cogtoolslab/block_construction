var config = require("./displayConfig.js");
var trials = require("./trials.js");
var ChunkCanvas = require("./chunkCanvases.js")["ChunkCanvas"];

class ChunkGame {
  constructor(gridDisplay) {
    //setup in here
    this.gridDisplay = gridDisplay;
    this.trialList = trials.setupTrials();
    this.nColors = config.highlightColors.length - 1; // -1 because first is default color

    this.nextTrial();
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); // add stim to grid display

    $("#done-button").click(() => {
      //check if any blocks placed this turn, and let partner know if none placed
      this.nextTrial();

      // This prevents the form from submitting & disconnecting person
      return false;
    });

    $("#reset-button").click(() => {

        this.currentTrial.nReset += 1;
        this.newGrid();
  
        // This prevents the form from submitting & disconnecting person
        return false;
      });
  }

  nextTrial() {

    this.currentTrial = this.trialList.shift();

    // reset stim grid
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid);

    // new empty array for coloring
    this.newGrid();

    ChunkCanvas.p5chunks ? ChunkCanvas.p5chunks.remove() : false;
    ChunkCanvas.reset(this);
    return false;
  }
  
  newGrid(){
    this.gameGrid = Array(config.discreteEnvWidth)
    .fill()
    .map(() => Array(config.discreteEnvHeight).fill(0));

    this.gridDisplay.setGameGrid(this.gameGrid);
  }

  onTarget(i, j) {
    return this.currentTrial.stimGrid[i][j];
  }

  increment(i, j) {
    this.gameGrid[i][j] =
      this.gameGrid[i][j] + 1 < this.nColors + 1 ? this.gameGrid[i][j] + 1 : 1;

    this.gridDisplay.setGameGrid(this.gameGrid);
  }

  activeChunks() {
    /**
     * Returns list of chunk numbers that are presently used to highlight
     */
    // console.log(_.uniq(_.flatten(this.gameGrid)));
    return _.uniq(_.flatten(this.gameGrid));
  }

  nChunksHighlighted() {
    /**
     * Returns number of active highlight colors
     */

    return this.activeChunks().length - 1;
  }

}

module.exports = { ChunkGame };
