/* */

const express = require('express');
const app = express();

const path = require('path');

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

const superagent = require('superagent');

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/proxy?quest=codetabs.com => {quest: 'codetabs.com'}
app.get('/*', function (req, res) {
  // console.log('==>', req.query.quest)
  if (req.query.quest) {
    corsProxy(req, res);
  } else {
    const msg = `Quest is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

function corsProxy(req, res) {
  let url = req.query.quest;

  if (url.slice(0, 8) === 'https://') {
    url = url.slice(8, url.length);
  } else if (url.slice(0, 7) === 'http://') {
    url = url.slice(7, url.length);
  } else {
    url = 'http://' + url;
  }
  if (!lib.isValidURL(url)) {
    url = 'http://' + url;
  }

  superagent
    .get(url)
    .timeout({
      response: 3000,
      //deadline: 5000,
    })
    .on('abort', function (err) {
      if (err) {
        let msg = "Invalid URI -> " + req.query.quest;
        console.error('ERROR PROXY 0 => ', req.originalUrl, " === ", err);
        lib.sendError(res, msg, 400);
        return;
      }
    })
    .on('error', function (err) {
      if (err) {
        let msg = "Invalid URI -> " + req.query.quest;
        console.error('ERROR PROXY 1 => ', req.originalUrl, " === ", err.code, err.errno);
        console.error(err);
        lib.sendError(res, msg, 400);
        return;
      }
    })
    .on("response", function (response) {
      if (response.type === 'application/json') {
        res.setHeader("Content-Type", "application/json");
      }
    })
    .pipe(res);

}

module.exports = app;
