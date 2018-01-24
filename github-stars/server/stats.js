require('dotenv').config();

const mongo = require('mongodb');
const connection = 'mongodb://' + process.env.DBUSER + ':' + encodeURIComponent(process.env.PASS) + '@' + process.env.URL + '/' + process.env.DBNAME;

function testDB () {
  mongo.connect(connection, function (err, db) {
    if (err) throw err;
    console.log('Connected correctly to server');
    db.close();
  });
}

function updateStats (req, res, next) {
  let dbData = {
    'ip': getIP(req),
    'service': 'stars',
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
  // console.log('SAVING...', dbData, connection)
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

function getIP (req) {
  return (req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress || req.socket.remoteAddress ||
  req.connection.socket.remoteAddress).split(',')[0];
}

module.exports = {
  updateStats: updateStats,
  testDB: testDB
};
