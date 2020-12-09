var UUID = function() {
    var baseName = (Math.floor(Math.random() * 10) + '' +
          Math.floor(Math.random() * 10) + '' +
          Math.floor(Math.random() * 10) + '' +
          Math.floor(Math.random() * 10));
    var template = 'xxxxxxxx-xxxx-8xxx-yxxx-xxxxxxxxxxxx';
    var id = baseName + '-' + template.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
    return id;
  };

module.exports = {
    UUID
}