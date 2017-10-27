const chance = require('chance').Chance();
const animal = require('animal-id');
const jwt = require('jsonwebtoken');
const redis = require('./redis.js');
const crypto = require('crypto');


class User {
  constructor (socket) {
    this.socket = socket;
    this.serverToken;
    this.payload;
  }

  // addUserToList (userObj) {

  //   var alreadyAdded = this.userList.users.find(function(arrObj) {
  //     return arrObj.serverToken === userObj.serverToken;
  //   });

  //   if (!alreadyAdded) {
  //     this.userList.users.push({serverToken: userObj.serverToken, name: userObj.name});
  //   }

  //   console.log('user list', this.userList);

  //   io.emit('user list', this.userList);
  // }

  // removeUserFromList () {

  // }

  addToSidebar() {
    var self = this;

    self.socket.emit('add to sidebar', {name: self.payload.name});
    self.socket.broadcast.emit('add to sidebar', {name: self.payload.name});
  }

  removeFromSidebar() {
    var self = this;
    self.socket.emit('remove from sidebar', {name: self.payload.name});
    self.socket.broadcast.emit('add to sidebar', {name: self.payload.name});
  }

  verifyUser(token) {
    var self = this;

    return new Promise(function(resolve, reject) {

      redis.get(`user:${token.localToken}`, function (err, result) {

        // no token found - tell client to delete local token and get new one from server
        if (!result) {
          self.socket.emit('invalid token');
          reject('no token found');
          return;
        }

        var storedSecret = JSON.parse(result).secret;
        jwt.verify(token.localToken, storedSecret, function(err, payload) {

          // invalid token - tell client to delete local token and get new one from server
          if (err) {
            self.socket.emit('invalid token');
            reject('token verification failed');
            return;
          }

          // valid token - add localToken to user
          self.payload = payload;
          self.serverToken = token.localToken;
          resolve('token verified successfully');
        });

      });
    });

  }

  generateNewUser() {
    var self = this;

    return new Promise(function(resolve, reject) {
      var avatar = chance.avatar() + '?d=retro';
      var name = animal.getId();
      var secret = crypto.randomBytes(256).toString('base64');
      var payload = {
        id: self.socket.id,
        name: name,
        avatar: avatar
      };
      var payloadWithSecret = Object.assign({secret: secret}, payload);

      self.payload = payload;
      self.serverToken = jwt.sign(payload, secret).toString();


      // token without secret - send to user
      self.socket.emit('token', self.serverToken);

      // token with secret - add to db
      redis.set(`user:${self.serverToken}`, JSON.stringify(payloadWithSecret));
      redis.sadd('users', self.serverToken);

      resolve('user generated successfully');

    });

  }

}


module.exports = User;