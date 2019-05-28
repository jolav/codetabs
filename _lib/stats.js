/* */

const path = require('path');

const lib = require(path.join(__dirname, 'lib.js'));

function getCleanUrl(req) {
  let quest = req.headers.origin || req.headers.host;
  if (quest.slice(0, 12) === 'https://www.') {
    quest = quest.slice(12);
  } else if (quest.slice(0, 11) === 'http://www.') {
    quest = quest.slice(11);
  } else if (quest.slice(0, 8) === 'https://') {
    quest = quest.slice(8);
  } else if (quest.slice(0, 7) === 'http://') {
    quest = quest.slice(7);
  }
  return (quest);
}

function updateStats(req, res, mode, next) {
  const ip = lib.getIP(req);
  if (ip) {
    // console.log(test , ' => SAVE')
    const time = new Date().toISOString().split('T')[0];
    let data = {
      'service': res.locals.service,
      'time': time
    };
    if (data.service) {
      const service = data.service.toUpperCase();
      const cleanUrl = getCleanUrl(req);
      const quest = req.originalUrl;
      const log = `${ip} ${service} ${cleanUrl} ${quest}`;
      console.log(log);
      if (mode === 'production') {
        sendHit(data.service);
      } else {
        console.log('FAKE INSERT HIT');
      }
    } else {
      console.log('Not Service from ', ip);
    }
  } else {
    console.log(ip, ' => DONT SAVE');
  }
  next();
}

const http = require("http");

function sendHit(service) {
  let path = "http://localhost:3970/addhit/" + service;
  makeHttpRequest(path, function (err, res, data) {
    if (err) {
      console.error('Error with the request:', err.message);
    }
  });
}

function makeHttpRequest(path, callback) {
  http.get(path, function (resp) {
    let data = '';
    resp.on('data', function (chunk) {
      data += chunk;
    });
    resp.on('end', function () {
      try {
        var parsed = JSON.parse(data);
      } catch (err) {
        //console.error('Unable to parse response as JSON', err);
        return callback(err, null, null);
      }
      callback(null, resp, parsed);
    });
  }).on('error', (err) => {
    //console.error('Error with the request:', err.message);
    callback(err, null, null);
  });
}

module.exports = {
  updateStats: updateStats,
};

