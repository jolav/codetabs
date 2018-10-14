/* */
const express = require('express');

const job = require(__dirname + '/headersTask.js');
const lib = require(__dirname + '/../../../_lib/lib.js');

const app = express();

app.use(function (req, res, next) {
  let err = {error: ''};
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    console.log(e);
    err.error = 'not a valid domain name';
    lib.sendResult(req, res, err, 400);
    return;
  }
  next();
});

app.get('/get/*', (req, res) => {
  job.getHeaders(req, res);
});

module.exports = app;
