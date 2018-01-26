/* */

const express = require('express');

const job = require(__dirname + '/headersJob.js');

const app = express();

app.get('/get/*', (req, res) => {
  job.getHeaders(req, res);
});

module.exports = app;
