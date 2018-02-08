/* */
const fs = require('fs');
const https = require('https');
const http = require('http');

function sendResult (req, res, data, status) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(data, null, 3));
}

function loadJSONfile (filePath, flag, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      callback(JSON.parse(data));
    }
  });
}

function writeJSONtoFile (filePath, dataSet, callback) {
  const json = JSON.stringify(dataSet);
  fs.writeFile(filePath, json, 'utf8', (err) => {
    if (err) {
      throw err;
    }
    callback();
  });
}

function isValidURL (url) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

function makeHttpsRequest (path, callback) {
  https.get(path, (res) => {
    var body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      callback(res, body);
    });
  }).on('error', (err) => {
    console.error('Error with the request:', err.message);
    callback(err);
  });
}

function makeHttpRequest (path, callback) {
  http.get(path, (req, res) => {
    var body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      callback(res, body);
    });
  }).on('error', (err) => {
    console.error('Error with the request:', err.message);
    callback(err);
  });
}

function isJSON (str) {
  try {
    JSON.parse(str);
  } catch (err) {
    return false;
  }
  return true;
}

function getIP (req) {
  return (req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress || req.socket.remoteAddress ||
  req.connection.socket.remoteAddress).split(',')[0];
}

module.exports = {
  sendResult: sendResult,
  loadJSONfile: loadJSONfile,
  writeJSONtoFile: writeJSONtoFile,
  isValidURL: isValidURL,
  makeHttpsRequest: makeHttpsRequest,
  makeHttpRequest: makeHttpRequest,
  isJSON: isJSON,
  getIP: getIP
};
