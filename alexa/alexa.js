const express = require('express');

const job = require('./doTheJob.js');

const app = express();

// download and load alexa data
job.initAlexa();

// localhost:3000/alexa/get?d=codetabs.com => {d: 'codetabs.com'}
app.get('/get', (req, res) => {
  // console.log('==>', req.query.d)
  job.getRankByDomain(req, res, req.query.d);
});

// localhost:3000/alexa/get/codetabs.com => {"d":"codetabs.com"}
app.get('/get/:d', (req, res) => {
  // console.log('==>', req.params.d)
  job.getRankByDomain(req, res, req.params.d);
});

app.get('/*', (req, res) => {
  // res.redirect('https://codetabs.com/notFound')
  res.status(404).send('Not Found');
});

module.exports = app;
