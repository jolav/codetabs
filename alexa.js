/* */

const express = require('express');
const app = express();

const fs = require("fs");
const path = require('path');
const exec = require('child_process').exec;
const https = require("https");

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

// download and load alexa data
initAlexa();

function initAlexa() {
  loadAlexaDataInMemory();
  onceADayTask();
}

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/alexa?web=codetabs.com => {web: 'codetabs.com'}
app.get('/*', function (req, res) {
  if (req.query.web) {
    getRankByDomainRAM(req, res, req.query.web);
  } else {
    const msg = `Domain is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

function getRankByDomainRAM(req, res, domain) {
  let o = {
    'domain': domain,
    'rank': c.alexa.ranking[domain]
  };
  if (o.rank) {
    lib.sendResult(req, res, o, 200);
    return;
  }
  if (o.domain.startsWith("www.")) {
    o.domain = o.domain.slice(4, o.domain.length);
  } else {
    o.domain = "www." + o.domain;
  }
  o.rank = c.alexa.ranking[o.domain];
  if (o.rank) {
    lib.sendResult(req, res, o, 200);
    return;
  }
  const msg = `${domain} not in alexa top 1 million`;
  lib.sendError(res, msg, 400);
}

function loadAlexaDataInMemory() {
  //console.log('Alexa loading Database In Memory .......');
  fs.readFile(c.alexa.dataFilePath, 'utf8', function (err, filedata) {
    if (err) {
      console.error('ERROR reading alexa file');
      return;
    }
    const data = filedata.split(/\r?\n/);
    for (let index = 0; index < data.length - 1; index++) {
      let aux = data[index].split(',');
      // console.log(index, " ==> ", aux[1], " pos ", index+1)
      c.alexa.ranking[aux[1]] = index + 1;
    }
  });
}

function onceADayTask() {
  if (parseInt(process.env.pm_id) % c.app.instances === 0) {
    //console.log("Special process ", process.env.pm_id);
    let now = new Date();
    let target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // the next day, ...
      5, 0, 0 // ...at 05:00:00 hours server local time
    );
    let msToTask = target.getTime() - now.getTime();

    setTimeout(function () {
      downloadDataFile(c.alexa.dataFileURL, c.alexa.zipFile, decompress);
      onceADayTask();
    }, msToTask);
  } else {
    //console.log("Std process ", process.env.pm_id);
    let now = new Date();
    let target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // the next day, ...
      5, 15, 0 // ...at 05:15:00 hours server local time
    );
    let msToTask = target.getTime() - now.getTime();

    setTimeout(function () {
      loadAlexaDataInMemory();
      onceADayTask();
    }, msToTask);
  }
}

function downloadDataFile(url, dest, callback) {
  // console.log('DOWNLOADING FILE.................')
  const file = fs.createWriteStream(dest);
  https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(callback); // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (callback) callback(err.message);
  });
}

function decompress() {
  const deleteOld = `rm ${c.alexa.dataFilePath}`;
  exec(deleteOld, function deleteData(err, stdout, stderr) {
    if (err) {
      console.error("ERROR deleting old file data => ", err);
      return;
    }
    const unzipNew = `unzip ${c.alexa.zipFile} -d ${c.alexa.dataDir}`;
    exec(unzipNew, function unzipData(err, stdout, stderr) {
      if (err) {
        console.error("ERROR unziping new file data => ", err);
        return;
      }
      loadAlexaDataInMemory();
    });
  });
}

module.exports = app;
