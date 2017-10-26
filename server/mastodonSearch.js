var mastodonSearch = function(msg, mastodon) {

  return new Promise(function(resolve, reject) {
    // console.log(msg);
    var mastodonSearchRegex = /^mastodon search/;

    if ( mastodonSearchRegex.test(msg) ) {
      // console.log('test passed');
      var searchTerm = msg.split(' ')[2];

      mastodon.get(`timelines/tag/${searchTerm}`, {limit: 1}).then(function(response) {

        if (!response.data.length) {
          resolve(false);
          return;
        }

        var text = response.data[0].content;
        var image = (response.data[0].media_attachments && response.data[0].media_attachments.length > 0) ? response.data[0].media_attachments[0].preview_url : '';


        console.log('***media attachments***', response.data[0].media_attachments);


        resolve({text: text, image: image});
      });
    } else {
      resolve(false);
    }

  });


}

module.exports = mastodonSearch;