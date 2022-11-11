// Experiment frame, with P5 canvas
// var config = require('./display_config.js');
var p5 = require('./p5.js');
var Boundary = require('./boundary.js');
var BlockMenu = require('./blockMenu.js');
var BlockKind = require('./blockKind.js');
var Block = require('./block.js');
var display = require('./displayStimuli.js');
var scoring = require('./scoring.js');
var imagePath = '../img/';

class BlockUniverse {

  constructor() {
    this.scoring = false;

    this.blocks = [];
    this.blockKinds = [];
    this.propertyList = [];

    this.events = {
        "blockActivated": [],
    };

    // Block placement variables
    this.isPlacingObject = false;
    this.rotated = false;
    this.selectedBlockKind = null;
    this.disabledBlockPlacement = false;
    this.snapBodiesPostPlacement = true;
    this.postSnap = false;

    // Store world
    this.discreteWorld = new Array(config.discreteEnvWidth);
    this.discreteWorldPrevious = new Array();

    // Task variables
    this.trialStart = Date.now()
    this.timeLastPlaced = Date.now();
    this.timeBlockSelected = Date.now();

    this.blockDims = config.blockDims;
    this.blockNames = config.blockNames;

    this.sendingBlocks = [];

    // Scaling values
    display.grid.setup(); // initialize grid

    this.blockMenu = this.setupBlockMenu();

    this.revealTarget = false;

    this.endCondition = null;

    this.trialObj = {};

  }

  addEventListener(name, handler) {
      this.events[name].push(handler);
  }

  removeEventListener(name, handler) {
      if (!this.events.hasOwnProperty(name)) return;
      const index = this.events[name].indexOf(handler);
      if (index != -1)
          this.events[name].splice(index, 1);
  }

  setupEnvs(trialObj, showStim, showBuild, selectionMode = false, callback) {
    var localThis = this;
    this.trialObj = trialObj;
    this.selectionMode = selectionMode;

    this.blocks = [];

    if (showStim) {
      this.p5stim = new p5((env) => {
        localThis.setupStimulus(env);
      }, 'stimulus-canvas');
    };

    if (showBuild) {
      this.p5env = new p5((env) => {
        localThis.setupBuilding(env);
      }, 'environment-canvas');
    };
    if (callback !== undefined) {
      callback();
    }
  };


  setupStimulus(p5stim) {
    var localThis = this;

    this.targetBlocks = display.translateTower(this.trialObj.stimulus, this.trialObj.offset); //translate from config
    p5stim.setup = function () {
      p5stim
        .createCanvas(config.stimCanvasWidth, config.stimCanvasHeight)
        .parent('stimulus-canvas'); // add parent div 

    };

    p5stim.targetBlocksDrawable = config.stimSilhouette ?
      this.targetBlocks.map(block => {
        block.color = config.silhouetteColor;
        block.internalStrokeColor = config.silhouetteColor;
        return block;
      }) :
      this.targetBlocks.map(block => {
        var colorIndex = this.getBlockColorIndex([block.width, block.height]);
        block.color = config.buildColors[colorIndex];
        block.internalStrokeColor = config.internalStrokeColors[colorIndex];
        return block;
      });

    // let targetBlocksColored = this.targetBlocks.map(block => {
    //   var colorIndex = this.getBlockColorIndex([block.width, block.height]);
    //   block.color = config.buildColors[colorIndex];
    //   block.internalStrokeColor = config.internalStrokeColors[colorIndex];
    //   return block;
    // });

    // let targetBlocksSilhouette = this.targetBlocks.map(block => {
    //   block.color = config.silhouetteColor;
    //   block.internalStrokeColor = config.silhouetteColor;
    //   return block;
    // });

    // var targetBlocksDrawable = config.stimSilhouette ? targetBlocksSilhouette : targetBlocksColored;

    p5stim.draw = function () {

      p5stim.background(220);
      display.showStimulus(p5stim, p5stim.targetBlocksDrawable, config.stimIndividualBlocks);
      if (config.showStimFloor) {
        display.showStimFloor(p5stim, config.stimFloorType, config.stimTickMark);
      };

      if (config.showStimGrid) { // Grid
        display.grid.show(p5stim);
      };

      if (config.displayBuiltInStim) { // Reconstruction (from other participant)
        display.showReconstruction(p5stim, localThis.sendingBlocks, false);
      }

      if (config.showStimMenu) { // Menu
        localThis.blockMenu.show(p5stim, false);
      };

    };

  };

  setupBlockMenu() {
    // Create block kinds that will appear in environment &
    // menu. Later on this will need to be represented in each task.
    var c = 0;
    this.blockDims.forEach((dims, i) => {
      this.blockKinds.push(new BlockKind(dims[0], dims[1], config.buildColors[c], this.blockNames[i], config.internalStrokeColors[c]));
      c++;
    });

    // Create Block Menu
    return new BlockMenu(config.menuHeight, this.blockKinds);
  }

