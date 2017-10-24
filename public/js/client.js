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

  // todo: put all messages in dom inside js
  socket.on('initial message history', function(items) {
    console.log('initial messages: ', items);

    if (items) {
      items.forEach(function(item) {
        var obj = JSON.parse(item);
        renderMessage(obj);
      });
    }
  });

  socket.on('*delete all messages*', function() {
    $('.main-messages').html('');
    renderMessage({
      name: 'admin',
      text: 'messages deleted'
    });
  });


  socket.on('chat message', function(obj){
    renderMessage(obj);
  });

  socket.on('user list', function(obj) {
    renderSidebarUsers(obj);
  });

  var renderMessage = function(obj) {
    var messagesContainer = $('.main-messages');
    var template = $('#message-template').html();

    var avatar = obj.avatar || '//www.gravatar.com/avatar/00000000000000000000000000000000';
    var user = obj.name || 'anonymous';
    var date = obj.date ? moment(obj.date).format("MMM Do, HH:mm") : moment().format("MMM Do, HH:mm");
    var text = anchorme(obj.text) || '??no text??';


    // TODO: auto-embed images
    // var image = $(text).siblings('a').filter(function() {
    //   return /(jpg|gif|png)$/.test($(this).attr('href'));
    // });

    // TODO?: add emojis button like slack  😀😗😙😑😮😯😴😛😕😟
    // make only 3 emojis: crying laugh, ok, and poop
    // https://unicode.org/emoji/charts/full-emoji-list.html 💩💩💩

    // var image = $(text);
    // console.log(image);



    var html = Mustache.render(template, {
      avatar: avatar,
      user: user,
      date: date,
      text: text
    });

    messagesContainer.append(html);
    messagesContainer[0].scrollTop = messagesContainer[0].scrollHeight;

  };

  var renderSidebarUsers = function(obj) {
    var usersContainer = $('.sidebar-users-items').html('');

    obj.users.forEach(function(user) {
      renderSidebarUser(user);
    });
  };

  var renderSidebarUser = function(msg) {
    var usersContainer = $('.sidebar-users-items');
    var template = $('#sidebar-user-template').html();

    var user = msg.name;
    var offline = msg.offline;

    var html = Mustache.render(template, {
      user: user,
      offline: offline
    });

    usersContainer.append(html);
  };

  // // *** DELET THIS >_> ***
  // window.renderSidebarUser = renderSidebarUser;


});