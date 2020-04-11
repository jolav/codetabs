/* */

const os = require("os");
const server = os.hostname().toLowerCase();

const app = {
  'version': "0.7.0",
  'mode': 'production',
  'port': 3510,
  'instances': 4,
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

const alexa = {
  "dataFilePath": "./_data/alexa/top-1m.csv",
  "zipFile": "./_data/alexa/top-1m.csv.zip",
  "dataDir": "./_data/alexa",
  "dataFileURL": "https://s3.amazonaws.com/alexa-static/top-1m.csv.zip",
  "ranking": []
};

const loc = {
  "countLoc": "./_data/loc/./locLinux",
  "counter": 0,
  "order": "0",
};

const video2gif = {
  "form": [],
  "counter": 0,
  "order": "0",
  "processID": 0
};

const error = {
  "Error": "",
};

if (server === "work" || server === "littlepc") {
  app.mode = "dev";
}

module.exports = {
  app: app,
  alexa: alexa,
  loc: loc,
  video2gif: video2gif,
  error: error
};

/*
 complete ok
-r 10 frames/second
-ss 15 second in which the animation was started or min:seg
-ss 00:01:02.500 -t 00:01:03.250
-t 20 duration of the animation
you can use two different time unit formats: sexagesimal (HOURS:MM:SS.MILLISECONDS, as in 01:23:45.678), or in seconds
-vf scale=160:90 scale
ffmpeg -i video.mp4 -r 10 -ss 15 -t 20 -vf scale=160:90 out.gif -hide_banner

*/

