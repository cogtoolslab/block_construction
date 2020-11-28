var dispConfig = require("./displayConfig.js");
var gridDisplay = require("./gridDisplay.js")["gridDisplay"];
var p5 = require("./p5.js");

class ChunkCanvas {
  constructor() {
    this.p5chunks = null;
  }

  setupChunkingCanvas(p5Canvas, game) {
    //var testStim = trialObj.targetBlocks;

    p5Canvas.setup = function () {
      let stimulusCanvas = p5Canvas.createCanvas(
        dispConfig.canvasHeight,
        dispConfig.canvasWidth
      );
      stimulusCanvas.parent("chunking-canvas"); // add parent div
    };

    p5Canvas.draw = function () {
      p5Canvas.background(dispConfig.backgroundColor);
      gridDisplay.show(p5Canvas);
    };

    let dragging = false;
    let dragSet = (this.gameGrid = Array(dispConfig.discreteEnvWidth)
      .fill()
      .map(() => Array(dispConfig.discreteEnvHeight).fill(0)));
    let dragSetGroup = 0;
    let selectedSquare = null;

    // p5Canvas.mouseClicked = function () {

    //     //var toolSelected = true; // some condition to prevent clicking

    //     if (!dragging) {

    //     // if mouse in main environment
    //     if (p5Canvas.mouseY > 0 && (p5Canvas.mouseY < (dispConfig.canvasHeight - dispConfig.floorHeight)) &&
    //         (p5Canvas.mouseX > 0 && p5Canvas.mouseX < dispConfig.canvasWidth)) {

    //             // query grid display object
    //             let [i,j]  = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
    //             let onTarget = game.onTarget(i,j);

    //             if(onTarget){ //should be inside game?
    //                 // dragging = true;
    //                 //dragSetGroup = game.gameGrid[i][j];
    //                 game.increment(i,j);
    //                 // dragSet.push([i,j]);
    //             } else {
    //                 dragging = false;
    //             }

    //         }
    //     }
    // }.bind(this);

    p5Canvas.mousePressed = function () {
      //var toolSelected = true; // some condition to prevent clicking

      if (!dragging) {
        // if mouse in main environment
        if (
          p5Canvas.mouseY > 0 &&
          p5Canvas.mouseY < dispConfig.canvasHeight - dispConfig.floorHeight &&
          p5Canvas.mouseX > 0 &&
          p5Canvas.mouseX < dispConfig.canvasWidth
        ) {
          // query grid display object to get game coords
          let [i, j] = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
          let onTarget = game.onTarget(i, j);

          if (onTarget) {
            if (game.gameGrid[i][j] == 0) { // if starting new chunk, make newest color
                let new_color = game.nChunksHighlighted() + 1;
                game.gameGrid[i][j] = new_color < game.nColors + 1 ? new_color : 1;
            }
            dragging = true;
            dragSetGroup = game.gameGrid[i][j];
            // game.increment(i,j);
            dragSet[i][j] = 1;

          } else {
            dragging = false;
          }
        }
      }
    }.bind(this);

    p5Canvas.mouseDragged = function () {
      if (
        p5Canvas.mouseY > 0 &&
        p5Canvas.mouseY < dispConfig.canvasHeight - dispConfig.floorHeight &&
        p5Canvas.mouseX > 0 &&
        p5Canvas.mouseX < dispConfig.canvasWidth
      ) {
        if (dragging) {
          let [i, j] = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
          let onTarget = game.onTarget(i, j);

          if (onTarget) {
            if (dragSet[i][j] == 0) {
              game.gameGrid[i][j] = dragSetGroup;
              dragSet[i][j] = 1;
            }
          }
        }
      } else {
        dragging = false;
      }
    };

    p5Canvas.mouseReleased = function () {
      //console.log(dragSet);

      if (
        p5Canvas.mouseY > 0 &&
        p5Canvas.mouseY < dispConfig.canvasHeight - dispConfig.floorHeight &&
        p5Canvas.mouseX > 0 &&
        p5Canvas.mouseX < dispConfig.canvasWidth
      ) {
        let [i, j] = gridDisplay.queryGrid(p5Canvas.mouseX, p5Canvas.mouseY);
        let onTarget = game.onTarget(i, j);

        if (onTarget) {
          if (_.sum(_.flatten(dragSet)) == 1) {
            game.increment(i, j);
          }
        }
      }

      dragging = false;
      dragSet = this.gameGrid = Array(dispConfig.discreteEnvWidth)
        .fill()
        .map(() => Array(dispConfig.discreteEnvHeight).fill(0));

      $("#chunk-counter").text(
        game.nChunksHighlighted().toString() + " chunks selected"
      );
    };
  }

  setupCanvas(game) {
    this.p5chunks;
    this.p5chunks = new p5((env) => {
      this.setupChunkingCanvas(env, game);
    }, "chunking-canvas");
    return this.p5chunks;
  }

  reset(game) { //nothing to do with reset env button!
    this.oldp5chunks = this.p5chunks;
    this.oldp5chunks ? this.oldp5chunks.remove() : false;

    $("#chunk-counter").text(
      game.nChunksHighlighted().toString() + " chunks selected"
    );

    this.p5chunks = this.setupCanvas(game);
  }
}

module.exports = {
  ChunkCanvas: new ChunkCanvas(),
};
