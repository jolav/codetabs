/* */

const path = require('path');

const lib = require(path.join(__dirname, '../_lib/lib.js'));
const p = require(path.join(__dirname, '_private.js'));

const TABLE = p.mysql.table1;

const mysql = require('mysql');
const con = mysql.createConnection({
  host: p.mysql.host,
  user: p.mysql.user,
  password: p.mysql.password,
  database: p.mysql.db1
});

function getCleanUrl(req) {
  let quest = req.headers.origin || req.headers.host;
  if (quest.slice(0, 12) === 'https://www.') {
    quest = quest.slice(12);
  } else if (quest.slice(0, 11) === 'http://www.') {
    quest = quest.slice(11);
  } else if (quest.slice(0, 8) === 'https://') {
    quest = quest.slice(8);
  } else if (quest.slice(0, 7) === 'http://') {
    quest = quest.slice(7);
  }
  return (quest);
}

function updateStats(req, res, mode, next) {
  const ip = lib.getIP(req);
  if (ip) {
    // console.log(test , ' => SAVE')
    const time = new Date().toISOString().split('T')[0];
    let data = {
      'service': res.locals.service,
      'time': time
    };
    if (data.service) {
      const service = data.service.toUpperCase();
      const cleanUrl = getCleanUrl(req);
      const quest = req.originalUrl;
      const log = `${ip} ${service} ${cleanUrl} ${quest}`;
      console.log(log);
      if (mode === 'production') {
        insertHit(data);
      } else {
        console.log('FAKE INSERT HIT');
      }
    } else {
      console.log('Not Service from ', ip);
    }
  } else {
    console.log(ip, ' => DONT SAVE');
  }
  next();
}

function insertHit(data) {
  let sql = 'INSERT INTO ?? (time, alexa, loc, stars, proxy, headers, weather)';
  sql += ' VALUES (?, 0, 0, 0, 0, 0, 0)';
  sql += ` ON DUPLICATE KEY UPDATE ${data.service} = ${data.service} + 1;`;
  const inserts = [TABLE, data.time];
  sql = mysql.format(sql, inserts);
  con.query(sql, function (err, rows) {
    if (err) {
      console.log('Insert HIT error =>', err);
      // throw err
    } else {
      //console.log("Inserted ...", rows);
    }
  });
}

function testDB() {
  // console.log(con)
  con.connect(function (err) {
    if (err) {
      console.log('Error connecting to DB => ', err);
    } else {
      console.log('Connection to DB ...... OK');
    }
  });
}

module.exports = {
  updateStats: updateStats,
  testDB: testDB
};

