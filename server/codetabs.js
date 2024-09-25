/* */

import express from "express";
import helmet from 'helmet';
import bodyParser from "body-parser";

import { config } from "./_config.js";
import { mw, aux, AppError } from "./middlewares.js";
import { randomRouter } from "./random.js";
import { headersRouter } from "./headers.js";
import { weatherRouter } from "./weather.js";
import { alexaRouter } from "./alexa.js";
import { geolocationRouter } from "./geolocation.js";

const app = express();
app.use(helmet());
app.disable('x-powered-by');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(mw.manager.bind(mw)); // avoid this undefined inside mw

// routes
app.get("/v1/version", function (req, res) {
  res.status(200).json({ version: config.version });
});

app.use(randomRouter);
app.use(headersRouter);
app.use(weatherRouter);
app.use(alexaRouter);
app.use(geolocationRouter);

app.use(function notFound(req, res, next) {
  next(new AppError(404, "Route Not Found"));
});

app.use(function errorHandler(err, req, res, next) {
  if (!err.isOperational) {
    console.error("Unexpected Error:", err.stack || err);
  }
  const status = err.status || 500;
  let message = "Internal Server Error";
  if (err.isOperational) {
    message = err.message;
  }
  mw.sendResult(res, status, { "msg": message }, false);
});

app.listen(config.port, function () {
  console.log(
    '\n*****************************************************\n',
    'process.env.pm.id => ', process.env.pm_id + "\n",
    'process.pid => ', process.pid + "\n",
    'Server', config.name.toUpperCase(),
    "version", config.version,
    "running on port", config.port, "\n" +
  '*****************************************************'
  );
});
