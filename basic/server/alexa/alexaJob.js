/* */
const exec = require('child_process').exec;
const https = require('https');
const fs = require('fs');
const lib = require(__dirname + '/../lib.js');

function initAlexa () {
  // downloadDataFile(dataFileURL, desFile, decompress)
  onceADayTask();
}

let e = {
  'error': ''
};

let result = {
  'domain': '',
  'rank': ''
};

function getRankByDomain (req, res, domain) {
  res.header('Content-Type', 'application/json');
  domain = domain.replace('https://', '');
  domain = domain.replace('http://', '');
  domain = domain.replace('www.', '');
  exec(`cat ./alexa/data/top-1m.csv | grep ${domain}`,
    function parseCatResult (err, stdout, stderr) {
      if (err) {
        e.error = `${domain} not in alexa top 1 million`;
        lib.sendResult(req, res, e, 400);
        return;
      }
      if (stderr) {
        e.error = stderr;
        lib.sendResult(req, res, e, 400);
        return;
      }
      stdout = (stdout.split('\n'));
      // remove last empty element ''
      stdout = stdout.slice(0, stdout.length - 1);
      if (stdout.length === 1) {
        result = {
          'domain': domain,
          'rank': stdout[0].split(',')[0]
        };
        lib.sendResult(req, res, result, 200);
        return;
      }
      for (let i = 0; i < stdout.length; i++) {
        if (stdout[i].split(',')[1] === domain) {
          result = {
            'domain': domain,
            'rank': stdout[i].split(',')[0]
          };
          lib.sendResult(req, res, result, 200);
          return;
        }
      }
      e.error = `Multiple results include ${domain} .Must be more specific`;
      lib.sendResult(req, res, e, 400);
    });
}

const dataFileURL = 'https://s3.amazonaws.com/alexa-static/top-1m.csv.zip';
const desFile = './alexa/data/top-1m.csv.zip';

function downloadDataFile (url, dest, callback) {
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

function decompress () {
  exec(`rm ./alexa/data/top-1m.csv`,
    function deleteData (err, stdout, stderr) {
      if (err) {
        e.error = `Error deleteing file data`;
        console.log(e, '\n', err);
      // return
      }
      exec(`unzip ./alexa/data/top-1m.csv -d ./alexa/data`,
        function unzipData (err, stdout, stderr) {
          if (err) {
            e.error = `Error unziping file data`;
            console.log(e, '\n', err);
            return;
          }
        });
    });
}

function onceADayTask () {
  let now = new Date();
  let target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // the next day, ...
    5, 0, 0 // ...at 05:00:00 hours server local time
  );
  let msToTask = target.getTime() - now.getTime();

  setTimeout(function () {
    downloadDataFile(dataFileURL, desFile, decompress);
    onceADayTask();
  }, msToTask);
}

module.exports = {
  initAlexa: initAlexa,
  getRankByDomain: getRankByDomain
};
