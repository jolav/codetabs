const fs = require('fs');
const lib = require(__dirname + '/lib.js');
const dataFile = '/var/www/codetabs/admin/hits.json';

const updateStats = function (req, res, next) {
  const ip = lib.getIP(req);
  loadJSONfile(dataFile, null, function (data) {
    if (data[ip] === undefined) {
      data[ip] = {'times': 1};
    } else {
      data[ip].times++;
    }
    data[ip].lastTime = new Date().toUTCString();
    writeJSONtoFile(dataFile, data, function () {});
  });
  next();
};

module.exports = {
  updateStats: updateStats
};

function loadJSONfile (filePath, flag, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      // console.log(err)
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

// codetabs.js
/*

const stats = require(__dirname + '/stats.js')
app.use(stats.updateStats)

*/
