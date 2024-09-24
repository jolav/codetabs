/* */

import express from "express";
import { aux, mw } from "./middlewares.js";

const headersRouter = express.Router();
headersRouter.get("/v1/headers", async function (req, res, next) {
  if (!req.query.domain) {
    mw.sendResult(res, 400, { "msg": aux.badRequest }, false);
    return;
  }
  const response = await headers.getHeaders(req);
  try {
    if (!response) {
      mw.sendResult(res, 400, { "msg": aux.badRequest }, false);
      return;
    }
    mw.sendResult(res, 200, response, false);
  } catch (err) {
    next(err);
  }
});

export {
  headersRouter,
};

const headers = {
  getHeaders: async function (req) {
    let url = req.query.domain;
    const headers = [];
    let count = 0; // avoid infinite loop
    const maxRedirections = 10;

    while (count < maxRedirections) {
      const header = await aux.runCommand(`curl -fsSI ${url}`);
      headers.push(this.parseHeadString(header));
      if (header.indexOf("Location") === -1 &&
        header.indexOf("location") === -1) {
        break;
      }
      if (header.indexOf("Location") !== -1) {
        url = header.split("Location: ")[1].split("\n")[0].trim();
      } else {
        url = header.split("location: ")[1].split("\n")[0].trim();
      }
      count++;
    }
    return headers;
  },
  parseHeadString: function (str) {
    const res = {};
    str = str.split("\r\n");
    // protocol and status code is the first line
    const name = str[0].split(" ")[0];
    const value = str[0].split(" ")[1];
    let last;
    res[name] = value;
    for (let line = 1; line < str.length; line++) {
      const name = str[line].split(": ")[0];
      const value = str[line].split(": ")[1];
      if (name === "Location") {
        last = value;
      } else {
        res[name] = value;
      }
    }
    // last line is location if exist
    if (last) {
      res["Location"] = last;
    }
    return res;
  },
};
