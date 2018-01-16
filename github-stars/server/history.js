require('dotenv').config();

const express = require('express');
const app = express();

const stars = require(__dirname + '/doStars.js');
const stats = require(__dirname + '/stats.js');
const lib = require(__dirname + '/lib');

let port = 3000;
if (process.env.ENV === 'prod') {
  port = process.env.PORT;
}

stats.testDB();
app.use(stats.updateStats);

app.disable('x-powered-by');

app.get('/get', function (req, res) {
  stars.getRepoHistory(req, res, function (response, status) {
    if (response.data) {
      response = response.data;
    }
    lib.sendResult(req, res, response, status);
  });
});

app.get('*', function (req, res) {
  res.redirect('https://codetabs.com/notFound');
// res.status(404).send('Not Found')
});

app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});

module.exports = app;
