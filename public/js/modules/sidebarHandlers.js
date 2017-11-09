var $ = require('jquery');
var highlightInput = require('./utils/highlightInput.js');

var sidebarHandlers = function() {

  var addSidebarUserNameToInput = function() {
    var sidebarUsersList = $('.sidebar-users-items');

    sidebarUsersList.on('mousedown', function(e) {
      e.preventDefault(); // prevent taking focus from input
    });

    sidebarUsersList.on('click', '.sidebar-user', function() {
      var userMessageInput = $('#user-message');
      var userMessageValue = userMessageInput.val();
      var userName = $(this).text();
      var lastCharIsSpace = userMessageValue.charAt(userMessageValue.length - 1) === ' ' ? true : false;
      var appendValue = lastCharIsSpace ? '@' + userName + ' ' : ' @' + userName + ' '; // add space before name if none

      userMessageInput.val(userMessageValue + appendValue);
      highlightInput(userMessageInput[0]);
    });
  };

  var toggleSidebarOnMobile = function() {
    var sidebarToggle = $('.sidebar-toggle');
    var sidebar = $('.sidebar');

    sidebarToggle.on('click', function() {
      sidebar.toggleClass('sidebar--visible');
    });
  };

  addSidebarUserNameToInput();
  toggleSidebarOnMobile();
};

module.exports = sidebarHandlers();