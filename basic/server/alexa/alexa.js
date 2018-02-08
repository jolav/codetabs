/* */
const express = require('express');

const job = require(__dirname + '/alexaJob.js');
const lib = require(__dirname + '/../lib.js');

const app = express();

// download and load alexa data
job.initAlexa();

// localhost:3000/alexa/get?d=codetabs.com => {d: 'codetabs.com'}
app.get('/get', function (req, res) {
  // console.log('==>', req.query.d)
  if (req.query.d) {
    job.getRankByDomain(req, res, req.query.d);
  } else {
    lib.sendResult(req, res, {'error': 'Domain is empty'}, 400);
  }
});

// localhost:3000/alexa/get/codetabs.com => {"d":"codetabs.com"}
app.get('/get/:d', function (req, res) {
  // console.log('==>', req.params.d)
  job.getRankByDomain(req, res, req.params.d);
});

app.get('/*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

module.exports = app;
