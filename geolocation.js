/* */

const express = require('express');
const app = express();

const path = require('path');
const dns = require('dns');
const json2xml = require('js2xmlparser');
const lib = require(path.join(__dirname, '/_lib/lib.js'));

const c = require(path.join(__dirname, '_config.js'));

/* DATABASE IN MEMORY */
const MMDBReader = require('mmdb-reader');
const dbpath = path.join(__dirname, '/_data/geolocation/GeoLite2-City.mmdb');
const reader = new MMDBReader(dbpath);

app.get('/json', function (req, res) {
  getGeoData(req, res, 'json');
});

app.get('/xml', function (req, res) {
  getGeoData(req, res, 'xml');
});

app.get('*', function (req, res) {
  if (c.app.mode === "production") {
    res.redirect('https://codetabs.com/notFound');
  } else {
    res.status(404).send('Not Found');
  }
});

let data;
let geoData;

function getGeoData(req, res, format) {
  cleanData();
  let q = req.query.q;
  if (!q) {
    q = lib.getIP(req);
  }
  if (lib.isValidIP(q)) {
    getDataFromRAM(req, res, format, q);
    return;
  }
  if (lib.isValidHostname(q)) {
    dns.lookup(q, function (err, ip) {
      if (err) {
        let text = `${q} is a unknown host, not a valid IP or hostname`;
        sendResult(res, 'json', text, 400);
        return;
      }
      if (ip === null || ip === undefined) {
        let text = `${q} is a unknown host, not a valid IP or hostname`;
        sendResult(res, 'json', text, 400);
        return;
      }
      getDataFromRAM(req, res, format, ip);
      return;
    });
    return;
  }
  let text = `${q} is a unknown host, not a valid IP or hostname`;
  sendResult(res, 'json', text, 400);
}

function getDataFromRAM(req, res, format, ip) {
  data = reader.lookup(ip);
  if (data === null) { // not in database
    sendResult(res, format, geoData, 200);
    return;
  }
  geoData = handleGeoData(ip, data);
  sendResult(res, format, geoData, 200);
  return;
}

function sendResult(res, format, data, status) {
  if (format === 'json') {
    res.header('Content-Type', 'application/json');
    res.status(status).send(JSON.stringify(data, null, 3));
  } else if (format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.status(status).send(json2xml.parse('myGeoData', data));
  }
  cleanData();
  return;
}

function handleGeoData(ip, data) {
  geoData.ip = ip;
  if (data.country !== undefined) {
    geoData.country_code = data.country.iso_code || '';
    geoData.country_name = data.country.names['en'] || '';
  }
  if (data.subdivisions !== undefined) {
    geoData.region_code = data.subdivisions[0].iso_code || '';
    geoData.region_name = data.subdivisions[0].names['en'] || '';
  }
  if (data.city !== undefined) {
    geoData.city = data.city.names['en'] || '';
  }
  if (data.postal !== undefined) {
    geoData.zip_code = data.postal.code || '';
  }
  if (data.location !== undefined) {
    geoData.time_zone = data.location.time_zone || '';
    geoData.latitude = data.location.latitude.toFixed(4) || '';
    geoData.longitude = data.location.longitude.toFixed(4) || '';
  }
  return geoData;
}

function cleanData() {
  data = {};
  geoData = {
    'ip': '',
    'country_code': '',
    'country_name': '',
    'region_code': '',
    'region_name': '',
    'city': '',
    'zip_code': '',
    'time_zone': '',
    'latitude': '',
    'longitude': ''
  };
}

module.exports = app;
