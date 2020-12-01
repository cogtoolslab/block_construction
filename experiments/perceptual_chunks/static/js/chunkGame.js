var config = require("./displayConfig.js");
var trials = require("./trials.js");
var ChunkCanvas = require("./chunkCanvases.js")["ChunkCanvas"];
var io = require('socket.io-client');
const socket = io.connect();

class ChunkGame {
  constructor(gridDisplay) {
    //setup in here
    this.gridDisplay = gridDisplay;
    this.trialList = trials.setupTrials();
    this.ntrials = this.trialList.length;
    this.nColors = config.highlightColors.length - 1; // -1 because first is default color

    this.nextTrial();
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); // add stim to grid display

    this.setupElements();
  }

  nextTrial() {

    this.currentTrial = this.trialList.shift();

    // reset stim grid
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid);

    // new empty array for coloring
    this.newGrid();

    $("#trial-counter").text('Trial ' + this.currentTrial.trialNum.toString() + ' of ' + this.ntrials.toString());

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

  nSquaresHighlighted() {
    let nHighlightedSquares = _.sum(_.map(_.flatten(this.gameGrid), (x) => {return (x > 0 ? 1 : 0)}));
    return nHighlightedSquares;
  }

  filledShape(){
    return this.nSquaresHighlighted() == this.currentTrial.nSquaresInTarget();
  }

  done(){
    //check if any blocks placed this turn, and let partner know if none placed
    if (this.nSquaresHighlighted() == this.currentTrial.nSquaresInTarget()){

      this.saveData('trialEnd');

      if (this.currentTrial.trialNum == this.ntrials) {
        this.endGame();
      }
      else {
        this.nextTrial();
      }
    }
    else {
      console.log('you haven\'t filled in the whole structure!');
    }

  }

  reset(){
    this.currentTrial.nReset += 1;
    this.newGrid();

    $("#chunk-counter").text(
        this.nChunksHighlighted().toString() + " chunks selected"
      );
  }


  setupElements(){

    /**
     * These button interactions are in a silly place- I should move them outside of this class at some point
     */

    $("#done-button").click(() => {
        this.done();
        // This prevents the form from submitting & disconnecting person
        return false;
      });

    $("#done-button")
    .mouseover(() => {
        if (!this.filledShape()){
            $("#unfinished-shape").show();
        }
    })
    .mouseout(() => {
        $("#unfinished-shape").hide();
    })
    ;
  
    $("#reset-button").click(() => {
          this.reset();
          // This prevents the form from submitting & disconnecting person
          return false;
        });

  }

  endGame(){
    $("#main_div").hide();
    $("#exit_survey").show();
  }

  saveData(eventType){

    let gameConfig = require('../../config.json');

    let data = _.extend(this.currentTrial, 
      {
      dbname: gameConfig.dbname,
      colname: gameConfig.colname,
      iterationName: gameConfig.iterationName,
      absoluteTime: Date.now(),
      eventType: eventType,
      gameGrid : this.gameGrid,
      nChunksHighlighted: this.nChunksHighlighted(),
      highlightColors: config.highlightColors
      }
    );

    socket.emit('currentData', data);

  }

}

module.exports = { ChunkGame };
