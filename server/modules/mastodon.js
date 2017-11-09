const Mastodon = require('mastodon-api');

var mastodon = new Mastodon({
  access_token: 'fd8ecb9adb8860a46cc78fbeb756c94fab958693bffa1d230a4960dcbc2f009d'
});

module.exports = mastodon;