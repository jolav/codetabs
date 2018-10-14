/* */
const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');
const exec = require('child_process').exec;

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

function checkUrlExists (urlchecked, cb) {
  const options = {
    method: 'HEAD',
    host: url.parse(urlchecked).host,
    path: url.parse(urlchecked).path
  };
  const req = https.get(options, function (response) {
    // console.log('STATUS=>', response.statusCode)
    cb(response.statusCode === 200);
  });
  req.end();
  req.on('error', function (err) {
    console.log('Error checking url => ', err);
    cb(false);
  });
}

function linuxCommand (command, cb) {
  exec(command, function (err, stdout, stderr) {
    if (err) {
      // console.log('Err => ', err)
      cb(err, stderr);
    }
    if (stderr) {
      cb(err, stderr);
      return;
    }
    cb(err, stdout);
  });
}

function downloadFile (url, where, cb) {
  const file = fs.createWriteStream(where);
  https.get(url, function (response) {
    response.pipe(file);
    response.on('end', function (end) {
      cb(true);
    });
    response.on('error', function (err) {
      console.log('Error downloading file: ', err);
      cb(false);
    });
  });
}

function isValidIP (ip) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
    return true;
  } else if (/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(ip)) {
    return true;
  } else {
    return false;
  }
}

function isValidHostname (hostname) {
  let condition = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$/;
  if (condition.test(hostname)) {
    return true;
  }
  return false;
}

function makeRequest (options, parameters, callback) {
  const req = https.request(options, function (res) {
    // console.log('OPTIONS=>', options)
    let body = '';
    res.setEncoding('utf8');
    res.on('data', function (d) {
      body += d;
    // save all the data from response
    });
    res.on('end', function () {
      try {
        var parsed = JSON.parse(body);
      } catch (err) {
        // console.log('PARSING ==> ', body)
        console.error('Unable to parse response as JSON', err);
        return callback(err);
      }
      callback(null, parsed, res.headers);
    });
  });
  if (options.method !== 'GET') {
    req.write(parameters);
  }
  req.end();
}

function getRandomNumber (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
  sendResult: sendResult,
  loadJSONfile: loadJSONfile,
  writeJSONtoFile: writeJSONtoFile,
  isValidURL: isValidURL,
  makeHttpsRequest: makeHttpsRequest,
  makeHttpRequest: makeHttpRequest,
  isJSON: isJSON,
  getIP: getIP,
  checkUrlExists: checkUrlExists,
  linuxCommand: linuxCommand,
  downloadFile: downloadFile,
  isValidIP: isValidIP,
  isValidHostname: isValidHostname,
  makeRequest: makeRequest,
  getRandomNumber: getRandomNumber
};
