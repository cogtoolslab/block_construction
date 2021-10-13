const path = require('path');

module.exports = {
  entry: './src/blockDisplayEntry.js',
  output: {
    filename: 'blockDisplay.js',
    path: path.resolve(__dirname, 'dist'),
  },
};