/* */

const express = require('express');
const app = express();

const fs = require("fs");
const path = require('path');
const exec = require('child_process').exec;

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

const readline = require('readline');

// download and load alexa data
initAlexa();

function initAlexa() {
  //loadAlexaDataInMemory();
  /*setInterval(() => {
    loadAlexaDataInMemory();
  }, 2000);*/
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
  console.log('Alexa loading Database In Memory .......', process.env.pm_id);
  const myData = readline.createInterface({
    input: fs.createReadStream(c.alexa.dataFilePath)
  });
  let lineNumber = 0;
  myData.on('line', function readLine(line) {
    lineNumber++;
    let aux = line.split(',');
    //console.log(aux[1], lineNumber);
    c.alexa.ranking[aux[1]] = lineNumber;
  });
  myData.on('close', function done() {
    console.log('Alexa loaded Database In Memory .......', process.env.pm_id);
  });
}

function onceADayTask() {
  if (parseInt(process.env.pm_id) % c.app.instances === 0) {
    //console.log("Only Special process ", process.env.pm_id);
    let now = new Date();
    let target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // the next day, ...
      5, 0, 0 // ...at 05:00:00 hours server local time
    );
    const msToDownload = target.getTime() - now.getTime();
    console.log('Alexa will download at ', target.toString());
    setTimeout(function () {
      downloadDataFile();
    }, msToDownload);
  }
  //console.log("Std process ", process.env.pm_id);
  let now = new Date();
  let target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // the next day, ...
    5, 15, 0 // ...at 05:15:00 hours server local time
  );
  const msToTask = target.getTime() - now.getTime();
  setTimeout(function () {
    onceADayTask();
  }, msToTask);

  loadAlexaDataInMemory();
}

function downloadDataFile() {
  console.log('Download Daily File .......', process.env.pm_id);
  const deleteOld = `rm -r ${c.alexa.dataDir}`;
  const downloadNew = "wget -P " + c.alexa.dataDir + " " + c.alexa.dataFileURL;
  const unzipNew = `unzip ${c.alexa.zipFile} -d ${c.alexa.dataDir}`;
  //console.log(deleteOld);
  //console.log(downloadNew);
  //console.log(unzipNew);
  exec(deleteOld, function deleteData(err, stdout, stderr) {
    if (err) {
      console.error("ERROR deleting old files data => ", err);
      return;
    }
    exec(downloadNew, function downloadData(err, stdout, stderr) {
      if (err) {
        console.error("ERROR downloading new file data => ", err);
        return;
      }
      exec(unzipNew, function unzipData(err, stdout, stderr) {
        if (err) {
          console.error("ERROR unziping new file data => ", err);
          return;
        }
      });
    });
  });

}

// memory leak
/*
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

function unzipFile() {
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

*/

module.exports = app;
