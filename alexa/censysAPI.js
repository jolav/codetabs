const configFile = ('./config.json');
const fs = require('fs');
const https = require('https');

let config;

function initApp () {
  console.log('Init APP');
  config = JSON.parse(fs.readFileSync(configFile));
// console.log(config)
}

function makeRequest2 (req, response) {
  let user = config.censys.apiID;
  let pass = config.censys.secret;
  let authR = new Buffer(user + ':' + pass).toString('base64');
  // var post_data = '{"query":"80.http.get.headers.server: Apache"}'

  // var post_data = '80.http.get.headers.server: Apache'
  var post_data = 'not+443.https.tls.validation.browser_trusted%3A+true';

  console.log('OIGAGAGAGAGAGA ==>', post_data.length);

  let post_req = null;
  let post_options = {
    hostname: 'www.censys.io',
    path: '/domain',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': post_data.length,
      'Authorization': 'Basic ' + authR
    }
  };

  let result;

  post_req = https.request(post_options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers))
    // res.setEncoding('utf8')
    res.on('data', function (data) {
      result += data;
    // save all the data from response
    });
    res.on('end', function () {
      // console.log(result)
      response.send(result);
    });
  });

  /*post_req.on('error', function (e) {
    console.log('problem with request: ' + e.message)
    response.send(e.message)
  });*/

  post_req.write(post_data);
  post_req.end();
}

function makeRequest (req, res) {
  let user = config.censys.apiID;
  let pass = config.censys.secret;
  let authR = new Buffer(user + ':' + pass).toString('base64');
  let pet = {
    'query': '80.http.get.headers.server: Apache',
    'page': 1,
    'fields': ['ip', 'location.country', 'autonomous_system.asn'],
    'flatten': true
  };

  let options = {
    host: 'www.censys.io',
    path: '/api/v1/view/ipv4/89.38.144.25', // , utilidad ???? 
    // path: '/api/v1/view/websites/nodejs.org', // , utilidad ?????
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + authR
    }
  };

  makeHttpsRequest(options, function (err, data) {
    console.log('DATA ==> ', data);

    if (err) {
      console.log('ERROR ==> ', err);
      res.end();
      return;
    }
    if (data) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(data , null, 3));
    }
  });
}

function makeHttpsRequest (options, callback) {
  https.get(options, (res) => {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      try {
        var parsed = JSON.parse(body);
      } catch (err) {
        console.error('Unable to parse response as JSON', err);
        callback(err, parsed);
        return;
      }
      callback(null, parsed);
    });
  }).on('error', (err) => {
    console.error('Error with the request:', err.message);
    callback(err, null);
    return;
  });
}

module.exports = {
  initApp: initApp,
  makeRequest: makeRequest,
  makeRequest2: makeRequest2
};
