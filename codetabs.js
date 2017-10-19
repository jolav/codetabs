const express = require('express');

const app = express();

const lib = require('./lib.js');
const filePath = ('./config.json');
const stats = require(__dirname + '/stats.js');

const tetris = require('./tetris-game/tetris.js');
const api = require('./api/api.js');
const corsproxy = require('./cors-proxy/cors-proxy.js');
const alexa = require('./alexa/alexa.js');
// const loc = require('./count-loc/count-loc.js')
// const stars = require('./github-stars/github-stars.js')

global.ct = {}; // .spData ; 

const port = process.env.PORT || 3000;
// const port = process.env.PORT || 3503

app.disable('x-powered-by');

app.use(stats.updateStats);

app.use('/games/tetris', tetris);
app.use('/api', api);
app.use('/cors-proxy', corsproxy);
app.use('/alexa', alexa);
// app.use('/count-loc', loc)
// app.use('/github-stars', stars)

app.get('*', (req, res) => {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

app.listen(
  port,
  () => {
    console.log('Express server listening on port ' + port);
  },
  initApp()
);

function initApp () {
  lib.loadJSONfile(filePath, 0, function (data) {
    global.ct.config = data;
  });
}

module.exports = app;
