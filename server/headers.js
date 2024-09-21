/* */

import express from "express";
import { aux } from "./../server/middlewares.js";

const headersRouter = express.Router();
headersRouter.get("/v1/headers", function (req, res, next) {
  if (req.query.domain) {
    headers.getHeaders(req, res, next);
  } else {
    const error = new Error("Domain is empty");
    error.code = 400;
    next(error);
    return;
  }
});

export {
  headersRouter,
};

const headers = {
  getHeaders: async function (req, res, next) {
    let url = req.query.domain;
    const headers = [];
    let count = 0; // avoid infinite loop
    const maxRedirections = 10;

    try {
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
      res.status(200).json(headers);
    } catch (err) {
      //console.error("Error => ", err);
      const error = new Error(err.message.trim());
      error.code = 400;
      next(error);
    }
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
