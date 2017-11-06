var _ = require('lodash');
var $ = require('jquery');
var Mustache = require('mustache');
var anchorme = require('anchorme').default;
var moment = require('moment');
var checkIfImageLink = require('./utils/checkifimagelink.js');

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
    // // var noSlashes = /^((?!\/).)*$/gi;
    // // var userMentionRegex = /\B@[a-z0-9_-]+/gi;
    // var userMentionRegex = /(?:^|\s|$)@([[a-z0-9_-]+]*)/gi;

    // // var x = obj.text.match(noSlashes);
    // var a = obj.text.match(userMentionRegex);
    // var zzz = obj.text.replace(/(?:^|\s|$)@([[a-z0-9_-]+]*)/gi, "<span>$` $1 $'</span>");
    // // console.log(x);
    // console.log(a);
    // console.log(zzz);

    html += Mustache.render(template, {
      avatar: obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000',
      user: obj.name || 'anonymous',
      date: obj.date ? moment(obj.date).format('MMM Do, HH:mm') : moment().format('MMM Do, HH:mm'),
      text: anchorme(obj.text, {attributes: [{name: 'target', value :'_blank'}]}) || '??no text??',
      image: checkIfImageLink(obj.text) || null
    });
  });

  // var str = "@jpotts18 what is up man? Are you hanging out with @kyle_clegg";
  // var pattern = /\B@[a-z0-9_-]+/gi;
  // str.match(pattern);
  // ["@jpotts18", "@kyle_clegg"]

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

module.exports = {
  renderMessages: renderMessages,
  renderSidebarUsers: renderSidebarUsers,
  renderCurrentUser: renderCurrentUser
};
