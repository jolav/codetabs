/* */
const express = require('express');
const app = express();
require('dotenv').config();

const count = require(__dirname + '/doCount.js');
const stats = require(__dirname + '/stats.js');
const lib = require(__dirname + '/lib');

let port = 3000;
if (process.env.NODE_ENV === 'production') {
  port = process.env.PORT_LOC;
}
let folderID = 0;

app.disable('x-powered-by');

app.use(function (req, res, next) {
  res.locals.service = 'loc';
  stats.updateStats(req, res, next);
});

app.get('/get', function (req, res) {
  folderID++;
  count.repoLoc(req, res, folderID, function (response, status) {
    if (response.locs) {
      response = response.locs;
    }
    lib.sendResult(req, res, response, status);
  });
});

app.post('/upload', function (req, res) {
  folderID++;
  count.uploadLoc(req, res, folderID, function (response, status) {
    if (response.locs) {
      response = response.locs;
    }
    lib.sendResult(req, res, response, status);  });});

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
