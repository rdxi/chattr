const _ = require('underscore');
const sanitizeHtml = require('sanitize-html');

class MastodonStream {
  constructor(mastodon, howOften) {
    this.mastodon = mastodon;
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
        console.log(displayName, 'said: ', sanitizeHtml(msg.data.content));

        if (msg.data.media_attachments && msg.data.media_attachments.length > 0) {
          console.log('*** preview-image ', msg.data.media_attachments[0].preview_url);
        }

        // post message here (needs to be in separate module)
      }
    });
    listener.on('error', err => console.log(err));
  }
}

module.exports = MastodonStream;