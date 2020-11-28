var displayConfig = {
  canvasHeight: 450,
  canvasWidth: 450,
  worldHeight: 10,
  worldWidth: 12,
  buildColor: [30, 30, 200],
  buildColors: [
    [179, 47, 10, 255],
    [10, 47, 179, 255],
  ],
  gridColor: [200, 200, 200, 100],
  highlightColors:[
    [30, 200, 150, 100],
    [120, 120, 200],
    [150, 80, 120],
    [180, 150, 50]
  ],
  menuColor: [236, 232, 226],
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  structureGhostColor: [30, 30, 200, 100],
  floorColor: [28, 54, 62],
  stimColor: [28, 54, 62],
  revealedTargetColor: [28, 54, 62, 200],
  discreteEnvHeight: 13, // discrete world representation for y-snapping
  discreteEnvWidth: 18,
  worldScale: 2.2, //scaling factor within matterjs
  menuOffset: 70
};


displayConfig.floorHeight = displayConfig.canvasHeight / 4.2; //grabbed from silhouette

displayConfig.sF = displayConfig.canvasWidth / displayConfig.discreteEnvWidth; //scaling factor to change appearance of blocks
displayConfig.stimScale = displayConfig.sF; //scale of stimulus silhouette (same as sF here)

module.exports = displayConfig;
