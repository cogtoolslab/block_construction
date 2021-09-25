import _ from 'lodash';
var BlockUniverse = require('./js/blockUniverse.js');
// var config = require('./display_config.js');

let blockUniverse = new BlockUniverse(config);

window.blockSetup = function(trial, showStimulus, showBuilding) {
  // Need to remove old screens
  // if(_.has(blockUniverse, 'p5env')){
  //   blockUniverse.removeEnv();
  // };

  // if(_.has(blockUniverse, 'p5stim')){
  //   blockUniverse.removeStimWindow();
  // };

  blockUniverse.setupEnvs(trial, showStimulus, showBuilding);

}

// function component() {
  
//     const element = document.createElement('div');
  
//     element.innerHTML = _.join(['Display', 'towers'], ' ');
  
//     return element;
//   }
  
// document.body.appendChild(component());



// let demoTrial = {
//   targetBlocks : [{ "x": 1, "y": 0, "width": 2, "height": 1 },
//   { "x": 1, "y": 1, "width": 1, "height": 2 },
//   { "x": 1, "y": 3, "width": 1, "height": 2 },
//   { "x": 1, "y": 5, "width": 2, "height": 1 }]
// }

// setup(demoTrial);