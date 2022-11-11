import _ from 'lodash';
var BlockUniverse = require('./js/blockUniverse.js');

window.blockUniverse = new BlockUniverse(config);

window.blockSetup = function(trialObj, showStimulus, showBuilding, selectionMode = false, callback) {

  // Need to remove old screens
  // if(_.has(blockUniverse, 'p5env')){
  //   blockUniverse.removeEnv();
  // };

  // if(_.has(blockUniverse, 'p5stim')){
  //   blockUniverse.removeStimWindow();
  // };
  window.blockUniverse.setupEnvs(trialObj, showStimulus, showBuilding, selectionMode = selectionMode, callback);

};
