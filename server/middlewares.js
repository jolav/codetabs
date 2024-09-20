/* */

import { config } from "./_config.js";

const mw = {
  manager: function (req, res, next) {

    // BANNED LIST CHECK

    let msg = undefined;
    const params = req.path.split("/");
    try {
      decodeURIComponent(req.path);
    } catch (e) {
      msg = "Bad request : " + req.path + ' is not a valid url';
    }
    if (!msg && params[1] !== "v1") {
      msg = aux.badRequest;
    }
    const service = params[2];
    if (!msg && !config.services.includes(service)) {
      msg = aux.badRequest;

    }
    if (msg) {
      const error = new Error(msg);
      error.code = 400;
      res.locals.service = "BAD_REQUEST";
      this.logger(req, res);
      next(error);
      return;
    }

    res.locals.service = service;
    this.logger(req, res);
    hits.send(req, res);
    next();
  },
  logger: function (req, res) {
    console.log(
      aux.getIP(req),
      aux.getHost(req),
      res.locals.service.toUpperCase(),
      req.originalUrl.split("/v1/" + res.locals.service)[1] || req.originalUrl,
      //req.originalUrl, // delete if previous one is ok
    );
  },
  notFound: function (req, res, next) {
    const text = "404 NOT FOUND => " + req.method + " " + req.path;
    console.error(text);
    res.status(404).json({ text: text });
  },
  errorHandler: function (err, req, res, next) {
    if (config.mode === "dev") {
      //console.error("Error Stack =>\n", err.stack);
    }
    console.error(err.code, err.message);
    res.status(err.code || 500).json({ Error: err.message });
  },
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
      const targetUrl = "http://localhost:3970/addHit/" + res.locals.service;
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
      '???'
    );
  },
  randomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
};

export {
  mw,
  aux,
};
