/* */
const fs = require('fs');
const https = require('https');

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

function getIP (req) {
  return (req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress || req.socket.remoteAddress ||
  req.connection.socket.remoteAddress).split(',')[0];
}

module.exports = {
  sendResult: sendResult,
  loadJSONfile: loadJSONfile,
  writeJSONtoFile: writeJSONtoFile,
  getRandomNumber: getRandomNumber,
  makeRequest: makeRequest,
  getIP: getIP
};
