/* */

const express = require('express');
const app = express();

const exec = require('child_process').exec;
const fs = require("fs");
const path = require('path');
const formidable = require('formidable');
const bodyparser = require('body-parser');

const c = require(path.join(__dirname, '_config.js'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));

app.post('/*', function (req, res) {
  c.video2gif.counter++;
  const folder = path.join(__dirname, `tmp/${c.video2gif.counter}`);
  doVideo2GifRequest(req, res, folder);
  return;
});

app.get('/*', function (req, res) {
  res.status(400).json("Bad request : " + req.path);
});

async function doVideo2GifRequest(req, res, folder) {
  const destroyTemporalFolder = `rm -r ${folder}`;
  const createTemporalFolder = `mkdir ${folder}`;
  try {
    await doCommand(destroyTemporalFolder);
  } catch (err) {
    //console.error('ERROR destroying folder ' + folder);
  }

  try {
    await doCommand(createTemporalFolder);
  } catch (err) {
    const msg = 'ERROR destroying or creating new folder ' + folder + " " + err;
    sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const fileUploaded = await uploadFile(req, folder);
  if (fileUploaded === null || fileUploaded === undefined) {
    const msg = "Error uploading file";
    sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const inputPath = `${folder}/${fileUploaded}`;
  const outputPath = `${folder}/${c.video2gif.counter}.gif`;

  const p = getParameters(res);
  const convertCommand = createCommand(p, inputPath, outputPath);
  //console.log(convertCommand);

  try {
    await doCommand(convertCommand);
  } catch (err) {
    const msg = 'Error converting file ' + outputPath;
    sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  // open gif to grab data
  const bitmap = fs.readFileSync(outputPath);
  const base64str = Buffer.from(bitmap).toString('base64');

  // send gif data
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': base64str.length
  });
  res.end(base64str);

  try {
    await doCommand(destroyTemporalFolder);
  } catch (err) {
    console.error('ERROR destroying folder ' + folder);
  }
}

function createCommand(p, inputPath, outputPath) {
  // ffmpeg -i videout.mp4 -r 10 -ss 15 -t 20 -vf scale=160:90 out.gif -hide_banner
  let comm = `ffmpeg -i ${inputPath}`;
  if (p.fps !== -1) {
    comm += ` -r ${p.fps}`;
  }
  if (p.start !== -1) {
    comm += ` -ss ${p.start}`;
  }
  if (p.dur !== -1) {
    comm += ` -t ${p.dur}`;
  }
  if (p.scale !== "") {
    comm += ` -vf scale=${p.scale}`;
  }
  comm += ` ${outputPath}`;// --hide_banner`;
  return comm;
}

function getParameters(res) {
  let inn = {};
  let out = {};
  inn.fps = c.video2gif.form.fps;
  inn.start = c.video2gif.form.start;
  inn.dur = c.video2gif.form.duration;
  inn.scale = c.video2gif.form.scale;
  if (inn.fps === "" || !inn.fps) {
    out.fps = 5;
  } else {
    let fps = parseFloat(inn.fps);
    if (fps < 1 || fps > 10) {
      out.fps = 5;
    } else {
      out.fps = inn.fps;
    }
  }
  if (inn.start === "") {
    out.start = -1;
  } else {
    out.start = inn.start;
  }
  if (inn.dur === "") {
    out.dur = -1;
  } else {
    out.dur = inn.dur;
  }
  if (inn.scale === "" || !inn.scale) {
    out.scale = "320:160";
  } else {
    out.scale = getScale(inn.scale);
  }
  //console.log('OUT=>', out);
  return out;
}

function getScale(old) {
  let values = old.split(":");
  if (values.length !== 2) {
    return "320:160";
  }
  let a = parseInt(values[0], 10);
  let b = parseInt(values[1], 10);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return "320:160";
  }
  if (a >= b && a > 480) {
    if (b === -1) {
      return "480:-1";
    }
    const aux = rescale(a, b);
    a = aux[0];
    b = aux[1];
  }
  if (b > a && b > 480) {
    if (a === -1) {
      return "-1:480";
    }
    const aux = rescale(b, a);
    b = aux[0];
    a = aux[1];
  }
  return a + ":" + b;
}

function rescale(big, small) {
  const big2 = 480;
  let small2 = 480 * small / big;
  return [big2, small2];
}

function uploadFile(req, folder) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      c.video2gif.form.fps = fields.fps;
      c.video2gif.form.start = fields.start;
      c.video2gif.form.duration = fields.duration;
      c.video2gif.form.scale = fields.scale;
      const filename = files.inputFile.name;
      const oldpath = files.inputFile.path;
      const newpath = folder + "/" + filename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
          console.error('Error uploading file => ', err);
          resolve();
        }
        resolve(filename);
      });
    });
  });
}

function doCommand(command) {
  //console.log('Command ...', command);
  return new Promise((resolve, reject) => {
    linuxCommand(command, function (err, res) {
      if (err) {
        //console.error('Error doCommand => ', command);
        //console.error(err);
        //reject(res);
      }
      resolve(err);
    });
  });
}

function sendError(res, msg, status) {
  let e = {
    "Error": msg,
  };
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(e, null, 3));
}

function linuxCommand(command, cb) {
  exec(command, function (err, stdout, stderr) {
    if (err) {
      //console.error('Err => ', err);
      cb(err, stderr);
    }
    if (stderr) {
      cb(err, stderr);
      return;
    }
    cb(err, stdout);
  });
}

module.exports = app;
