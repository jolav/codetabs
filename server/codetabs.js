/* */

import express from "express";
import helmet from 'helmet';
import bodyParser from "body-parser";

import { config } from "./_config.js";
import { mw } from "./middlewares.js";
import { randomRouter } from "./random.js";
import { headersRouter } from "./headers.js";

const app = express();
app.use(helmet());
app.disable('x-powered-by');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

console.log("process.env.pm.id => ", process.env.pm_id);
console.log("process.pid => ", process.pid);
app.use(mw.manager.bind(mw)); // avoid this undefined inside mw

// routes
app.get("/v1/version", function (req, res) {
  res.status(200).json({ version: config.version });
});
app.use(randomRouter);
app.use(headersRouter);

app.use(mw.notFound);
app.use(mw.errorHandler);

app.listen(config.port, function () {
  console.log(
    'Server', config.name.toUpperCase(), "version", config.version,
    "running on port", config.port
  );
});
