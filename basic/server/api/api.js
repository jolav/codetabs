/* */
const express = require('express');

const job = require(__dirname + '/apiJob.js');

const app = express();

app.get('/weather/temp', function (req, res) {
  job.getTemp(req, res);
});

app.get('/*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

module.exports = app;
