/* */

import express from "express";
import helmet from 'helmet';
import bodyParser from "body-parser";

import { config } from "./_config.js";
import { mw, aux } from "./middlewares.js";
import { randomRouter } from "./random.js";
import { headersRouter } from "./headers.js";
import { weatherRouter } from "./weather.js";
import { alexaRouter } from "./alexa.js";

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

app.use(function notFound(req, res, next) {
  mw.sendResult(res, 400, { "msg": aux.badRequest }, false);
});

app.use(function errorHandler(err, req, res, next) {
  console.error(err.message);
  mw.sendResult(res, 500, { "msg": err.message }, false);
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
