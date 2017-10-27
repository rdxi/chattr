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

// move this to separate module probably
const Mastodon = require('mastodon-api');
const mastodonSearch = require('./mastodonSearch.js');
const MastodonStream = require('./mastodonStream.js');

var mastodon = new Mastodon({
  access_token: 'fd8ecb9adb8860a46cc78fbeb756c94fab958693bffa1d230a4960dcbc2f009d'
});

var mastodonStream = new MastodonStream(mastodon, io, 60*1000);
// /move this to separate module



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

    // 1. decode serverToken to get name, avatar
    // 2. sanitize message
    // 3. check if message is above character limit
    // 4. check if its *delete all messages*
    // 5. create new obj with sanitized message, user.name, user.avatar, date
    // 6. check if message is for searchbot
    // 7. store message in db
    // 8. emit message to all users


    var decoded = jwt.decode(user.serverToken);
    var sanitizedMsg = sanitizeHtml(msg, {allowedTags: ['a', 'img', 'b', 'strong', 'i', 'em']});

    if (msg.length > 1000) {
      socket.emit('chat message', {name: 'admin', text:'Maximum message length is 1000 characters'});
      return;
    }

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

    // test if message is for searchBot
    mastodonSearch(msg, mastodon).then(function(result) {
      console.log('*** result:', result);

      if (result) {
        var sanitizedText = sanitizeHtml(result.text);

        msgObj.name = 'Mastodon bot';
        msgObj.avatar = '';
        msgObj.text = `${result.linkToPost} ${sanitizedText} ${result.image}`;

        // repeating code
        var storedMsg = JSON.stringify(msgObj);
        redis.rpush('userMessages', storedMsg);
        redis.ltrim('userMessages', -500, -1); // store only latest 500 messages because demo db has limited capacity

        io.emit('chat message', msgObj);
      } else {

        // bug - sends admin message even if it wasnt mastodon search
        msgObj.text = 'Nothing found';
        msgObj.name = 'Mastodon bot';
        msgObj.avatar = '';
        io.emit('chat message', msgObj);
      }
    }).catch((err) => console.log(err));

    // repeating code
    var storedMsg = JSON.stringify(msgObj);
    redis.rpush('userMessages', storedMsg);
    redis.ltrim('userMessages', -500, -1); // store only latest 500 messages because demo db has limited capacity

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