var config = require("./displayConfig.js");

class GridDisplay {
  constructor() {
    // keep copies of these two grids here. Seems redundant..
    this.stimGrid = Array(config.discreteEnvWidth)
      .fill()
      .map(() => Array(config.discreteEnvHeight).fill(0));

    this.gameGrid = Array(config.discreteEnvWidth)
    .fill()
    .map(() => Array(config.discreteEnvHeight).fill(0));

    this.stimGrid_xs = new Array(config.discreteEnvWidth); // x ordinates
    this.stimGrid_ys = new Array(config.discreteEnvHeight); // y ordinates

    let i = 0;

    while (i < config.discreteEnvWidth) {
      this.stimGrid_xs[i] = i * (config.sF);

      // this.stimGrid_x[i] =
      //   config.stimScale * i + config.canvasWidth / 2 - config.stimScale / 2;
      i = i + 1;
    }

    let j = 0;
    while (j < config.discreteEnvHeight) {
      this.stimGrid_ys[j] =
        config.canvasHeight -
        config.floorHeight -
        (config.sF * j) -
        (3/2)*config.sF;

      j = j + 1;
    }
    // console.log(this.stimGrid_xs,this.stimGrid_ys);

  }

  queryGrid(mouseX, mouseY){
    
    var i = 0;
    while (mouseX - (4*config.sF/3) > (this.stimGrid_xs[i])){
      i += 1;
    }

    var j = 0;
    while (mouseY - 5 < this.stimGrid_ys[j]){
      j += 1;
    }

    return([i,j]);

  }

  setStimGrid(bitmap) {
    this.stimGrid = bitmap;
  }

  setGameGrid(bitmap) {
    this.gameGrid = bitmap;
  }

  show(env) {

    var i = 0;
    while (i < this.stimGrid.length) {
      var j = 0;
      while (j < this.stimGrid[i].length) {
        env.push();
        env.translate(this.stimGrid_xs[i], this.stimGrid_ys[j]);
        env.rectMode(env.CORNER);
        if(this.stimGrid[i][j]) { // if part of target
          var squareColor = config.highlightColors[this.gameGrid[i][j]];
          env.stroke(config.gridLineColor);
          env.fill(squareColor);
          // env.noFill();
          // env.translate(this.stimGrid_xs[i], this.stimGrid_ys[j]);
          env.rect(0, 0, config.stimScale, config.stimScale);
        } else { // outside of target
          // var squareColor = config.gridColor;
          // // env.stroke([190, 190, 255]);
          // env.noStroke();
          // //env.fill(squareColor);
          // env.rect(0, 0, config.stimScale, config.stimScale);
        }
        
        env.pop();
        j = j + 1;
      }
      i = i + 1;
    }

    // let i = config.grid_left;
    // while (i < config.grid_right) {
    //   let j = config.grid_bottom;
    //   while (j < config.grid_top) {
    //     console.log(i - config.grid_left, j - config.grid_bottom);
    //     var squareColor = config.highlightColors[
    //       this.stimGrid[i - config.grid_left][j - config.grid_bottom]
    //     ]
    //       ? config.highlightColors[
    //           this.stimGrid[i - config.grid_left][j - config.grid_bottom]
    //         ]
    //       : [0, 0, 0, 0];
    //     env.push();
    //     env.rectMode(env.CENTER);
    //     env.stroke([190, 190, 255]);
    //     env.fill(squareColor);
    //     // env.noFill();
    //     env.translate(this.stimGrid_x[i], this.stimGrid_y[j]);
    //     env.rect(0, 0, squareWidth, squareHeight);
    //     env.pop();
    //     j = j + 1;
    //   }
    //   i = i + 1;
    // }
  }
}

module.exports = {
  gridDisplay: new GridDisplay(),
};
