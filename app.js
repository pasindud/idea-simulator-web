// ==========================================
// Ideamart Group Simulator
// ==========================================
// Author   : Pasindu De Silva
// License  : MIT (c) Pasindu De Silva
// Github   : http://github.com/pasindud
// ==========================================

var express = require('express'),
    app = module.exports = express.createServer();
    io = require('socket.io').listen(app, { log: false });

// all environments

app.configure(function() {
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  return app.use(express["static"](__dirname + "/public"));
});

app.configure("development", function() {
  return app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

var sk='';
io.sockets.on('connection', function (socket) {
  sk=socket;


  socket.on('tabs', function (data) {
    sk.broadcast.emit('tabs',data);
    sk.emit('tabs', data); 
  });

  socket.on('logs', function (data) {
    sk.broadcast.emit('logs',data);
    sk.emit('logs', data); 
  });

});

/*
* @description - Render the simulator
*/
app.get('/', function(req,res){
  res.render('index',{title:'Group Simulator'})
});


var request = require('request');

/*
* @description - Sender the sms to the url
*/
app.post('/sender', function(req,res){
  res.send({msg:'Success'},200);
  request.post({
      url: req.body.url,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( req.body.message)
    }, function(error, response, body){
         if (!error && response.statusCode == 200) {
            //res.send({msg:'Success'},200);
        } else {
           // res.send({msg:'Error'},200);
        }
  });
});


/*
* @description - Handle Incomming messages from apps
*/
app.post('/sms', function(req,res){
  res.send({statusCode:'S1000',statusDetail:"Success"},200);
  if (req.body.destinationAddresses[0]='tel:all') {
    sk.broadcast.emit('broadcast', req.body);
    sk.emit('broadcast', req.body);
  } else {
    sk.broadcast.emit('incomming', req.body);
    sk.emit('incomming', req.body); 
  }
});

var port = process.env.PORT || 5000;

app.listen(port);
console.log("Express server listening on port %d in mode", app.address().port);