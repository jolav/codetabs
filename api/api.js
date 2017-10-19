const express = require('express');

const job = require('./doTheJob.js');

const app = express();

app.get('/weather/temp', (req, res) => {
  job.getTemp(req, res);
});

app.get('/*', (req, res) => {
  // res.redirect('https://codetabs.com/notFound')
  res.status(404).send('Not Found');
});

module.exports = app;
