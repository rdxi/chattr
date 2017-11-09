var $ = require('jquery');
var highlightInput = require('./utils/highlightInput.js');

var sidebarHandlers = function() {

  var addSidebarUserToInput = function() {
    $('.sidebar-users-items').on('click', '.sidebar-user', function() {
      var userMessageInput = $('#user-message');
      var userName = $(this).text();

      userMessageInput.val(userMessageInput.val() + '@' + userName + ' ');

      highlightInput(userMessageInput[0]);
      userMessageInput.focus();
    });
  };

  var toggleSidebarOnMobile = function() {
    var sidebarToggle = $('.sidebar-toggle');
    var sidebar = $('.sidebar');

    sidebarToggle.on('click', function() {
      sidebar.toggleClass('sidebar--visible');
    });
  };

  addSidebarUserToInput();
  toggleSidebarOnMobile();
};

module.exports = sidebarHandlers();