var displayConfig = {
  canvasHeight: 450,
  canvasWidth: 450,
  // worldHeight: 10,
  // worldWidth: 12,
  buildColor: [30, 30, 200],
  buildColors: [
    [179, 47, 10, 255],
    [10, 47, 179, 255],
  ],
  gridColor: [255, 255, 255],
  gridLineColor: [150, 150, 235],
  backgroundColor: [255, 255, 255],
  highlightColors:[
    [120, 120, 120, 100], // first is default color
    [168,55,101],
    [185,240,214],
    [154,124,222],
    [3,27,87],
    [237,212,47],
    [41,97,72],
    [106,9,0],
    [177,100,42]
  ],
  // highlightColors:[
  //   [120, 120, 120, 100], // first is default color
  //   [30, 220, 150, 100],
  //   [180, 80, 120],
  //   [110, 110, 200],
  //   [1, 25, 89],
  //   [180, 150, 50],
  //   [80, 220, 250],
  //   [180, 100, 50],
  //   [60,109,86]
  // ],
  // highlightColors:[
  //   [120, 120, 120, 100], // first is default color
  //   [1, 25, 89], 
  //   [250, 204, 250],
  //   [129, 130,  50],
  //   [241, 157, 107],
  //   [34, 96, 97],
  //   [17, 67, 96],
  //   [253, 180, 180],
  //   [190, 144,  53],
  //   [ 76, 114,  77]
  // ],
//   highlightColors:[ 
//     [120, 120, 120, 100],
//     [1, 25, 89], //using Batlow colorpalette
//     [16,63,96],
//     [28,90,98],
//     [60,109,86],
//     [104,123,62],
//     [157,137,43],
//     [210,147,67],
//     [248,161,123]//,
// //  [253,183,188],
// //  [250,204,250],
//   ],
  menuColor: [236, 232, 226],
  disabledColor: [100, 100, 100],
  mistakeColor: [215, 30, 30, 200],
  structureGhostColor: [30, 30, 200, 100],
  floorColor: [255, 255, 255],
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
