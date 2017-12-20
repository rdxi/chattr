const port = process.env.PORT || 3000;
const path = require('path');
const publicPath = path.join(__dirname, '../client/public');

const express = require('express');
const compression = require('compression');
const http = require('http');

const app = express().use(compression());
const server = http.Server(app);
const io = require('socket.io')(server);

const sanitizeHtml = require('sanitize-html');
const User = require('./modules/User.js');
const redis = require('./modules/redis.js');
const saveMessageToDB = require('./modules/saveMessageToDB.js');

const mastodonSearch = require('./modules/mastodonSearch.js');
const MastodonStream = require('./modules/mastodonStream.js');

new MastodonStream(io, 60*1000);


io.on('connection', function(socket) {
  var user = new User(io, socket);

  // verify returning user or generate new user
  socket.on('hello', function(token) {
    if (token.localToken) {
      user.verifyUser(token).catch((err) => console.log(err));
    } else {
      user.generateNewUser().catch((err) => console.log(err));
    }
  });

  // send recent message history to client
  redis.lrange('userMessages', -50, -1, function (err, messages) {
    socket.emit('initial message history', messages);
  });

  // new message from client
  socket.on('chat message', function(messageObj){
    var userMentions = messageObj.userMentions;
    var msg = messageObj.message;

    // create object with message text and user data
    var sanitizedMsg = sanitizeHtml(msg, {allowedTags: ['a', 'img', 'b', 'strong', 'i', 'em']});
    var msgObj = {
      text: sanitizedMsg,
      name: user.payload.name,
      avatar: user.payload.avatar,
      date: new Date(),
      userMentions: userMentions
    };

    // prevent long messages
    if (msg.length > 1000) {
      socket.emit('chat message', {name: 'admin', text:'Maximum message length is 1000 characters'});
      return;
    }

    // check if command to delete all messages
    if (msg === '*delete all messages*') {
      redis.del('userMessages');
      io.emit('*delete all messages*');
      return;
    }

    // check if message is for searchBot
    mastodonSearch(sanitizedMsg, io).catch((err) => console.log(err));

    // save to db and emit message
    saveMessageToDB(msgObj);
    io.emit('chat message', msgObj);
  });

  // on client disconnect, remove from userList
  socket.on('disconnect', function(){
    user.removeFromUserList(user.serverToken);
  });
});

app.use('/', express.static(publicPath));

server.listen(port, function() {
  console.log(`app is listening on port ${port}`);
});


module.exports = {app: app};