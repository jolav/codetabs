/* */

const lib = require(__dirname + '/lib.js');
const mongo = require('mongodb');
const connection = 'mongodb://' + process.env.DBUSER + ':' + encodeURIComponent(process.env.PASS) + '@' + process.env.URL + '/' + process.env.DBNAME;

function testDB (connection) {
  mongo.connect(connection, function (err, db) {
    if (err) throw err;
    console.log('Connected correctly to server');
    db.close();
  });
}

function updateStats (req, res, next) {
  let service = '';
  switch (req.originalUrl.split('/')[1]) {
    case 'alexa':
      service = 'alexa';
      break;
    case 'api':
      service = 'weather';
      break;
    case 'cors-proxy':
      service = 'proxy';
      break;
    case 'games':
      service = 'tetris';
      break;
    case 'http-headers':
      service = 'headers';
      break;
  }
  let dbData = {
    'ip': lib.getIP(req),
    'service': service,
    'time': new Date().toISOString().split('T')[0]
  };
  try {
    saveDataToDB(dbData);
  } catch (e) {
    console.log(e);
  }
  next();
}

function saveDataToDB (dbData) {
  // console.log('SAVING...', dbData)
  mongo.connect(connection, function (err, db) {
    if (err) throw err;
    const database = db.db('stats');
    const collection = database.collection('codetabs-hits');
    collection.insert(dbData, function (err, result) {
      if (err) throw err;
      db.close();
    });
  });
}

module.exports = {
  updateStats: updateStats
};
