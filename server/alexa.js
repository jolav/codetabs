/* */

import express from "express";
import { mw } from "./middlewares.js";

import { createRequire } from "module";

const alexaRouter = express.Router();
alexaRouter.get('/v1/alexa', function (req, res, next) {
  if (!req.query.web) {
    const e = { "Error": "Domain is empty" };
    mw.sendResult(res, 400, e, false);
    return;
  }
  const [response, err] = alexa.position(req, res, next);
  try {
    if (err) {
      mw.sendResult(res, 400, err, false);
      return;
    }
    mw.sendResult(res, 200, response, false);
  } catch (err) {
    next(err);
  }
});

export {
  alexaRouter,
};

const alexa = {
  map: new Map(),
  position: function (req, res, next) {
    let o = {
      'domain': req.query.web,
      'rank': this.map.get(req.query.web) + 1
    };
    if (o.rank) {
      return [o, null];
    }
    if (o.domain.startsWith("www.")) {
      o.domain = o.domain.slice(4, o.domain.length);
    } else {
      o.domain = "www." + o.domain;
    }
    o.rank = this.map.get(o.domain); +1;
    if (o.rank) {
      return [o, null];
    }
    const e = { "Error": `${req.query.web} not in alexa top 1 million` };
    return [null, e];
  },
  init: function () {
    const require = createRequire(import.meta.url);
    let alexaList = require("./data/alexaList.json");
    for (let i = 0; i < alexaList.length; i++) {
      this.map.set(alexaList[i], i);
    }
    alexaList = null;
  },
};

alexa.init();
