const lib = require(__dirname + '/lib.js');
const mongo = require('mongodb');
const connection = process.env.DB_STATS;

// testDB(connection)

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
  }
  let dbData = {
    'ip': lib.getIP(req),
    'service': service,
    'time': new Date().toUTCString()
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
    const collection = database.collection('codetabs');
    collection.insert(dbData, function (err, result) {
      if (err) throw err;
      db.close();
    });
  });
}

module.exports = {
  updateStats: updateStats
};
