var config = require("./displayConfig.js");
var uuid = require("./uuid.js")['UUID'];
var trials = require("./trials.js");
var ChunkCanvas = require("./chunkCanvases.js")["ChunkCanvas"];
var io = require('socket.io-client');
const socket = io.connect();

class ChunkGame {
  constructor(gridDisplay) {
    //setup in here
    this.gameID = uuid();
    this.gridDisplay = gridDisplay;
    this.trialList = trials.setupTrials();
    this.ntrials = _.filter(this.trialList,(trial)=>{return trial.trialType!='practice'}).length;
    this.nColors = config.highlightColors.length - 1; // -1 because first is default color

    this.gameFinished = false;

    this.nextTrial();
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid); // add stim to grid display

    this.setupElements();

    this.gameStartTime = Date.now();
  }

  nextTrial() {

    this.currentTrial = this.trialList.shift();

    // reset stim grid
    this.gridDisplay.setStimGrid(this.currentTrial.stimGrid);

    // new empty array for coloring
    this.newGrid();
    
    $('#practice-feedback').hide();

    if (this.currentTrial.trialType == 'normal-trial'){
      $("#reminders").show();
      $("#trial-counter").text('Shape ' + this.currentTrial.trialNum.toString() + ' of ' + this.ntrials.toString());
      $("#trial-text").hide();
    } else {
      $("#trial-counter").text('Practice Shape');
      $("#reminders").hide();
      $("#trial-text").text(this.currentTrial.trialText);
      $("#trial-text").show();  
    }

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

      if(this.currentTrial.successCondition !== null){
        if(this.currentTrial.successCondition(this.gameGrid)){
          this.saveData('trialEnd');

          this.currentTrial.trialNum == this.ntrials ? this.endGame() : this.nextTrial();

        } else {
          console.log('did not pass condition');
          $('#practice-feedback').show();
        };
      } else {

        this.saveData('trialEnd');

        this.currentTrial.trialNum == this.ntrials ? this.endGame() : this.nextTrial();
        
      };
    }
    else {
      console.log('you haven\'t filled in the whole structure!');
    };

  };

  reset(){
    this.currentTrial.nReset += 1;
    this.currentTrial.timeReset = Date.now();
    this.newGrid();

    $("#chunk-counter").text(
        this.nChunksHighlighted().toString() + " parts selected"
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

    $('#surveySubmit').click(() => {
      this.submit();
      return false;
    });

    // $('.form-group').change({},this.dropdownTip)

  }

  submit () {
    $('#thanks').show();
    $('#surveySubmit').hide();
    let surveyData = _.extend(this.dropdownData ,{
      'comments' : $('#comments').val().trim().replace(/\./g, '~~~'),
      'strategy' : $('#strategy').val().trim().replace(/\./g, '~~~'),
      'didCorrectly' : $('#didCorrectly option:selected').text(),
      'colorBlind' : $('#color option:selected').text(),
      'totalTimeAfterInstructions' : Date.now() - this.gameStartTime
    });
    //console.log("data is...");
    //console.log(game.data);
    this.saveData('survey', surveyData);

    this.gameFinished = true;

    if(urlParams.prolificPID != 'undefined'){
      
      setTimeout(() => {
        location.replace("https://app.prolific.co/submissions/complete?cc=751095B3");
      }, 500);
    }

    // if(_.size(game.urlParams) >= 4) {
    //   turk.submit(game.data, true);
    // } else {
    //   console.log("would have submitted the following :")
    //   console.log(game.data);
    // }
  }

  // dropdownTip(){
  //   var data = $(this).find('option:selected').val();
  //   // console.log(data);
  //   var commands = data.split('::');
  //   switch(commands[0]) {
  //   case 'color' :
  //     this.dropdownData = _.extend(this.dropdownData, {'ratePartner' : commands[1]}); break;
  //   case 'didCorrectly' :
  //     this.dropdownData = _.extend(this.dropdownData, {'confused' : commands[1]}); break;
  //   }

  // }

  endGame(){
    $("#main_div").hide();
    $("#exit_survey").show();
  }

  saveData(eventType, event_data) {

    let gameConfig = require('../../config.json');

    let data = {};

    data = _.extend(data,
      this.currentTrial, 
      {
      dbname: gameConfig.dbname,
      colname: gameConfig.colname,
      iterationName: gameConfig.iterationName,
      devMode: gameConfig.devMode,
      absoluteTime: Date.now(),
      eventType: eventType,
      prolificPID: urlParams.PROLIFIC_PID,
      prolificStudyID: urlParams.STUDY_ID,
      prolificSessionID: urlParams.SESSION_ID,
      gameID: this.gameID,
      gameGrid : this.gameGrid,
      gameStartTime: this.gameStartTime,
      relativeGameDuration: Date.now() - this.gameStartTime,
      relativeTrialDuration: Date.now() - this.currentTrial.trialStartTime,
      nChunksHighlighted: this.nChunksHighlighted(),
      highlightColors: config.highlightColors
      }
    );

    if(eventType != 'trialEnd'){
      data = _.extend(data, event_data);
    }

    // console.log(data);

    socket.emit('currentData', data);

  }

}

module.exports = { ChunkGame };
