const test = require('tape');

const html = require('fs').readFileSync('./public/index.html', { encoding: 'utf-8' });
const JSDOM = require("jsdom").JSDOM;
const window = new JSDOM(html).window;

const $ = require('jquery')(window);
const proxyquire = require('proxyquire');

// const { SocketIO, MockServer } = require('mock-socket');
// io = SocketIO;

var renderHtml = proxyquire('./renderHtml.js', {'jquery': $});
var renderMessages = renderHtml.renderMessages;



test('render html', function(t) {

  t.test('renderMessages - text', function(t) {
    var dataObj = {
      name: 'Bob',
      text: 'Hello'
    };

    t.equal($('.main-message-text').text(), '', 'No text before rendering');
    renderMessages(dataObj);
    t.equal($('.main-message-text').text(), 'Hello', 'Text after rendering');

    $('.main-messages').html('');
    t.end();
  });

  t.test('renderMessages - one message', function(t) {
    var dataObj = {
      name: 'Bob',
      text: 'Hello'
    };

    t.equal($('.main-message').length, 0, '0 messages before rendering');
    renderMessages(dataObj);
    t.equal($('.main-message').length, 1, '1 message after rendering');

    $('.main-messages').html('');
    t.end();
  });

  t.test('renderMessages - three message', function(t) {
    var dataObj = [
      '{"name": "Bob", "text": "Hello"}',
      '{"name": "Rob", "text": "Hewwo"}',
      '{"name": "Gob", "text": "Bonjour"}'
    ];

    t.equal($('.main-message').length, 0, '0 messages before rendering');
    renderMessages(dataObj);
    t.equal($('.main-message').length, 3, '3 message after rendering');

    $('.main-messages').html('');
    t.end();
  });

  t.end();
});