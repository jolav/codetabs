/* */
const fs = require('fs');
const https = require('https');
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

function makeHttpsRequest (path, callback) {
  https.get(path, (res) => {
    // explicitly treat incoming data as utf8 
    res.setEncoding('utf8');
    // incrementally capture the incoming response body
    var body = '';
    res.on('data', (d) => {
      body += d;
    });
    // do whatever we want with the response once it's done
    res.on('end', () => {
      try {
        var parsed = JSON.parse(body);
      } catch (err) {
        console.error('Unable to parse response as JSON', err);
        return callback(err);
      }
      // pass the relevant data back to the callback
      callback(null, parsed);
    });
  }).on('error', (err) => {
    // handle errors with the request itself
    console.error('Error with the request:', err.message);
    callback(err);
  });
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
      console.log('ERROR=', err);
      cb(false);
    });
  });
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
  makeHttpsRequest: makeHttpsRequest,
  checkUrlExists: checkUrlExists,
  linuxCommand: linuxCommand,
  downloadFile: downloadFile,
  getIP: getIP
};
