const redis = require('./redis.js');

var saveMessageToDB = function(msgObj) {
  var stringMsg = JSON.stringify(msgObj);
  redis.rpush('userMessages', stringMsg);
  redis.ltrim('userMessages', -500, -1); // store only latest 500 messages because demo db has limited capacity
};

module.exports = saveMessageToDB;