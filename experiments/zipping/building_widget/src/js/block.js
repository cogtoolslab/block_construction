// var config = require('./display_config.js');
var Matter = require('./matter.js');

class Block {
  constructor(blockKind, x, y, rotated,
              testing_placement = false, x_index = null,  y_index = null) {

    this.blockKind = blockKind;
    this.x_index = x_index;
    this.y_index = y_index;
    this.x = x;
    this.y = y;
    this.color = this.blockKind.blockColor;
    this.internalStrokeColor = this.blockKind.internalStrokeColor;

    if (rotated) {
        this.w = blockKind.h * config.sF;
        this.h = blockKind.w * config.sF;
    } else {
        this.w = blockKind.w * config.sF;
        this.h = blockKind.h * config.sF;
    }

    if (!testing_placement) {
      this.originalX = x * config.worldScale;
      this.originalY = y * config.worldScale;
      
    } else {
    }
  }
  
  // Display the block
  show(env) {

    let x_top_corner;
    let y_top_corner;
    if (this.blockKind.w % 2 == 1) {
      x_top_corner = this.x_index*config.sF + config.sF/2;
    } else {
      x_top_corner = this.x_index*config.sF + config.sF;
    }

    if(this.blockKind.h % 2 == 1) {
      y_top_corner = (config.canvasHeight - config.floorHeight) - (this.y_index + this.blockKind.h - 0.5)*config.sF;
    } else {
      y_top_corner = (config.canvasHeight - config.floorHeight) - (this.y_index + this.blockKind.h - 1)*config.sF;
    }

    env.push(); //saves the current drawing style settings and transformations
    env.rectMode(env.CENTER);
    env.translate(x_top_corner, y_top_corner);
    env.fill(this.color);
    env.rect(0, 0, this.w, this.h);

    if (config.chocolateBlocks) {
      this.blockKind.drawChocolateBlocks(env);
    }

    env.noFill();
    env.stroke(config.strokeColor);
    env.strokeWeight(3);
    env.rect(0, 0, this.w, this.h);
    env.pop();
  }

  snapBodyToGrid () {
    // snaps matter locations of block bodies to grid
    // to be called after all blocks are sleeping?  
    var currentX = this.body.position.x / config.worldScale;
    var currentY = this.body.position.y / config.worldScale;
    var snappedX;
    var snappedY = currentY;
    if (((this.blockKind.w % 2 == 1) && (Math.abs(this.body.angle) % (Math.PI / 2) < Math.PI / 4)) ||
        ((this.blockKind.h % 2 == 1) && (Math.abs(this.body.angle) % (Math.PI / 2) > Math.PI / 4))) {
      snappedX = ((currentX + config.stim_scale / 2) % (config.stim_scale) < (config.stim_scale / 2) ?
                  currentX - (currentX % (config.stim_scale / 2)) :
                  currentX - (currentX % (config.stim_scale)) + (config.stim_scale / 2));
    } else {
      snappedX = (currentX % (config.stim_scale) < (config.stim_scale / 2) ?
                  currentX - currentX % (config.stim_scale) :
                  currentX - currentX % (config.stim_scale) + config.stim_scale);
    }
    var snapped_location = Matter.Vector.create(snappedX * config.worldScale, snappedY * config.worldScale);
    Matter.Body.setPosition(this.body, snapped_location);
  }

  can_be_placed_discrete (discreteWorld) {
    var x = this.x_index;
    var y = this.y_index;
    var free = true;
    for (let i = x; i < x+this.blockKind.w; i++){
      for (let j = y; j < y+this.blockKind.h; j++){
        free = free && discreteWorld[i][j];
      }
    }

    return free;
  }

  checkMotion () {
    var xMove = Math.abs(this.body.position.x - this.originalX) > 10;
    var yMove = Math.abs(this.body.position.y - this.originalY) > 10;
    var rotated = Math.abs(this.body.angle) > 0.70

    return (xMove || yMove || rotated)
  }

  getDiscreteBlock(){
    return {
      x: this.x_index,
      y: this.y_index,
      width: this.blockKind.w,
      height: this.blockKind.h
    };
  };

  testShift(discreteXOffset, discreteEnvWidth){
    let newXIndex = this.x_index + discreteXOffset;
    // newX = this.x + discreteXOffset * config.sF;
    return (newXIndex + this.width < discreteEnvWidth) & (newXIndex > 0);
  }

  shiftBlock(discreteXOffset, discreteWorld){
    let newXIndex = this.x_index + discreteXOffset;
    // newX = this.x + discreteXOffset * config.sF;
    this.x_index += discreteXOffset;

    this.x += discreteXOffset * config.sF;
    
    return this;
  }

  collided(x, y) {
    return (this.x - this.w/2 <= x) && (x <= this.x + this.w/2) &&
           (this.y - this.h/2 <= y) && (y <= this.y + this.h/2);
  }

}

module.exports = Block;
