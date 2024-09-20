/* */

import express from "express";
import { aux } from "./middlewares.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const surnames = require("./data/surnames.json");

const randomRouter = express.Router();
randomRouter.get("/v1/random/name", function (req, res) {
  const response = random.name();
  //console.log(response);
  res.status(200).json(response);
});
randomRouter.get("/v1/random/integer", function (req, res, next) {
  const response = random.integer(req);
  if (!response) {
    const error = new Error(aux.badRequest);
    error.code = 400;
    next(error);
    return;
  }
  res.status(200).json(response);
});
randomRouter.get("/v1/random/list", function (req, res, next) {
  const response = random.list(req);
  if (!response) {
    const error = new Error(aux.badRequest);
    error.code = 400;
    next(error);
    return;
  }
  res.status(200).json(response);
});

export {
  randomRouter
};

const random = {
  response: {
    quest: "",
    data: [],
  },
  clean: function () {
    this.response.quest = "";
    this.response.data = [];
  },
  name: function name() {
    this.clean();
    this.response.quest = "Random Name";
    this.response.data.push(surnames[aux.randomInt(0, surnames.length - 1)]);
    return this.response;
  },
  integer: function (req, res, next) {
    const min = parseInt(req.query.min);
    const max = parseInt(req.query.max);
    const times = parseInt(req.query.times) || 1;
    //console.log(min, max, times);

    if (min == null || min < 0) { //this allow min to be 0
      return undefined;
    }
    if (!max || min > max || max > 10000000000) {
      return undefined;
    }
    if (times > 10000) {
      return undefined;
    }

    this.clean();
    if (times === 1) {
      this.response.quest = `Random Integer between ${min}-${max}`;
    } else {
      this.response.quest = `${times} Random Integers between ${min}-${max}`;
    }
    for (let i = 0; i < times; i++) {
      this.response.data.push(aux.randomInt(min, max));
    }
    return this.response;
  },
  list: function (req) {
    const elements = parseInt(req.query.len);
    //console.log( elements);

    if (!elements || elements < 2 || elements > 10000) {
      return undefined;
    }

    this.clean();
    this.response.quest = `Randomized order list with ${elements} elements`;
    let element = 0;
    while (element < elements) {
      const number = aux.randomInt(1, elements);
      if (!this.response.data.includes(number)) {
        this.response.data.push(number);
        element++;
      }
    }
    return this.response;
  }
};
