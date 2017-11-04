const test = require('tape');
const saveMessageToDB = require('./saveMessageToDB.js');
const redis = require('./redis.js');

test('save message to db', function(t) {
  var messageObj = {
    name: 'Abu',
    text: 'H-hello :)'
  };

  t.test('test if messages is saved to db', function(t) {
    saveMessageToDB(messageObj);

    redis.lrange('userMessages', -1, -1, function (err, messages) {
      var result = JSON.parse(messages);

      t.equal(result.text, messageObj.text, 'Message text is same');
      t.same(result, messageObj, 'Message object is same');

      redis.disconnect();
      t.end();
    });
  });

  t.end();
});