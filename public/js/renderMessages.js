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


module.exports = {renderMessages: renderMessages};
