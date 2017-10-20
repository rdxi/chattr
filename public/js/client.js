$(function () {
  var socket = io();

  // verify local token or get new one from server
  // socket.emit('hello', {localToken: localToken});

  socket.on('connect', function() {
    var localToken = localStorage.getItem('token');
    socket.emit('hello', {localToken: localToken});
  });

  socket.on('token', function(token) {
    var localToken = localStorage.setItem('token', token);
    console.log(token);
  });

  socket.on('invalid token', function() {
    // delete local token and get new one from server
    localStorage.removeItem('token');
    socket.emit('hello', {localToken: null});
  });


  $('form').submit(function(){
    socket.emit('chat message', $('#user-message').val());
    $('#user-message').val('');
    return false;
  });

  socket.on('initial message history', function(items) {
    console.log('initial messages: ', items);

    if (items) {
      items.forEach(function(item) {
        var obj = JSON.parse(item);
        renderMessage({
          avatar: obj.avatar,
          user: obj.name,
          time: obj.time,
          text: obj.text
        });
      });
    }
  });


  socket.on('chat message', function(obj){

    console.log(obj);

    renderMessage({
      avatar: obj.avatar,
      user: obj.name,
      time: obj.time,
      text: obj.text
    });

    // var messages = $('.main-messages');

  });

  var renderMessage = function(msg) {
    var messagesContainer = $('.main-messages');

    var avatar = msg.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000';
    var user = msg.user || 'anonymous';
    // var time = msg.time || moment().format('MMM Do, HH:mm');
    var time = msg.time ? moment(msg.time).format("MMM Do, HH:mm") : moment().format("MMM Do, HH:mm");
    var text = anchorme(msg.text) || '??no text??';



    // TODO: auto-embed images
    // var image = $(text).siblings('a').filter(function() {
    //   return /(jpg|gif|png)$/.test($(this).attr('href'));
    // });

    // TODO?: add emojis button like slack  😀😗😙😑😮😯😴😛😕😟
    // make only 3 emojis: crying laugh, ok, and poop
    // https://unicode.org/emoji/charts/full-emoji-list.html 💩💩💩

    // var image = $(text);
    // console.log(image);


    var template = $('#message-template').html();

    var html = Mustache.render(template, {
      avatar: avatar,
      user: user,
      time: time,
      text: text
    });

    messagesContainer.append(html);
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;

  };

});