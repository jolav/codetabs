/* */

const express = require('express');
const app = express();

const path = require('path');
const json2xml = require('js2xmlparser');

const c = require(path.join(__dirname, '_config.js'));
const w = require(path.join(__dirname, '_private.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

const base = 'https://api.openweathermap.org/data/2.5/weather?q=';

let weatherData = {
  'city': '',
  'country': '',
  'tempC': '',
  'tempF': '',
  'lat': '',
  'lon': ''
};

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/weather?city=paris&format=xml
app.get('/*', function (req, res) {
  weatherData = {};
  let format = req.query.format;
  if (format === '' || format === undefined) {
    format = 'json';
  }
  if (format !== "xml" && format !== "json") {
    const msg = `Format not recognized`;
    lib.sendError(res, msg, 400);
    return;
  }
  const city = req.query.city;
  if (city) {
    cityToTemp(req, res, city, format);
  } else {
    getFromGeo(req, res, format);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

function getFromGeo(req, res, format) {
  let getipurl = 'https://api.codetabs.com/v1/geolocation/json?q=' + lib.getIP(req);
  //console.log(getipurl);
  lib.makeHttpsRequest(getipurl, function (res2, data) {
    if (res2.statusCode !== 200) {
      let text = `Error ${res2.statusCode}`;
      sendResult(res, 'json', text, res2.statusCode);
      return;
    }
    data = JSON.parse(data);
    weatherData.city = data.city;
    weatherData.country = data.country_code;
    weatherData.lat = data.latitude;
    weatherData.lon = data.longitude;
    // weatherData.tempC = (data.main.temp - 273.15).toFixed(2)
    // weatherData.tempF = ((9 / 5 * weatherData.tempC) + 32).toFixed(2)
    // console.log('2', weatherData)
    if (weatherData.city !== '') {
      cityToTemp(req, res, weatherData.city, format);
      return;
    }
    let gettempurl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + weatherData.lat + '&lon=' + weatherData.lon + '&APPID=' + w.weatherConf.openWeather.key;
    //console.log('3·', gettempurl)
    lib.makeHttpsRequest(gettempurl, function (res2, data) {
      if (res2.statusCode !== 200) {
        let text = `Error ${res2.statusCode}`;
        sendResult(res, 'json', text, res2.statusCode);
        return;
      }
      data = JSON.parse(data);
      weatherData.city = data.name;
      weatherData.country = data.sys.country;
      weatherData.tempC = (data.main.temp - 273.15).toFixed(2);
      weatherData.tempF = ((9 / 5 * weatherData.tempC) + 32).toFixed(2);
      sendResult(res, format, weatherData, 200);
    });
  });
}

function cityToTemp(req, res, city, format) {
  let path = base + encodeURIComponent(city) + '&APPID=' + w.weatherConf.openWeather.key;
  lib.makeHttpsRequest(path, function (res2, data) {
    if (res2.statusCode !== 200) {
      let text = `Sorry, ${city} not found`;
      sendResult(res, 'json', text, res2.statusCode);
      return;
    }
    data = JSON.parse(data);
    weatherData.city = city;
    weatherData.country = data.sys.country;
    weatherData.lat = data.coord.lat.toFixed(4);
    weatherData.lon = data.coord.lon.toFixed(4);
    weatherData.tempC = (data.main.temp - 273.15).toFixed(2);
    weatherData.tempF = ((9 / 5 * weatherData.tempC) + 32).toFixed(2);
    sendResult(res, format, weatherData, 200);
  });
}

function sendResult(res, format, data, status) {
  if (format === 'json') {
    res.header('Content-Type', 'application/json');
    res.status(status).send(JSON.stringify(data, null, 3));
  } else if (format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.status(status).send(json2xml.parse('myTemp', data));
  }
  weatherData = {};
}

module.exports = app;