  setupBoundaries() {
    this.ground = new Boundary(
      config.envCanvasWidth / 2,
      config.floorY,
      config.envCanvasWidth * 1.5,
      config.floorHeight
    );
    this.leftSide = new Boundary(
      -30, config.envCanvasHeight / 2, 60, config.envCanvasHeight
    );
    this.rightSide = new Boundary(
      config.envCanvasWidth + 30, config.envCanvasHeight / 2, 60, config.envCanvasHeight
    );

  }

  setupBuilding(env) {

    // reset discrete world representation
    for (let i = 0; i < this.discreteWorld.length; i++) {
      this.discreteWorld[i] = new Array(config.discreteEnvHeight).fill(true); // true represents free
    }

    // Processing JS Function, defines initial environment.
    env.setup = function () {
      // Create Experiment Canvas
      // creates a P5 canvas (which is a wrapper for an HTML canvas)
      var envCanvas = env.createCanvas(config.envCanvasWidth, config.envCanvasHeight);
      envCanvas.parent('environment-canvas'); // add parent div 

      //this.setupBlockMenu();
      this.setupBoundaries();

      if (this.selectionMode) {
        // add blocks to canvas

        // disable block placement


      };

    }.bind(this);

    env.draw = function () { // Called continuously by Processing JS 
      env.background(220);
      this.ground.show(env);
      this.leftSide.show(env);
      this.rightSide.show(env);
      display.showStimFloor(env);
      // display.showMarkers(env);

      // Menu & grid
      if (config.hideBuildingMenu) {
        // do nothing
      } else {
        // shoe menu
        this.blockMenu.show(env, this.disabledBlockPlacement);
      }
      display.grid.show(env);

      if (this.trialObj.condition == 'practice' && !this.scoring) {
        display.showStimulus(env, this.targetBlocks, true);
      }

      this.blocks.forEach(b => {
        b.show(env);
      });

      // Show outline of block snapped to grid when placing object
      if (this.isPlacingObject) {
        this.selectedBlockKind.showGhost(
          env, env.mouseX, env.mouseY, this.rotated, this.discreteWorld, this.disabledBlockPlacement
        );
      }

      if (this.revealTarget) {
        display.showStimulus(env, this.targetBlocks, false, config.revealedTargetColor);
      }

    }.bind(this);


    //ADD IF TO EVENT HANDLER, CHANGE TURNS ON BUTTON

    env.mouseDragged = function () {
      this.blocks
          .filter((block) => block.collided(env.mouseX, env.mouseY))
          .forEach(block => {
            this.events["blockActivated"].forEach(f => f(block));
          });
    }.bind(this);

    env.mouseClicked = function () {
      this.blocks
          .filter((block) => block.collided(env.mouseX, env.mouseY))
          .forEach(block => {
            this.events["blockActivated"].forEach(f => f(block));
          });

      if (!this.disabledBlockPlacement) {

        // if mouse in main environment
        if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight - config.menuHeight) &&
          (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) {
          if (this.isPlacingObject) {

            this.time_placing = Date.now();

            if (((env.mouseX > (config.sF * (this.selectedBlockKind.w / 2))) &&
                (env.mouseX < config.envCanvasWidth - (config.sF * (this.selectedBlockKind.w / 2))))) {
              this.placeBlock(env);
            }
          }
        }

        // or if in menu then update selected blockkind
        if (env.mouseY > 0 && (env.mouseY < config.envCanvasHeight) &&
          (env.mouseX > 0 && env.mouseX < config.envCanvasWidth)) {

          // is mouse clicking a block?
          var newSelectedBlockKind = this.blockMenu.hasClickedButton(env.mouseX, env.mouseY, this.selectedBlockKind);
          if (newSelectedBlockKind) {
            if (newSelectedBlockKind == this.selectedBlockKind) {
              this.timeBlockSelected = Date.now();
              //rotated = !rotated; // uncomment to allow rotation by re-selecting block from menu
            } else {
              this.rotated = false;
            }
            this.selectedBlockKind = newSelectedBlockKind;
            this.isPlacingObject = true;
          }
        }
      }
    }.bind(this);
  };

  addBlock(blockObj) {
    const color = blockObj.color || [200, 200, 200, 255];
    const strokeColor = blockObj.strokColor || [150, 150, 150, 255];
    const selectedBlockKind = new BlockKind(
      blockObj.width,
      blockObj.height,
      color,
      "",
      strokeColor);

    const snappedX = config.stim_scale * blockObj.x;
    const snappedY = config.stim_scale * blockObj.y;
    const newBlock = selectedBlockKind.createSnappedBlock(
      snappedX,
      snappedY,
      this.discreteWorld,
      false
    );
    this.blocks.push(newBlock);

    this.discreteWorldPrevious = _.cloneDeep(this.discreteWorld);

    var blockTop = newBlock.y_index + selectedBlockKind.h;
    var blockRight = newBlock.x_index + selectedBlockKind.w;

    for (let y = newBlock.y_index; y < blockTop; y++) {
      for (let x = newBlock.x_index; x < blockRight; x++) {
        this.discreteWorld[x][y] = false;
      }
    }

    this.postSnap = false;

  }

  placeBlock(env) {

    var testBlock = this.selectedBlockKind.createSnappedBlock(
      env.mouseX, env.mouseY, this.discreteWorld, true
    );

    if (testBlock.can_be_placed_discrete(this.discreteWorld)) { // don't test for anything with placement
      var newBlock = this.selectedBlockKind.createSnappedBlock(
        env.mouseX, env.mouseY, this.discreteWorld, false
      );

      this.blocks.push(newBlock);

      var transluscent_color = _.cloneDeep(this.selectedBlockKind.blockColor);
      transluscent_color[3] -= 100;

      const sendingBlockData = {
        block: {
          x: newBlock.x_index,
          y: newBlock.y_index,
          width: newBlock.blockKind.w,
          height: newBlock.blockKind.h,
          color: transluscent_color, // appends alpha value to color of block- will fail if block is not opaque
        },
        blockNum: this.blocks.length
      };

      this.sendingBlocks.push(sendingBlockData.block);
      // this.blockSender(sendingBlockData);

      // update discrete world map
      this.discreteWorldPrevious = _.cloneDeep(this.discreteWorld);

      var blockTop = newBlock.y_index + this.selectedBlockKind.h;
      var blockRight = newBlock.x_index + this.selectedBlockKind.w;

      for (let y = newBlock.y_index; y < blockTop; y++) {
        for (let x = newBlock.x_index; x < blockRight; x++) {
          this.discreteWorld[x][y] = false;
        }
      }


      this.postSnap = false;
      // blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
      if (!config.keepBlockSelected){
        this.selectedBlockKind = null;
        env.cursor();
        this.isPlacingObject = false;
      }

      this.sendBlockData();
      this.checkTrialEnd();


    } else {

    }


  }

  checkTrialEnd() {

    if (this.trialObj.endCondition == null) {
      // do nothing

    } else if (this.trialObj.endCondition == 'perfect-reconstruction') {

      if (_.isEqual(this.discreteWorld, scoring.getDiscreteWorld(this.trialObj.targetBlocks, config.discreteEnvWidth, config.discreteEnvHeight, false, 0))) {
        this.endBuilding();
      }

    } else if (this.trialObj.endCondition == 'perfect-reconstruction-translation') {

      // let offset = -(this.trialObj.offset)
      let stillFits = true;

      var offset = 0;
      while (offset < config.discreteEnvWidth && stillFits) {
        let targetWorld = scoring.getDiscreteWorld(this.trialObj.stimulus, config.discreteEnvWidth, config.discreteEnvHeight, false, offset);
        stillFits = targetWorld ? true : false;
        offset = offset + 1;
        if (_.isEqual(this.discreteWorld, targetWorld)) {
          this.endBuilding();
        }
      }

    } else if (this.trialObj.endCondition == 'max_blocks') {
      if (this.blocks.length == this.trialObj.maxBlocks) {
        this.endBuilding();
      }

    } else {
      //unsupported endCondition: do nothing
    }

  }

  endBuilding() {
    console.log('end of trial');

    let trialData = _.extend({},
      this.getCommonData(),
      {
        eventType: 'trial_end',
        endReason: this.trialObj.endCondition
      });

    this.trialObj.endBuildingTrial ? this.trialObj.endBuildingTrial(trialData) : console.log('no trialEnd function provided. Please specify in trial object');
  }


  sendBlockData() {
    let blockData = _.extend({},
      this.getCommonData(),
      {
        eventType: 'block_placement',
        block: this.blocks[this.blocks.length-1].getDiscreteBlock()
      });

    this.trialObj.blockSender ? this.trialObj.blockSender(blockData) : console.log('no blockSender function provided. Please specify in trial object');
  }



  removeEnv() {
    // remove environment
    this.p5env.remove();

    // Update variables
    this.blocks = [];
    this.blockKinds = [];
    this.isPlacingObject = false;
    this.rotated = false;
    this.selectedBlockKind = null;
  }

  removeStimWindow() {
    // remove environment
    this.p5stim.remove();
  }


  getBlockColorIndex(dims) {

    var i = 0;
    while (((dims[0] != config.blockDims[i][0]) || (dims[1] != config.blockDims[i][1])) & (i < config.blockDims.length)) {
      i += 1;
    }
    if ((dims[0] == config.blockDims[i][0]) & (dims[1] == config.blockDims[i][1])) {
      return i;
    }

    else (console.log('no color found for block of dimensions ', dims));

  };

  getCommonData() {

    var commonData = {
      //timing
      timeAbsolute: Date.now(),
      timeRelative: Date.now() - this.trialStart,
      blocks: this.getBlockJSON(),
      discreteWorld: this.discreteWorld
    };

    return commonData;
  };

  getBlockJSON() {
    return _.map(this.blocks, (block) => {
      return block.getDiscreteBlock();
    });
  };

  shiftTower(discreteXOffset){

    this.discreteWorldPrevious = _.cloneDeep(this.discreteWorld);
    
    let canShift = _.reduce(this.blocks, function(acc, block){

      return (block.testShift(discreteXOffset, config.discreteEnvWidth) && acc)

    }, true)

    if (canShift) {
      this.blocks = _.map(this.blocks, (block) => {block.shiftBlock(discreteXOffset)});
      // update block map!!
    }


  }

};

module.exports = BlockUniverse;
