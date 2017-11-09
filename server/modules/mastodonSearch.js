const mastodon = require('./mastodon.js');
const sanitizeHtml = require('sanitize-html');
const saveMessageToDB = require('./saveMessageToDB.js');

var mastodonSearch = function(msg, io) {
  return new Promise(function(resolve, reject) {
    var mastodonSearchRegex = /(^mastodon search)|(^mastodon find)/i;

    if ( mastodonSearchRegex.test(msg) ) {
      let searchTerm = msg.split(' ')[2];

      mastodon.get(`timelines/tag/${searchTerm}`, {limit: 1}).then(function(response) {

        // if nothing found
        if (!response.data.length) {
          let botMessage = {name: 'Mastodon bot', text: 'Nothing found'};
          io.emit('chat message', botMessage);
          return resolve(false);
        }

        // if something found
        let text = response.data[0].content;
        let sanitizedText = sanitizeHtml(text);
        let image = (response.data[0].media_attachments && response.data[0].media_attachments.length > 0) ? response.data[0].media_attachments[0].preview_url : '';
        let linkToPost = response.data[0].url;
        let botMessage = {
          name: 'Mastodon bot',
          text: `${linkToPost} <br> ${sanitizedText} ${image}`
        };

        saveMessageToDB(botMessage);
        io.emit('chat message', botMessage);
        return resolve(botMessage);
      });
    } else {
      return reject('not mastodon search');
    }
  });


};

module.exports = mastodonSearch;