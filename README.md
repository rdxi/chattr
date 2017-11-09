Chattr
======

Chat app with Mastodon integration

Online demo: [http://chat3000.herokuapp.com/](http://chat3000.herokuapp.com/)
(takes ~30 seconds to start up)

<!-- screenshot here -->

## Features
- **Mastodon** search-bot and stream of recent posts
- **Socket.io** for client-server communication
- **Redis** for persistent messages and users
- **Browserify** for modular client-side code
- **JWT** for user authorization
- **tape** for unit and integration testing
- **jsdom** for DOM testing
- **ES6** on server
- adaptive layout
- auto-generated avatars and names
- embeddable images
- @userMentions with sound notification
- unicode **EMOJIS** 👌👌👌😂😂😂

## Search-bot
Type ```mastodon find thing``` to find latest post with "thing" hashtag


## Installation
(note: client-side dependencies are saved in package.json as devDependencies)

```cd chattr```

```npm install``` install server dependencies

```npm install --only=dev``` (optional) install devDependencies

## Usage
(note: redis must be running (app uses default redis settings))

```npm run start``` start app normally

```npm run watch``` watch app: auto restart and rebuild client bundle if js files have changed *(needs devDeps)*

```npm run test-client``` test client-side *(needs devDeps)*

```npm run test-server``` test server-side *(needs devDeps)*




