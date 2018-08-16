/* */
require('dotenv').config();

const MY_TABLE = process.env.MY_TABLE;

const mysql = require('mysql');
const lib = require('./lib.js');

const con = mysql.createConnection({
  host: process.env.MY_HOST,
  user: process.env.MY_USER,
  password: process.env.MY_PASSWORD,
  database: process.env.MY_DB,
  connectTimeout: 20000,
  acquireTimeout: 20000
});

function updateStats (req, res, next) {
  const test = lib.getIP(req);
  if (test) {
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
    const time = new Date(); // .toISOString().split('T')[0]
    let dbData = {
      'service': service,
      'time': time
    };
    if (dbData.service) {
      if (process.env.NODE_ENV === 'production') {
        insertHit(dbData);
      } else {
        console.log('SAVE TEST ...', dbData);
      }
    } else {
      console.log('Not Service from ', dbData.ip);
    }
  } else {
    // console.log(test , ' => DONT SAVE')
  }
  next();
}

function insertHit (data) {
  let sql = 'INSERT INTO ?? (time, alexa, loc, stars, proxy, headers, weather)';
  sql += ' VALUES (?, 0, 0, 0, 0, 0, 0)';
  sql += ` ON DUPLICATE KEY UPDATE ${data.service} = ${data.service} + 1;`;
  const inserts = [MY_TABLE, data.time];
  sql = mysql.format(sql, inserts);
  con.query(sql, function (err, rows) {
    if (err) {
      console.log('Insert HIT error =>', err);
    // throw err
    } else {
      // console.log(rows)
    }
  });
}

function testDB () {
  console.log('Connecting ......');
  // console.log(con)
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to DB => ', err);
    } else {
      console.log('Connection OK');
    }
  });
}

module.exports = {
  updateStats: updateStats,
  testDB: testDB

};
