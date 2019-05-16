/* */

const express = require('express');
const app = express();

const path = require('path');

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/headers/domain=codetabs.com => {domain: 'codetabs.com'}
app.get('/*', function (req, res) {
  // console.log('==>', req.query.domain)
  if (req.query.domain) {
    getHeaders(req, res, req.query.domain);
  } else {
    const msg = `Domain is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

async function getHeaders(req, res, url) {
  let headers = [];
  let header = {};
  //console.log('getHeaders ... ', url);
  let count = 0; // avoid infinite redirection loop
  let notMoreRedirections = false;
  do {
    try {
      header = await doCurlCommand(`curl -fsSI ${url}`);
    } catch (err) {
      // "curl: (6) Could not resolve host:"
      //console.error('ERROR 2 doing curl => ', err);
      const msg = err.trim("\n");
      lib.sendError(res, msg, 500);
      return;
    }
    headers.push(parseHeadString(header));
    //console.log('HEADER =>', header);
    if (header.indexOf("Location") === -1) {
      if (header.indexOf("location") === -1) {
        notMoreRedirections = true;
      } else {
        url = headers[count].location;
      }
    } else {
      url = headers[count].Location;
    }
    count++;
  } while (!notMoreRedirections && count < 10);
  //console.log(headers);
  lib.sendResult(req, res, headers, 200);
}

function parseHeadString(str) {
  let res = {};
  str = str.split("\r\n");
  // protocol and status code is the first line
  const name = str[0].split(" ")[0];
  const value = str[0].split(" ")[1];
  let last;
  res[name] = value;
  for (let line = 1; line < str.length; line++) {
    const name = str[line].split(": ")[0];
    const value = str[line].split(": ")[1];
    if (name === "Location") {
      last = value;
    } else {
      res[name] = value;
    }
  }
  // last line is location if exist
  if (last) {
    res["Location"] = last;
  }
  return res;
}

function doCurlCommand(command) {
  //console.log('Command ...', command);
  return new Promise((resolve, reject) => {
    lib.linuxCommand(command, function (err, res) {
      if (err) {
        //console.log('ERROR 1 doing curl => ', err);
        reject(res);
      }
      resolve(res);
    });
  });
}

module.exports = app;
