const test = require('tape');

const html = require('fs').readFileSync('./public/index.html', { encoding: 'utf-8' });
const JSDOM = require("jsdom").JSDOM;
const window = new JSDOM(html).window;

const $ = require('jquery')(window);
const proxyquire = require('proxyquire').noCallThru();
const soundOfMessageStub = {play: ()=> null};

const renderHtml = proxyquire('./renderHtml.js', {'jquery': $, './soundOfMessage.js': soundOfMessageStub});
const renderMessages = renderHtml.renderMessages;



test('render html', function(t) {

  t.test('renderMessages - text', function(t) {
    var dataObj = {
      name: 'Bob',
      text: 'Hello'
    };

    t.equal($('.main-message-text').text(), '', 'no text before rendering');
    renderMessages(dataObj);
    t.equal($('.main-message-text').text(), 'Hello', 'text after rendering');

    $('.main-messages').html('');
    t.end();
  });

  t.test('renderMessages - 1 message', function(t) {
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

  t.test('renderMessages - 3 messages', function(t) {
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