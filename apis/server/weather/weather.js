/* */
const express = require('express');

const job = require(__dirname + '/weatherTask.js');

const app = express();

app.get('/temp', function (req, res) {
  job.getTemp(req, res);
});

app.get('/*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

module.exports = app;
