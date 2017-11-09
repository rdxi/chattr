var $ = require('jquery');
var renderMessages = require('./modules/renderHtml.js').renderMessages;
var renderSidebarUsers = require('./modules/renderHtml.js').renderSidebarUsers;
var renderCurrentUser = require('./modules/renderHtml.js').renderCurrentUser;
var userMentions = require('./modules/userMentions.js');
var emojiHandlers = require('./modules/emojiHandlers.js');
var sidebarHandlers = require('./modules/sidebarHandlers.js');
var modalHandlers = require('./modules/modalHandlers.js');

var currentUser = {};

var socket = io();

socket.on('connect', function() {
  var localToken = localStorage.getItem('token');
  socket.emit('hello', {localToken: localToken});
});

socket.on('token', function(token) {
  var localToken = localStorage.setItem('token', token);
});

socket.on('invalid token', function() {
  // delete local token and get new one from server
  localStorage.removeItem('token');
  socket.emit('hello', {localToken: null});
});

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
  renderMessages(obj, currentUser);
});

socket.on('current user', function(obj) {
  renderCurrentUser(obj);
  currentUser = obj;
});

socket.on('user list', function(obj) {
  renderSidebarUsers(obj.users);
  userMentions.updateUserList(obj.users, currentUser);
});

socket.on('welcome modal', function(username) {
  $('.modal-subtitle-name').text(username);
  $('.modal-overlay').show();
});

$('form').on('submit', function(){
  var input = $('#user-message');
  var inputValue = input.val();
  var inputIsEmpty = inputValue.trim() === '';
  var tooManyCharacters = inputValue.length > 1000;
  var userMentions = inputValue.match(/(?:^|\s|$)@([[a-z0-9_-]+]*)/gi);

  if (inputIsEmpty) return false;

  if (tooManyCharacters) {
    renderMessages({name: 'admin', text: 'Maximum message length is 1000 characters'});
    return false;
  }

  socket.emit('chat message', {message: inputValue, userMentions: userMentions});
  input.val('');

  return false;
});