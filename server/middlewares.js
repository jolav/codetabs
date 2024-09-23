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
      if (config.services.includes(service)) {
        res.locals.info.service = service;
      }
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
      const service = res.locals.info.service;
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
      if (response.ok) {
        const data = await response.json();
        return [data, null];
      } else {
        throw new Error(response.status + " " + response.statusText);
      }
    } catch (err) {
      return [null, err];
    }
  },
};

export {
  mw,
  aux,
};
