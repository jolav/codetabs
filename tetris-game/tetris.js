const express = require('express');
const bodyParser = require('body-parser');

const job = require('./doTheJob.js');

const app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies

app.get('/hs', (req, res) => {
  job.getHighScore(req, res);
});

app.post('/hs', (req, res) => {
  job.postHighScore(req, res);
});

app.use('*', (req, res) => {
  // res.redirect('https://codetabs.com/notFound')
  res.status(404).send('Not Found');
});

module.exports = app;
