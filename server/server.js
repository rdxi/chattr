const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');

const app = express().use(compression());
const server = http.Server(app);
const io = require('socket.io')(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');

const redis = require('./redis.js');
const User = require('./user.js');



// var server = http.createServer(app);
// TODO: put userList in separate module?
var userList = {users: []};

var addToUserList = function(userObj) {
  var alreadyAdded = userList.users.find(function(arrObj) {
    return arrObj.serverToken === userObj.serverToken;
  });

  if (!alreadyAdded) {
    userList.users.push({serverToken: userObj.serverToken, name: userObj.name});
  }

  // console.log('user list', userList);

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
  var user = new User();

  // verify returning user or generate new user
  socket.on('hello', function(token) {
    if (token.localToken) {
      user.verifyUser(socket, token)
        .then(() => addToUserList({serverToken: user.serverToken, name: user.payload.name}))
        .catch((err) => console.log(err));

    } else {
      user.generateNewUser(socket)
        .then(() => addToUserList({serverToken: user.serverToken, name: user.payload.name}))
        .catch((err) => console.log(err));
    }
  });

  // get last 100 messages from database and add them to DOM
  redis.lrange('userMessages', -100, -1, function (err, messages) {
    socket.emit('initial message history', messages);
  });

  // send messages to users and store to db
  socket.on('chat message', function(msg){
    var decoded = jwt.decode(user.serverToken);
    var sanitizedMsg = sanitizeHtml(msg, {allowedTags: ['a', 'img', 'b', 'strong', 'i', 'em']});

    if (msg === '*delete all messages*') {
      redis.del('userMessages');
      io.emit('*delete all messages*');
      return;
    }

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
    removeFromUserList(user.serverToken);
    console.log('user disconnected');
  });
});


app.use('/', express.static(publicPath));

server.listen(port, function() {
  console.log(`app is listening on port ${port}`);
});