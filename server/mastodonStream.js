const redis = require('./redis.js');
const sanitizeHtml = require('sanitize-html');

class MastodonStream {
  constructor(mastodon, io, howOften) {
    this.mastodon = mastodon;
    this.io = io;
    this.howOften = howOften;
    this.init();
  }

  init() {
    var self = this;
    const listener = this.mastodon.stream('streaming/public');

    var messageDate = 0;

    listener.on('message', function(msg) {
      if(Date.now() - messageDate > self.howOften) {
        messageDate = Date.now();

        var displayName = msg.data.account ? msg.data.account.display_name : msg.data.account;
        var msgText = sanitizeHtml(msg.data.content);
        console.log(displayName, 'said: ', sanitizeHtml(msg.data.content));

        var msgAttachments = (msg.data.media_attachments && msg.data.media_attachments.length > 0) ? msg.data.media_attachments[0].preview_url : '';

        var msgLink = msg.data.url;
        var textWithAttachments = `${msgLink} ${msgText} ${msgAttachments}`;

        console.log('*** msgAttachments ', msgAttachments);

        if (!displayName) {
          console.log('*** data when undefined name: ', msg.data);
          return;
        }

        // if (msg.data.media_attachments && msg.data.media_attachments.length > 0) {
          // console.log('*** preview-image ', msg.data.media_attachments[0].preview_url);
        // }

        // post message here (needs to be in separate module)
        var msgObj = {
          name: displayName,
          text: textWithAttachments,
          date: new Date()
        };

        // repeating code
        var storedMsg = JSON.stringify(msgObj);

        redis.rpush('userMessages', storedMsg);
        redis.ltrim('userMessages', -500, -1); // store only latest 500 messages because demo db has limited capacity

        self.io.emit('chat message', msgObj);

        //
      }
    });
    listener.on('error', err => console.log(err));
  }
}

module.exports = MastodonStream;