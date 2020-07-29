/* */

const os = require("os");
const server = os.hostname().toLowerCase();

const app = {
  'version': "0.7.6",
  'mode': 'production',
  'port': 3510,
  'instances': 2,
  'localURL': 'http://localhost:3000',
  'realURL': 'https://api.codetabs.com',
  'services': [
    "alexa",
    "headers",
    "loc",
    "proxy",
    "stars",
    "weather",
    "video2gif",
    "geolocation"]
};

const loc = {
  "countLoc": "./_data/loc/./locLinux",
  "counter": 0,
  "order": "0",
  "maxSize": 500,
};

const error = {
  "Error": "",
};

if (server === "work" || server === "littlepc") {
  app.mode = "dev";
}

module.exports = {
  app: app,
  loc: loc,
  error: error
};

