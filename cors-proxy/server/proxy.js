/* */

const express = require('express');
const app = express();

require('dotenv').config({ path: __dirname + '/../../_lib/.env' });
const stats = require(__dirname + '/../../_lib/stats.js');
// const lib = require(__dirname + '/../../_lib/lib.js')
const job = require(__dirname + '/proxyTask.js');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_PROXY;
}

app.disable('x-powered-by');

app.use(stats.updateStats);

app.get('/cors-proxy/*', function (req, res) {
  job.corsProxy(req, res);
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
