// compiled into main.js by webpack 

import _ from 'lodash';

var canvases = require('../static/js/chunkCanvases.js');

var customConfig = require('../config.json');
// var chunkCanvases = require('../static/js/chunkCanvases.js');

window.onload = function(){

  canvases.setupCanvas();

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


