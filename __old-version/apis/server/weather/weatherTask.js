/* */
const json2xml = require('js2xmlparser');
const lib = require(__dirname + '/../../../_lib/lib.js');

let weatherData = {
  'city': '',
  'country': '',
  'tempC': '',
  'tempF': '',
  'lat': '',
  'lon': ''
};

const base = 'https://api.openweathermap.org/data/2.5/weather?q=';

function getTemp (req, res) {
  weatherData = {};
  let format = req.query.format;
  if (format !== 'xml') {
    format = 'json';
  }
  let city = req.query.city;
  if (city) {
    cityToTemp(req, res, city, format);
  } else {
    getFromGeo(req, res, format);
  }
}

function getFromGeo (req, res, format) {
  let getipurl = 'https://geoip.tools/v1/json?q=' + lib.getIP(req);
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
    let gettempurl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + weatherData.lat + '&lon=' + weatherData.lon + '&APPID=' + process.env.OPENWEATHER_KEY;
    // console.log('3·', gettempurl)
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

function cityToTemp (req, res, city, format) {
  let path = base + encodeURIComponent(city) + '&APPID=' + process.env.OPENWEATHER_KEY;
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

function sendResult (res, format, data, status) {
  if (format === 'json') {
    res.header('Content-Type', 'application/json');
    res.status(status).send(JSON.stringify(data, null, 3));
  } else if (format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.status(status).send(json2xml.parse('myTemp', data));
  }
  weatherData = {};
}

module.exports = {
  getTemp: getTemp
};
