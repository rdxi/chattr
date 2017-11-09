const mastodon = require('./mastodon.js');
const sanitizeHtml = require('sanitize-html');
const saveMessageToDB = require('./saveMessageToDB.js');

class MastodonStream {
  constructor(io, howOften) {
    this.io = io;
    this.howOften = howOften;
    this.mastodon = mastodon;
    this.init();
  }

  init() {
    var self = this;
    var listener = this.mastodon.stream('streaming/public');
    var messageDate = 0;

    listener.on('message', function(msg) {

      // emit messages only `howOften`
      if (Date.now() - messageDate > self.howOften) {
        messageDate = Date.now();

        let msgText = sanitizeHtml(msg.data.content);
        let msgAttachments = (msg.data.media_attachments && msg.data.media_attachments.length > 0) ? msg.data.media_attachments[0].preview_url : '';
        let msgLink = msg.data.url;
        let textWithAttachments = `${msgLink} ${msgText} ${msgAttachments}`;
        let displayName = msg.data.account ? msg.data.account.display_name : msg.data.account;
        let username = msg.data.account ? msg.data.account.username : msg.data.account;
        let msgObj = {
          name: displayName,
          text: textWithAttachments,
          date: new Date()
        };

        // return if no data object
        if (typeof msg.data !== 'object') {
          return;
        }

        // show username if user don't have display name
        if (!displayName) {
          displayName = username;
        }

        // save to db and emit message
        saveMessageToDB(msgObj);
        self.io.emit('chat message', msgObj);
      }
    });
    listener.on('error', err => console.log(err));
  }
}

module.exports = MastodonStream;