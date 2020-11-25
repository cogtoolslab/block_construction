var config = require("./displayConfig.js");

class GridDisplay {
  constructor() {
    this.grid = Array(config.discreteEnvWidth)
      .fill()
      .map(() => Array(config.discreteEnvHeight).fill(0));

    this.grid_xs = new Array(config.discreteEnvWidth); // x ordinates
    this.grid_ys = new Array(config.discreteEnvHeight); // y ordinates

    let i = 0;

    while (i < config.discreteEnvWidth) {
      this.grid_xs[i] = i * (config.sF) + config.sF/2;

      // this.grid_x[i] =
      //   config.stimScale * i + config.canvasWidth / 2 - config.stimScale / 2;
      i = i + 1;
    }

    let j = 0;
    while (j < config.discreteEnvHeight) {
      this.grid_ys[j] =
        config.canvasHeight -
        config.floorHeight -
        (config.sF * j) -
        config.sF;

      j = j + 1;
    }



    console.log(this.grid_xs,this.grid_ys);

  }

  updateGrid(bitmap) {
    this.grid = bitmap;
  }

  show(env) {

    var i = 0;
    while (i < this.grid.length) {
      var j = 0;
      while (j < this.grid[i].length) {
        var squareColor = config.highlightColors[this.grid[i][j]];
        env.push();
        env.translate(this.grid_xs[i], this.grid_ys[j]);
        env.rectMode(env.CENTER);
        env.stroke([190, 190, 255]);
        env.fill(squareColor);
        // env.noFill();
        // env.translate(this.grid_xs[i], this.grid_ys[j]);
        env.rect(0, 0, config.stimScale, config.stimScale);
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
    //       this.grid[i - config.grid_left][j - config.grid_bottom]
    //     ]
    //       ? config.highlightColors[
    //           this.grid[i - config.grid_left][j - config.grid_bottom]
    //         ]
    //       : [0, 0, 0, 0];
    //     env.push();
    //     env.rectMode(env.CENTER);
    //     env.stroke([190, 190, 255]);
    //     env.fill(squareColor);
    //     // env.noFill();
    //     env.translate(this.grid_x[i], this.grid_y[j]);
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
