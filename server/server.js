const path = require('path');
const http = require('http');

const express = require('express');
const compression = require('compression');

const app = express();
app.use(compression());

const server = http.Server(app);
const io = require('socket.io')(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const chance = require('chance').Chance();
const animal = require('animal-id');

const jwt = require('jsonwebtoken');

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);


const crypto = require('crypto');
// const bcryptjs = require('bcryptjs');


var sanitizeHtml = require('sanitize-html');


// var server = http.createServer(app);
var userList = {users: []};

var addToUserList = function(userObj) {
  var alreadyAdded = userList.users.find(function(arrObj) {
    return arrObj.serverToken === userObj.serverToken;
  });

  if (!alreadyAdded) {
    userList.users.push({serverToken: userObj.serverToken, name: userObj.name});
  }

  console.log('user list', userList);

  io.emit('user list', userList);
};

var removeFromUserList = function(serverToken) {
  var userIndex = userList.users.findIndex(function(arrObj) {
    return arrObj.serverToken === serverToken;
  });

  userList.users.splice(userIndex, 1);
  io.emit('user list', userList);
};



io.on('connection', function(socket) {
  console.log('a user connected');

  // get last 100 messages from database and add them to DOM
  redis.lrange('userMessages', 0, 100, function (err, messages) {
    socket.emit('initial message history', messages);
  });

  var serverToken;

  // todo: store jwt on client in local storage
  // todo: send jwt on connection from client
  // verify it against database (var decoded = jwt.verify(token, process.env.JWT_SECRET);)



  socket.on('hello', function(token) {
    // todo: move verify functions to separate module and test it
    if (token.localToken) {
      serverToken = token.localToken;

      redis.get(`user:${token.localToken}`, function (err, result) {

        if (!result) {
          // if no token found - tell client to delete local token and get new one from server
          socket.emit('invalid token');
          return;
        }

        if (result) {
          var storedSecret = JSON.parse(result).secret;

          jwt.verify(token.localToken, storedSecret, function(err, payload) {
            if (err) {
              // if invalid token - tell client to delete local token and get new one from server
              socket.emit('invalid token');
            }

            // if valid token - do nothing
            console.log('payload', payload);


            addToUserList({serverToken: serverToken, name: payload.name});

          });
        }

      });
    } else {

      // TODO: remake it as User class - server token as property

      // var name = chance.last() + chance.age();
      var avatar = chance.avatar() + '?d=retro';
      var name = animal.getId();

      var payload = {
        id: socket.id,
        name: name,
        avatar: avatar
      };
      // var secret = crypto.randomBytes(256).toString('base64');
      var secret = crypto.randomBytes(256).toString('base64');

      serverToken = jwt.sign(payload, secret).toString();

      socket.emit('token', serverToken);

      var payloadWithSecret = Object.assign({secret: secret}, payload);

      redis.sadd('users', serverToken);
      redis.set(`user:${serverToken}`, JSON.stringify(payloadWithSecret));


      addToUserList({serverToken: serverToken, name: payload.name});
    }
  });


  socket.on('chat message', function(msg){
    var decoded = jwt.decode(serverToken);
    var sanitizedMsg = sanitizeHtml(msg, {allowedTags: ['a', 'img', 'b', 'strong', 'i', 'em']});


    var msgObj = {
      text: sanitizedMsg,
      name: decoded.name,
      avatar: decoded.avatar,
      date: new Date()
    };

    var storedMsg = JSON.stringify(msgObj);
    redis.rpush('userMessages', storedMsg);

    io.emit('chat message', msgObj);
  });

  socket.on('disconnect', function(){
    removeFromUserList(serverToken);
    console.log('user disconnected');
  });
});


app.use('/', express.static(publicPath));


// app.get('/', function(req, res){
//   res.sendFile(publicPath + '/index.html');
// });

server.listen(port, function() {
  console.log(`app is listening on port ${port}`);
});




// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', function(socket){
//   console.log('a user connected');
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });
