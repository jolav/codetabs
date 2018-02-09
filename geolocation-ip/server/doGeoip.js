/* */
const lib = require(__dirname + '/lib.js');
const dns = require('dns');
const maxmind = require('maxmind');
const json2xml = require('js2xmlparser');
const json2csv = require('json2csv');
const fs = require('fs');

let data;
let geoData;

function getJson (req, res, format) {
  cleanData();
  let q = req.query.q;
  if (!q) {
    q = lib.getIP(req);
  }
  if (lib.isValidIP(q)) {
    getDataFromDB(req, res, format, q);
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
      getDataFromDB(req, res, format, ip);
      return;
    });
    return;
  }
  let text = `${q} is a unknown host, not a valid IP or hostname`;
  sendResult(res, 'json', text, 400);
}

function getDataFromDB (req, res, format, ip) {
  maxmind.open('./db/GeoLite2-City.mmdb', function (err, cityLookup) {
    if (err) {
      let text = 'Error accessing database. Try again';
      sendResult(res, 'json', text, 500);
      return;
    }
    data = cityLookup.get(ip);
    if (data === null) { // not in database
      sendResult(res, format, geoData, 200);
      return;
    }
    geoData = handleGeoData(ip, data);
    sendResult(res, format, geoData, 200);
    return;
  });
}

function sendResult (res, format, data, status) {
  if (format === 'json') {
    res.header('Content-Type', 'application/json');
    res.status(status).send(JSON.stringify(data, null, 3));
  } else if (format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.status(status).send(json2xml.parse('myGeoData', data));
  } else if (format === 'csv') {
    let fields = [
      'ip',
      'country_code',
      'country_name',
      'region_code',
      'region_name',
      'city',
      'zip_code',
      'time_zone',
      'latitude',
      'longitude'];
    try {
      let fileName = data.ip + '.csv';
      let result = json2csv({ data: data, fields: fields });
      fs.writeFile(fileName, result, function (err) {
        if (err) {
          throw err;
        }
        res.download(fileName, fileName, function (err) {
          if (err) {
            res.status(404).end();
            return;
          }
          fs.unlink(fileName, undefined);
        });
      });
    } catch (err) {
      res.end();
    }
  }
  cleanData();
  return;
}

function handleGeoData (ip, data) {
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

function cleanData () {
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

module.exports = {
  getJson: getJson
};
