// require("leaked-handles");

const test = require('tape');
const redis = require('./redis.js');
const User = require('./User.js');

const { SocketIO, Server } = require('mock-socket');
const mockIo = new Server('http://localhost:8080');

test('user generation and verification', function(t) {
  var user = new User(mockIo, mockIo);
  // var generatedUser = {};

  t.test('generate, verify, delete', function() {
    user.generateNewUser().then(function(result) {
      var generatedUser = Object.assign({}, {secret: result.secret, token: result.token});

      redis.get(`user:${generatedUser.token}`, function(err, res) {
        t.true(res, 'user saved to db');

        user.verifyUser({localToken: generatedUser.token}).then(function(verifyResult) {
          t.equal(verifyResult, 'token verified successfully', 'user verified');

          redis.del(`user:${generatedUser.token}`, function(err, delResult) {
            t.equal(delResult, 1, 'user deleted');
            t.end();
            mockIo.stop();
          });
        }).catch((err) => console.log(err));

      });


    }).catch((err) => console.log(err));
  });

});

test.onFinish(function() {
  redis.disconnect();
});