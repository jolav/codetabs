/* */
require('dotenv').config();
const mongo = require('mongodb');
const lib = require('./lib.js');
const connection = process.env.DB_STATS;
const myIP = [
  process.env.IP1,
  process.env.IP2,
  process.env.IP3,
  process.env.IP4,
  process.env.IP5
];

function testDB () {
  mongo.connect(connection, function (err, db) {
    if (err) throw err;
    console.log('Connected to database ... OK');
    db.close();
  });
}

function updateStats (req, res, next) {
  const test = lib.getIP(req);
  if (myIP.indexOf(test) === -1) {
    // console.log(test , ' => SAVE')
    let service = res.locals.service;
    if (!service) {
      const original = req.originalUrl.split('/')[1];
      switch (original) {
        case 'alexa':
          service = 'alexa';
          break;
        case 'weather':
          service = 'weather';
          break;
        case 'cors-proxy':
          service = 'proxy';
          break;
        case 'http-headers':
          service = 'headers';
          break;
      }
    }
    let dbData = {
      'ip': lib.getIP(req),
      'service': service,
      'time': new Date().toISOString().split('T')[0]
    };
    if (dbData.service) {
      try {
        if (process.env.NODE_ENV === 'production') {
          saveDataToDB(dbData);
        } else {
          console.log('SAVE TEST ...', dbData);
        }
      } catch (e) {
        const time = new Date().toUTCString().split(',')[1];
        console.log('########## STATS ERROR ##########');
        console.log(time);
        console.log(dbData);
        console.log(e);
        console.log('#################################');
      }
    } else {
      console.log('Not Service from ', dbData.ip);
    }
  } else {
    // console.log(test , ' => DONT SAVE')
  }
  next();
}

function saveDataToDB (dbData) {
  mongo.connect(connection, function (err, db) {
    if (err) throw err;
    const database = db.db(process.env.DB_NAME);
    const collection = database.collection(process.env.COLLECTION);
    collection.insert(dbData, function (err, result) {
      if (err) throw err;
      db.close();
    });
  });
}

module.exports = {
  updateStats: updateStats,
  testDB: testDB
};
