var anchorme = require('anchorme').default;

var checkIfImageLink = function(text) {
  var isImage = /(jpg|jpeg|gif|png|svg)$/;
  var urlList = anchorme(text, {list:true});

  var imageLink = urlList.find(function(el) {
    return isImage.test(el.raw) === true;
  });

  return imageLink ? imageLink.raw : false;
};

module.exports = checkIfImageLink;