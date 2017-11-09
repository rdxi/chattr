const test = require('tape');
const saveMessageToDB = require('./saveMessageToDB.js');
const redis = require('./redis.js');

test('chat messages', function(t) {
  var messageObj = {
    name: 'Abu',
    text: 'Test message'
  };

  t.test('test if messages is saved to db', function(t) {
    saveMessageToDB(messageObj);

    redis.lrange('userMessages', -1, -1, function (err, messages) {
      var result = JSON.parse(messages[0]);

      t.equal(result.text, messageObj.text, 'message text is same');
      t.same(result, messageObj, 'message object is same');

      redis.lrem('userMessages', 1, messages[0], function(err, delResult) {
        t.equal(delResult, 1, 'message deleted');
        t.end();
      });

      // redis.disconnect(); // breaks other tests for some reason // also tape-watch - doesnt show all errors - deleted it
    });
  });

  t.end();
});

test.onFinish(function() {
  redis.disconnect();
});