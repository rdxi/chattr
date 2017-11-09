var _ = require('lodash');
var $ = require('jquery');
var Mustache = require('mustache');
var anchorme = require('anchorme').default;
var moment = require('moment');
var isImageLink = require('./utils/isImageLink.js');
var soundOfMessage = require('./soundOfMessage.js');
var scrollToBottom = require('./utils/scrollToBottom.js');

var renderMessages = function(messages, currentUser) {
  var html = '';
  var messagesContainer = $('.main-messages');
  var template = $('#message-template').html();
  var mentionsCurrentUser = false;

  // if single message - put it in array to reuse parsing code below
  if (!Array.isArray(messages)) {
    var arr = [];
    arr.push(JSON.stringify(messages));
    messages = arr;
  }

  // turn messages into html
  messages.forEach(function(stringObj) {
    var obj = JSON.parse(stringObj);
    var userMentions = obj.userMentions || '';

    if (userMentions) {
      userMentions.forEach(function(val) {
        var wrapClassName = 'user-mention';

        // highlight current user mention, and assign variable to play sound later
        if (currentUser && val.trim() === ('@' + currentUser.name)) {
          mentionsCurrentUser = true;
          wrapClassName += ' ' + 'user-mention-current';
        }

        // wrap all mentions in span
        obj.text = obj.text.split(val.trim())
                           .join('<span class="' + wrapClassName + '">'+val+'</span>');
      });
    }

    html += Mustache.render(template, {
      avatar: obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000',
      user: obj.name || 'anonymous',
      date: obj.date ? moment(obj.date).format('MMM Do, HH:mm') : moment().format('MMM Do, HH:mm'),
      text: anchorme(obj.text, {attributes: [{name: 'target', value :'_blank'}]}) || '??no text??',
      image: isImageLink(obj.text) || null
    });
  });

  messagesContainer.append(html);

  scrollToBottom(messagesContainer[0]);
  if (mentionsCurrentUser) soundOfMessage.play();
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

module.exports = {
  renderMessages: renderMessages,
  renderSidebarUsers: renderSidebarUsers,
  renderCurrentUser: renderCurrentUser
};
