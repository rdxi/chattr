var anchorme = require('anchorme').default;

var checkIfImageLink = function(text) {
  var isImage = /(jpg|gif|png|svg)$/;
  var urlList = anchorme(text, {list:true});

  var imageLink = urlList.find(function(el) {
    return isImage.test(el.raw) === true;
  });
  // console.log('imageLink', imageLink);
  // return text;


  return imageLink ? imageLink.raw : false;
};

module.exports = checkIfImageLink;