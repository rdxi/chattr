const chance = require('chance').Chance();
const animal = require('animal-id');
const jwt = require('jsonwebtoken');
const redis = require('./redis.js');
const crypto = require('crypto');

const userList = require('./userList.js');


class User {
  constructor (io, socket) {
    this.io = io;
    this.socket = socket;
    this.serverToken;
    this.payload;
  }

  addToUserList (userObj) {
    userList.users.push({serverToken: userObj.serverToken, name: userObj.payload.name});

    this.io.emit('user list', userList);
  }

  removeFromUserList (serverToken) {
    var userIndex = userList.users.findIndex(function(arrObj) {
      return arrObj.serverToken === serverToken;
    });

    if (userIndex > -1) {
      userList.users.splice(userIndex, 1);
    }

    this.io.emit('user list', userList);
  }

  sendCurrentUser() {
    this.socket.emit('current user', {name: this.payload.name, avatar: this.payload.avatar});
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

          self.addToUserList({serverToken: self.serverToken, payload: self.payload});
          self.sendCurrentUser();

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

      // keep list of all users
      redis.sadd('users', self.serverToken);

      self.socket.emit('welcome modal', self.payload.name);

      self.addToUserList({serverToken: self.serverToken, payload: self.payload});
      self.sendCurrentUser();

      resolve({message: 'user generated successfully', token: self.serverToken, secret: secret});
    });
  }
}

module.exports = User;