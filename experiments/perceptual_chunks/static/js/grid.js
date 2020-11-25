var config = require("./displayConfig.js");

class Grid {
  constructor() {
    // hacky solution to displaying grid in correct location
    this.grid_left = -9;
    this.grid_right = 11;
    this.grid_bottom = 0;
    this.grid_top = 20;
  }

  setup() {
    this.grid_x = new Array(this.grid_right - this.grid_left);
    this.grid_y = new Array(this.grid_top - this.grid_bottom);

    let i = this.grid_left;

    while (i < this.grid_right) {
      this.grid_x[i] =
        config.stimScale * i + config.canvasWidth / 2 - config.stimScale / 2;
      i = i + 1;
    }

    let j = this.grid_bottom;
    while (j < this.grid_top) {
      this.grid_y[j] =
        config.canvasHeight -
        config.floorHeight -
        config.stimScale / 2 -
        config.stimScale * j;
      j = j + 1;
    }
  }

  show(env) {
    var squareWidth = config.stimScale;
    var squareHeight = config.stimScale;

    const grid_left = -9;
    const grid_right = 11;
    const grid_bottom = 0;
    const grid_top = 20;

    let i = grid_left;
    while (i < grid_right) {
      let j = grid_bottom;
      while (j < grid_top) {
        env.push();
        env.rectMode(env.CENTER);
        env.stroke([190, 190, 255]);
        env.noFill();
        env.translate(this.grid_x[i], this.grid_y[j]);
        env.rect(0, 0, squareWidth, squareHeight);
        env.pop();
        j = j + 1;
      }
      i = i + 1;
    }
  }
}

module.exports = {
  grid: new Grid(),
};
