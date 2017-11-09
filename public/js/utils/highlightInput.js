var $ = require('jquery');

var highlightInput = function(element) {
  $(element).addClass('highlighted');

  setTimeout(function() {
    $(element).removeClass('highlighted');
  }, 100);
};

module.exports = highlightInput;