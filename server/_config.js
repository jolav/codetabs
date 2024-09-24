/* */

import { _config } from "./_private.js";
import os from "os";

//import packageJSON from './package.json' with { type: 'json' };
import { readFileSync } from "fs";
const packageJSON = JSON.parse(readFileSync("./package.json"));

const config = {
  "version": packageJSON.version,
  "name": packageJSON.name,
  "mode": "dev",
  "port": 3000,
  "portOLD": 3000,
  "services": [
    "random",
    "headers",
    "weather",
    "alexa",
    "geolocation",
  ],
  "banned": [],
  "weather": {}
};

function checkMode() {
  const serverName = os.hostname().toLowerCase();

  if (!_config.devHosts.includes(serverName)) {
    config.mode = _config.mode;
    config.port = _config.port;
    config.portOLD = _config.portOLD;
  }
  config.banned = _config.banned;
  config.weather = _config.weather;
}

checkMode();
if (config.mode === "dev") {
  console.log(config);
}

export { config };
