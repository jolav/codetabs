/* */
const express = require('express');
const app = express();

const job = require('./doGeoip.js');
const stats = require(__dirname + '/stats.js');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_GEOIP;
}

app.disable('x-powered-by');

app.use(function (req, res, next) {
  res.locals.service = 'geoip';
  stats.updateStats(req, res, next);
});

app.get('/json/', (req, res) => {
  job.getJson(req, res, 'json');
});

app.get('/xml/', (req, res) => {
  job.getJson(req, res, 'xml');
});

app.get('/csv/', (req, res) => {
  job.getJson(req, res, 'csv');
});

app.get('*', (req, res) => {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

app.listen(
  port,
  () => {
    console.log('Express server listening on port ' + port);
  });

module.exports = app;
