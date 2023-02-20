var config = {
  // dimensions
  canvasHeight: 500,
  canvasWidth: 500,
  worldHeight: 30,
  worldWidth: 30,
  discreteEnvHeight: 30,   // discrete world representation for y-snapping
  discreteEnvWidth: 30,
  worldScale: 2.2, //scaling factor within matterjs
  menuOffset: 70,
  xSquareOffset: 0,
  ySquareOffset: 0,

  // block details
  blockDims: [[1, 2],[2, 1]],
  blockNames: ['v','h'],

  //colors
  buildColor: [30, 30, 200],
  buildColors: [[179, 47, 10, 255],
                [10, 47, 179, 255]],
  internalStrokeColors: [[210, 80, 30, 255],
                          [30, 80, 210, 255]],
  strokeColor: [28, 54, 62],
  structureGhostColor: [30, 30, 200, 100],
  ghostStroke: [100,100,100,90],
  ghostBlockTransparency: 50,
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  stimColor: [28, 54, 62],
  revealedTargetColor: [28, 54, 62, 200],
  menuColor: [236, 232, 226],
  floorColor: [28, 54, 62]
};

config.sF = parseInt(config.canvasWidth / config.discreteEnvWidth); //scaling factor to change appearance of blocks
config.stim_scale = config.sF; //scale of stimulus silhouette (same as sF here)

// Building Environment parameters
config.chocolateBlocks = true;
config.menuHeight = config.canvasHeight / 4.2;
config.menuWidth = config.canvasWidth;
config.floorHeight = config.canvasHeight / 3.5;
config.floorY = config.canvasHeight - (config.floorHeight / 2);
config.top = Math.round((config.canvasHeight - config.floorHeight) / config.stim_scale);
//config.aboveGroundProp = config.floorY / config.canvasHeight;

// Stimulus parameters
config.stimIndividualBlocks = true;
config.stimSilhouette = true;
config.silhouetteColor = [28, 54, 62];
config.internalStrokeColor = [40,20,40,80];
config.showStimFloor = true;
config.stimFloorType = 'line';
config.stimTickMark = false;
config.stimFloorColor = 180;
config.floorWidth = config.canvasWidth*0.8;
config.showStimGrid = false;
config.showStimMenu = false;
config.showBuildingMenu = false; // set this to be false during selection mode
config.displayBuiltInStim = false;
config.stimCanvasWidth = config.canvasWidth; // in case we want canvases to be different sizes
config.stimCanvasHeight = config.canvasHeight;
config.envCanvasWidth = config.canvasWidth;
config.envCanvasHeight = config.canvasHeight;
config.stimX = config.stimCanvasWidth / 2;
config.stimY = config.stimCanvasHeight / 2;

config.keepBlockSelected = true;

config.scrollableEnv = true;