// compiled into main.js by webpack 

var _ = require('lodash');

var ChunkGame = require('../static/js/chunkGame.js')['ChunkGame'];
var gridDisplay = require('../static/js/gridDisplay.js')['gridDisplay'];
// var customConfig = require('../static/js/config.json');
// var chunkCanvases = require('../static/js/chunkCanvases.js');

window.onload = function(){

  let game = new ChunkGame(gridDisplay);

  window.addEventListener('beforeunload', function (e) {
    if (!game.finished) {
      // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      e.preventDefault(); 
      // Chrome requires returnValue to be set
      e.returnValue = '';
    }
  });  
  // Add something to canvas:
  // function component() {
  //   const element = document.createElement('div');

  //   element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  
  //   return element;
  // }
  
  // document.body.appendChild(component());

};


