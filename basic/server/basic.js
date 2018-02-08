/* */
const express = require('express');
const app = express();
require('dotenv').config();

const stats = require(__dirname + '/stats.js');

const tetris = require('./tetris-game/tetris.js');
const api = require('./api/api.js');
const corsproxy = require('./cors-proxy/proxy.js');
const alexa = require('./alexa/alexa.js');
const headers = require('./http-headers/headers.js');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_BASIC;
}

app.disable('x-powered-by');

app.use(stats.updateStats);

app.use('/games/tetris', tetris);
app.use('/api', api);
app.use('/cors-proxy', corsproxy);
app.use('/alexa', alexa);
app.use('/http-headers', headers);

app.get('*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

app.listen(port, function () {
  const time = new Date().toUTCString().split(',')[1];
  console.log('Express server on port ' + port + ' - ' + time);
  stats.testDB();
});

module.exports = app;
