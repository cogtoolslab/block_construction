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

let  gameport;

if(argv.gameport) {
  let gameport = argv.gameport;
  console.log('using port ' + gameport);
} else {
  gameport = 8882;
  console.log('no gameport specified: using 8882\nUse the --gameport flag to change');
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
  socket.on('sketch', function(data) {
      console.log('sketch received: ' + JSON.stringify(_.omit(data,['pngString','bitmap'])));
      writeDataToMongo(data);      
  });

  socket.on('stroke', function(data) {
      console.log('stroke data received: ' + JSON.stringify(_.omit(data,'bitmap')));
      writeDataToMongo(data);      
  });

});

var serveFile = function(req, res) {
  var  fileName = req.params[0];
  console.log('\t :: Express :: file requested: ' + fileName);
  return res.sendFile(fileName, {root: __dirname}); 
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
