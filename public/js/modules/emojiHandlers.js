var $ = require('jquery');
var highlightInput = require('./utils/highlightInput.js');

var emojiPicker = function() {
  var pickerButton = $('.emoji-picker-button');
  var pickerList = $('.emoji-picker-list');
  var userMessageInput = $('#user-message');

  pickerButton.on('click', function() {
    pickerList.toggle();
  });

  pickerList.on('click', 'span', function() {
    var pickedEmoji = $(this).text();
    userMessageInput.val(userMessageInput.val() + pickedEmoji);

    highlightInput(userMessageInput[0]);
    // userMessageInput.focus();
  });

  // prevent text selection on doubleclick
  $('.emoji-picker-list span, .emoji-picker-button').on('mousedown', function(e) {
    e.preventDefault();
  });
};

module.exports = emojiPicker();