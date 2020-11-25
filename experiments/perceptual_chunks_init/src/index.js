import _ from 'lodash';

var customConfig = require('../config.json');

window.onload = function(){

  function component() {
    const element = document.createElement('div');
  
    // Lodash, currently included via a script, is required for this line to work
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  
    return element;
  }
  
  document.body.appendChild(component());
  

  console.log('welcome!');

  window.addEventListener('beforeunload', function (e) {
    if (!game.finished) {
      // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      e.preventDefault(); 
      // Chrome requires returnValue to be set
      e.returnValue = '';
    }
  });  

};


