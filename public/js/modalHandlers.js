var $ = require('jquery');

var modalHandlers = function() {
  $('.modal-button .button-close').on('click', function() {
    $('.modal-overlay').hide();
  });
};

module.exports = modalHandlers();