var $ = require('jquery');
var Mustache = require('mustache');
var moment = require('moment');
var anchorme = require('anchorme').default;
var _ = require('lodash');

var checkIfImageLink = require('./utils/checkifimagelink.js');
var polyfillArrayFind = require('./utils/polyfillarrayfind.js')();


// TODO?: add emojis button like slack  😀😗😙😑😮😯😴😛😕😟
// make only 3 emojis: crying laugh, ok, and poop
// https://unicode.org/emoji/charts/full-emoji-list.html 💩💩💩

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
      renderMessages({name: 'admin', text: 'Maximum message length is 1000 characters'});
      return false;
    }

    socket.emit('chat message', input.val());
    input.val('');

    return false;
  });

  // todo: put all messages in dom inside js, before rendering
  socket.on('initial message history', function(items) {
    $('.main-messages').html('');
    renderMessages(items);
  });

  socket.on('*delete all messages*', function() {
    $('.main-messages').html('');
    renderMessages({
      name: 'admin',
      text: 'messages deleted'
    });
  });


  socket.on('chat message', function(obj){
    renderMessages(obj);
  });

  socket.on('user list', function(obj) {
    renderSidebarUsers(obj.users);
  });

  socket.on('current user', function(obj) {
    renderCurrentUser(obj);
  });

  var renderMessages = function(messages) {
    var html = '';
    var messagesContainer = $('.main-messages');
    var template = $('#message-template').html();

    // if single message - put it in array to reuse parsing code below
    if (!Array.isArray(messages)) {
      var arr = [];
      arr.push(JSON.stringify(messages));
      messages = arr;
    }

    messages.forEach(function(stringObj) {
      var obj = JSON.parse(stringObj);

      html += Mustache.render(template, {
        avatar: obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000',
        user: obj.name || 'anonymous',
        date: obj.date ? moment(obj.date).format('MMM Do, HH:mm') : moment().format('MMM Do, HH:mm'),
        text: anchorme(obj.text, {attributes: [{name: 'target', value :'_blank'}]}) || '??no text??',
        image: checkIfImageLink(obj.text) || null
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

  var renderCurrentUser = function(user) {
    var currentUserContainer = $('.sidebar-current-user');
    var template = $('#sidebar-current-user-template').html();

    currentUserContainer.html(' ');

    var html = Mustache.render(template, {
      user: user.name,
      avatar: user.avatar
    });

    currentUserContainer.append(html);
  };


  var toggleSidebar = function() {
    var sidebarToggle = $('.sidebar-toggle');
    var sidebar = $('.sidebar');

    sidebarToggle.on('click', function() {
      sidebar.toggleClass('sidebar--visible');
    });
  };

  toggleSidebar();

});