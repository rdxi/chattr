var $ = require('jquery');

var tribute = new window.Tribute({
  values: [
    {key: '', value: ''},
  ],
  menuContainer: $('.main-input form')[0],
  positionMenu: false
});

var updateUserList = function(newList) {
  var namesArray = [];
  newList.forEach((user) => namesArray.push({key: user.name, value: user.name}));
  tribute.append(0, namesArray, true);
};

tribute.attach(document.getElementById('user-message'));

module.exports = {tribute: tribute, updateUserList: updateUserList};