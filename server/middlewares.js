/* */

import { error, log } from "console";
import { config } from "./_config.js";
import { exec } from "child_process";

const mw = {
  manager: function (req, res, next) {
    res.locals.info = {
      ip: aux.getIP(req),
      host: aux.getHost(req),
      service: "",
      resource: "",
    };

    // BANNED LIST CHECK

    let msg = undefined;
    try {
      decodeURIComponent(req.path);
    } catch (e) { // not a valid url
      msg = aux.badRequest;
    }
    const params = req.path.split("/");
    if (!msg && params[1] !== "v1") { // check version is ok
      msg = aux.badRequest;
    }
    const service = params[2];
    if (!msg && !config.services.includes(service)) {
      msg = aux.badRequest;
    }
    if (msg) {
      res.locals.info.resource = req.originalUrl;
      this.sendResult(res, 400, { "msg": msg }, false);
      return;
    }
    res.locals.info.service = service;
    res.locals.info.resource =
      req.originalUrl.split("/v1/" + res.locals.info.service)[1];
    hits.send(req, res);
    next();
  },
  logger: function (res) {
    //console.log(JSON.stringify(res.locals.info));
    console.log(
      res.locals.info.ip,
      res.locals.info.host,
      res.locals.info.service.toUpperCase(),
      res.locals.info.resource,
    );
  },
  sendResult: function (res, status, data, pretty) {
    if (pretty) {
      res.header('Content-Type', 'application/json');
      res.status(status).send(JSON.stringify(data, null, 2));
      return;
    }
    res.status(status).json(data);
    if (status === 400) {
      res.locals.info.service += "-BAD_REQUEST";
    }
    if (status === 500) {
      res.locals.info.service += "-ERROR";
    }
    this.logger(res);
  }
};

const hits = {
  send: async function (req, res) {
    const options = {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Charset': 'utf-8',
      }
    };
    try {
      let service = res.locals.info.service;
      if (service === "geolocation") {
        service = "geoip";
      }
      const targetUrl = "http://localhost:3970/addHit/" + service;
      const response = await fetch(targetUrl, options);
      if (!response.ok) {
        throw new Error(response.status + " " + response.statusText);
      }
    } catch (error) {
      console.error(`3-Error sending data => ${error}`);
    }
  },
};

const aux = {
  badRequest:
    "Bad request: invalid format. Please read our docs at https://codetabs.com",
  getIP: function (req) {
    return (
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress
    ).split(',')[0];
  },
  getHost: function (req) {
    return (
      req.get('Host') ||
      req.get('Origin') ||
      req.get('Referer') ||
      '?Host?'
    );
  },
  randomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  runCommand: function (command) {
    return new Promise(function (resolve, reject) {
      exec(command, function (err, stdout, stderr) {
        if (err) {
          //console.error(`Error executing "${command}":`, err);
          reject(new Error(`Execution failed: ${stderr || stdout}`));
          return;
        }
        if (stderr) {
          //console.warn(`Warning executing "${command}":`, stderr);
          resolve(stderr);
          return;
        }
        resolve(stdout);
      });
    });
  },
  fetchData: async function (url) {
    const options = {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Accept-Charset': 'utf-8',
      },
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new AppError(
          500, `HTTP Error: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      return [data, null];
    } catch (err) {
      if (err.name === "AbortError") {
        return [null, new AppError(500, "Request timed out")];
      }
      return [null, err];
    }
  },
  isValidIP: function (ip) {
    const ip4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ip6 = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
    if (ip4.test(ip)) {
      return true;
    }
    if (ip6.test(ip)) {
      return true;
    }
    return false;
  },
  isValidHostname: function (hostname) {
    if (!hostname || hostname.length > 255) {
      return false;
    }
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(hostname)) {
      return false;  // is a IP
    }
    const condition = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$/;
    const parts = hostname.split('.');
    for (let part of parts) {
      if (!condition.test(part)) {
        return false;
      }
    }
    return true;
  }
};

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, AppError);
  }
}

export {
  mw,
  aux,
  AppError,
};
