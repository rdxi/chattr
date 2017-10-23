const chance = require('chance').Chance();
const animal = require('animal-id');
const jwt = require('jsonwebtoken');
const redis = require('./redis.js');
const crypto = require('crypto');


class User {
  constructor () {
    // this.userList = {users: []};

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

  generateNewUser(socket) {
    var avatar = chance.avatar() + '?d=retro';
    var name = animal.getId();
    var secret = crypto.randomBytes(256).toString('base64');
    var payload = {
      id: socket.id,
      name: name,
      avatar: avatar
    };
    var payloadWithSecret = Object.assign({secret: secret}, payload);

    this.payload = payload;
    this.serverToken = jwt.sign(payload, secret).toString();


    // token without secret - send to user
    socket.emit('token', this.serverToken);

    // token with secret - add to db
    redis.sadd('users', this.serverToken);
    redis.set(`user:${this.serverToken}`, JSON.stringify(payloadWithSecret));
  }

}


module.exports = User;