/* */
const express = require('express');
const app = express();

require('dotenv').config({ path: __dirname + '/../../_lib/.env' });
const stats = require(__dirname + '/../../_lib/stats.js');
const lib = require(__dirname + '/../../_lib/lib.js');
const job = require(__dirname + '/starsTask.js');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_STARS;
}

app.disable('x-powered-by');

app.use(function (req, res, next) {
  res.locals.service = 'stars';
  stats.updateStats(req, res, next);
});

app.get('/get', function (req, res) {
  console.log('1');
  job.getRepoHistory(req, res, function (response, status) {
    if (response.data) {
      response = response.data;
    }
    lib.sendResult(req, res, response, status);
  });
});

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
