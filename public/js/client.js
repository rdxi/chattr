var $ = require('jquery');
var Mustache = require('mustache');
var moment = require('moment');
var anchorme = require('anchorme').default;
var _ = require('lodash');

var checkIfImageLink = require('./utils/checkifimagelink.js');
var polyfillArrayFind = require('./utils/polyfillarrayfind.js')();

var sidebarUsers = [];

// TODO?: move functions to modules, add browserify and stuff?

$(function () {
  var socket = io();

  // verify local token or get new one from server
  // socket.emit('hello', {localToken: localToken});

  socket.on('connect', function() {
    var localToken = localStorage.getItem('token');
    socket.emit('hello', {localToken: localToken});
  });

  socket.on('token', function(token) {
    var localToken = localStorage.setItem('token', token);
    console.log(token);
  });

  socket.on('invalid token', function() {
    // delete local token and get new one from server
    localStorage.removeItem('token');
    socket.emit('hello', {localToken: null});
  });


  $('form').submit(function(){
    var input = $('#user-message');
    var inputIsEmpty = input.val().trim() === '';
    var tooManyCharacters = input.val().length > 1000;

    if (inputIsEmpty) return false;

    if (tooManyCharacters) {
      renderMessage({name: 'admin', text: 'Maximum message length is 1000 characters'});
      return false;
    }

    socket.emit('chat message', input.val());
    input.val('');

    return false;
  });

  // todo: put all messages in dom inside js, before rendering
  socket.on('initial message history', function(items) {
    // console.log('initial messages: ', items);


    $('.main-messages').html('');
    renderInitialMessages(items);

    // if (items) {
    //   items.forEach(function(item) {
    //     var obj = JSON.parse(item);
    //     renderMessage(obj);
    //   });
    // }
  });

  socket.on('*delete all messages*', function() {
    $('.main-messages').html('');
    renderMessage({
      name: 'admin',
      text: 'messages deleted'
    });
  });


  socket.on('chat message', function(obj){
    renderMessage(obj);
  });

  socket.on('user list', function(obj) {
    renderSidebarUsers(obj.users);
  });

  socket.on('current user', function(obj) {
    renderCurrentUser(obj);
  });

  // socket.on('add to sidebar', function(obj) {
  //   sidebarUsers.push(obj.name);
  //   renderSidebarUsers(sidebarUsers);
  // });

  // socket.on('remove from sidebar', function(obj) {
  //   var index = sidebarUsers.indexOf(obj.name);

  //   if (index > -1) {
  //     sidebarUsers.splice(index, 1);
  //   }

  //   renderSidebarUsers(sidebarUsers);
  // });

  var renderMessage = function(obj) {
    var messagesContainer = $('.main-messages');
    var template = $('#message-template').html();

    var avatar = obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000';
    var user = obj.name || 'anonymous';
    var date = obj.date ? moment(obj.date).format('MMM Do, HH:mm') : moment().format('MMM Do, HH:mm');
    var text = anchorme(obj.text, {attributes: [{name: 'target', value :'_blank'}]}) || '??no text??';
    var image = checkIfImageLink(obj.text) || null;


    // TODO?: add emojis button like slack  😀😗😙😑😮😯😴😛😕😟
    // make only 3 emojis: crying laugh, ok, and poop
    // https://unicode.org/emoji/charts/full-emoji-list.html 💩💩💩

    // var image = $(text);
    // console.log(image);



    var html = Mustache.render(template, {
      avatar: avatar,
      user: user,
      date: date,
      text: text,
      image: image
    });

    messagesContainer.append(html);
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;

  };

  // todo lots of duplicate code, what do?
  var renderInitialMessages = function(objList) {
    var html = '';
    var messagesContainer = $('.main-messages');
    var template = $('#message-template').html();

    objList.forEach(function(stringObj) {
      var obj = JSON.parse(stringObj);
      var avatar = obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000';
      var user = obj.name || 'anonymous';
      var date = obj.date ? moment(obj.date).format('MMM Do, HH:mm') : moment().format('MMM Do, HH:mm');
      var text = anchorme(obj.text, {attributes: [{name: 'target', value :'_blank'}]}) || '??no text??';
      var image = checkIfImageLink(obj.text) || null;

      html += Mustache.render(template, {
        avatar: avatar,
        user: user,
        date: date,
        text: text,
        image: image
      });
    });

    messagesContainer.append(html);
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;

  };

  var renderSidebarUsers = function(userList) {
    var html = '';
    var usersContainer = $('.sidebar-users-items');
    var template = $('#sidebar-user-template').html();
    var uniqueUserList = _.uniqBy(userList, 'name');

    usersContainer.html('');


    uniqueUserList.forEach(function(user) {
      html += Mustache.render(template, {user: user.name});
    });

    usersContainer.append(html);
  };

  // var renderSidebarUser = function(user) {
  //   var usersContainer = $('.sidebar-users-items');
  //   var template = $('#sidebar-user-template').html();

  //   var html = Mustache.render(template, {
  //     user: user.name
  //   });

  //   usersContainer.append(html);
  // };


  var renderCurrentUser = function(user) {
    var currentUserContainer = $('.sidebar-current-user');
    var template = $('#sidebar-current-user-template').html();

    console.log(user);
    currentUserContainer.html(' ');

    var html = Mustache.render(template, {
      user: user.name,
      avatar: user.avatar
    });

    currentUserContainer.append(html);
  };


});