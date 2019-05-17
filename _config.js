/* */

const app = {
  'version': "0.5.3",
  'mode': 'production',
  //'mode': 'dev',
  'port': 3510,
  'localURL': 'http://localhost:3000',
  'realURL': 'https://api.codetabs.com',
  'services':
    ["alexa", "headers", "loc", "proxy", "stars", "weather"]
};

const alexa = {
  "dataFilePath": "./_data/alexa/top-1m.csv",
  "zipFile": "./_data/alexa/top-1m.csv.zip",
  "dataDir": "./_data/alexa",
  "dataFileURL": "https://s3.amazonaws.com/alexa-static/top-1m.csv.zip",
  "processID": 5, //undefined, // choose one in production
  "ranking": []
};

const loc = {
  "countLoc": "./_data/loc/./locLinux",
  "counter": 0,
  "order": "0",
};

const error = {
  "Error": "",
};

module.exports = {
  app: app,
  alexa: alexa,
  loc: loc,
  error: error
};

