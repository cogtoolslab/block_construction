
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
  menuColor: [236, 232, 226],
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  structureGhostColor: [30, 30, 200, 100],
  floorColor: [28, 54, 62],
  stimColor: [28, 54, 62],
  revealedTargetColor: [28, 54, 62, 200],
  discreteEnvHeight: 10, // discrete world representation for y-snapping
  discreteEnvWidth: 12,
  worldScale: 2.2, //scaling factor within matterjs
  menuOffset: 70
};

module.exports = displayConfig;