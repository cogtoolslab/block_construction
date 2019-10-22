global.__base = __dirname + '/';

const 
    use_https     = true,
    argv          = require('minimist')(process.argv.slice(2)),
    https         = require('https'),
    fs            = require('fs'),
    app           = require('express')(),
    _             = require('lodash'),
    parser        = require('xmldom').DOMParser,
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    sendPostRequest = require('request').post;    

var gameport;
var researchers = ['A4SSYO0HDVD4E', 'A1BOIDKD33QSDK', 'A1MMCS8S8CTWKU','A1MMCS8S8CTWKV','A1MMCS8S8CTWKS'];
var blockResearcher = false;

if(argv.gameport) {
  let gameport = argv.gameport;
  console.log('using port ' + gameport);
} else {
  gameport = 8888;
  console.log('no gameport specified: using 8888\nUse the --gameport flag to change');
}

try {
  var   privateKey  = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/privkey.pem'), 
        certificate = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/cert.pem'),
        intermed    = fs.readFileSync('/etc/letsencrypt/live/cogtoolslab.org/chain.pem'),
        options     = {key: privateKey, cert: certificate, ca: intermed},
        server      = require('https').createServer(options,app).listen(gameport),
        io          = require('socket.io')(server);
} catch (err) {
  console.log("cannot find SSL certificates; falling back to http");
  var   server      = app.listen(gameport),
        io          = require('socket.io')(server);
}

app.get('/*', (req, res) => {
  serveFile(req, res); 
});

io.on('connection', function (socket) {

  // Recover query string information and set condition
  var hs = socket.request;
  var query = require('url').parse(hs.headers.referer, true).query;

  // Send client stims
  initializeWithTrials(socket);

  socket.on('structure', function(data) {
      // console.log('structure received: ' + JSON.stringify(_.omit(data,['bitmap'])));
      console.log('structure received: ' + JSON.stringify(data));
      writeDataToMongo(data);      
  });

  socket.on('block', function(data) {
      console.log('block data received: ' + JSON.stringify(_.omit(data,'bitmap')));
      writeDataToMongo(data);      
  });

});

var serveFile = function(req, res) {
  var  fileName = req.params[0];
  console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, {root: __dirname}); 
};

function initializeWithTrials(socket) {
  var gameid = UUID();
  var colname = 'block-construction-silhouette';
  sendPostRequest('http://localhost:8000/db/getstims', {
    json: {
      dbname: 'stimuli',
      colname: colname,
      numTrials: 1,
      gameid: gameid
    }
  }, (error, res, body) => {
    if (!error && res.statusCode === 200) {
      // send trial list (and id) to client
      var packet = {
        gameid: gameid,
        trials: body
      };      
      socket.emit('onConnected', packet);
    } else {
      console.log(`error getting stims: ${error} ${body}`);
    }
  });
}

function UUID () {
  var baseName = (Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10));
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var id = baseName + '-' + template.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return id;
};

var writeDataToMongo = function(data) {
    sendPostRequest('http://localhost:8000/db/insert',
      { json: data },
      (error, res, body) => {
        if (!error && res.statusCode === 200) {
          console.log(`sent data to store`);
        } else {
          console.log(`error sending data to store: ${error} ${body}`);
        }
      }
    );
};
