/* */

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

const c = require(path.join(__dirname, '_config.js'));
const stats = require(path.join(__dirname, '/_lib/stats.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

const alexa = require(path.join(__dirname, 'alexa.js'));
const headers = require(path.join(__dirname, 'headers.js'));
const loc = require(path.join(__dirname, 'loc.js'));
const proxy = require(path.join(__dirname, 'proxy.js'));
const stars = require(path.join(__dirname, 'stars.js'));
const weather = require(path.join(__dirname, 'weather.js'));
const video2gif = require(path.join(__dirname, 'video2gif.js'));
const geolocation = require(path.join(__dirname, 'geolocation.js'));

if (c.app.mode === 'dev') {
  c.app.port = 3000;
}

app.disable('x-powered-by');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(function (req, res, next) {
  //console.log("REQUEST =>", req.path);
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    //console.error(e);
    const msg = "Bad request : " + req.path + ' is not a valid url';
    lib.sendError(res, msg, 400);
    return;
  }

  //const params = req.originalUrl.split('/');
  const params = req.path.split("/");
  if (params[1] !== "v1") {
    const msg = "Bad request : " + params[1] + ' ??';
    lib.sendError(res, msg, 400);
    return;
  }
  const service = params[2];
  if (c.app.services.indexOf(service) === -1) { // service doesnt exist
    const msg = "Bad request : Service " + service + ' doesnt exists';
    lib.sendError(res, msg, 400);
    return;
  }
  res.locals.service = service;
  //
  stats.updateStats(req, res, c.app.mode, next);
  //next();
});

app.use('/v1/alexa', alexa);
app.use('/v1/headers', headers);
app.use('/v1/loc', loc);
app.use('/v1/proxy', proxy);
app.use('/v1/stars', stars);
app.use('/v1/weather', weather);
app.use("/v1/video2gif", video2gif);
app.use("/v1/geolocation", geolocation);

app.get('/*', function (req, res) {
  c.error.Error = "404 Not found";
  res.status(404).json(c.error);
});

app.listen(c.app.port, function () {
  const time = new Date().toUTCString().split(',')[1];
  console.log('Express server on port ' + c.app.port + ' - ' + time);
  initApp();
});

function initApp() {
  console.log(process.env.NODE_ENV);
}

module.exports = app; 
