/* */

const express = require('express');
const app = express();

const path = require('path');
const fs = require("fs");
const readline = require("readline");
const formidable = require('formidable');

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));

let tokens = require(path.join(__dirname, '_private.js'));
tokens = tokens.tokens;

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/loc?github=jolav/codetabs => {github: 'jolav/codetabs'}
app.get('/*', function (req, res) {
  //console.log('GET ==>', req.query.github);
  c.loc.counter++;
  const folder = `tmp/loc/${process.env.pm_id}-${c.loc.counter}`;
  if (req.query.github) {
    const g = req.query.github.split("/");
    if (!g[0] || g[0] === undefined || !g[1] || g[1] === undefined) {
      const msg = `user or repo is empty`;
      lib.sendError(res, msg, 400);
      return;
    }
    //repoLoc(req, res, folder);
    repoLocClone(req, res, folder);
  } else {
    const msg = `user/repo is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.post('/*', function (req, res) {
  //console.log('UPLOAD');
  c.loc.counter++;
  const folder = `tmp/loc/${process.env.pm_id}-${c.loc.counter}`;
  uploadLoc(req, res, folder);
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

async function repoLoc(req, res, folder) {
  const url = "https://github.com/";
  const repo = req.query.github;
  const reponame = repo.split('/')[1];
  const destroyTemporalFolder = `rm -r ${folder}`;
  const createTemporalFolder = `mkdir ${folder}`;
  const zipFilePath = __dirname + "/" + folder + "/" + reponame + ".zip";
  const dest = __dirname + "/" + folder;
  const unzip = `7z x ${zipFilePath} -o${dest}/src`;
  const countloc = `${c.loc.countLoc} ${dest}/src`;

  const exists = await existsRepo(url + repo);
  if (!exists) {
    //console.log('NO EXISTS');
    const msg = `repo ${repo} doesn't exist`;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
  try {
    await doCommand(destroyTemporalFolder);
    await doCommand(createTemporalFolder);
  } catch (err) {
    console.error('ERROR destroying or creating new folder ', folder, err);
    return;
  }

  // some repos like rethinkdb/rethinkdb uses -next instead of -master
  const downloadA = "https://codeload.github.com/" + repo + "/zip/master";
  const downloadB = "https://codeload.github.com/" + repo + "/zip/next";
  let isDownloaded = false;
  const existsDownload = await existsRepo(downloadA);
  if (existsDownload) {
    isDownloaded = await doDownload(downloadA, zipFilePath);
  } else {
    isDownloaded = await doDownload(downloadB, zipFilePath);
  }

  if (!isDownloaded) {
    const msg = "Can't download repo " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const unzipError = await doCommand(unzip);
  if (unzipError !== null) {
    const msg = "Error unziping " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const txtlocs = await doCommand(countloc);
  if (!txtlocs) {
    const msg = "Error counting LOC in " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const errorTxt = await createTxt(dest + "/" + c.loc.order + ".txt", txtlocs);
  if (errorTxt !== null) {
    const msg = "Error saving data txt " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const locs = await processTxt(__dirname + "/2.txt");
  const locs = await processTxt(dest + "/" + c.loc.order + ".txt");
  if (!locs) {
    const msg = "Error counting LOC txt in " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //console.log('********** END **********');
  lib.sendResult(req, res, locs, 200);
  doCommand(destroyTemporalFolder);
}

// git clone --depth=1 https://github.com/user/repo
async function repoLocClone(req, res, folder) {
  //console.log('clone repo');
  const url = "https://github.com/";
  const repo = req.query.github;
  const destroyTemporalFolder = `rm -r ${folder}`;
  const createTemporalFolder = `mkdir ${folder}`;
  const dest = __dirname + "/" + folder;
  const countloc = `${c.loc.countLoc} ${dest}/`;

  const exists = await existsRepo(url + repo);
  if (!exists) {
    //console.log('NO EXISTS');
    const msg = `repo ${repo} doesn't exist`;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  // limit repo size to XMB
  let size = 0;
  try {
    const options = {
      timeout: 3000,
      host: 'api.github.com',
      port: 443,
      path: '/repos/' + repo,
      method: 'GET',
      headers: {
        "User-Agent": "jolav/codetabs",
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + tokens[lib.getRandomNumber(0, 9)],
        'Accept-Charset': 'utf-8'
      }
    };
    const repoData = await lib.makeRequestAsync(options, undefined);
    size = Math.floor(repoData.size / 1000);
  } catch (err) {
    console.error(err);
    const msg = `Internal error`;
    lib.sendError(res, msg, 503);
    doCommand(destroyTemporalFolder);
    return;
  }
  if (size > c.loc.maxSize) {
    const msg = `repo ${repo} too big (>${c.loc.maxSize}MB) = ${size} MB`;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  try {
    await doCommand(destroyTemporalFolder);
    await doCommand(createTemporalFolder);
  } catch (err) {
    console.error('ERROR destroying or creating new folder ', folder, err);
    return;
  }

  // some repos like rethinkdb/rethinkdb uses -next instead of -master
  const cloneRepoURL = "https://github.com/" + repo;
  const doClone = `git clone --depth=1 ${cloneRepoURL} ${dest}/`;
  //console.log(doClone);
  try {
    await doCommand(doClone);
  } catch (err) {
    console.error("ERROR git clone =>", err);
    const msg = "Can't clone repo " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const txtlocs = await doCommand(countloc);
  if (!txtlocs) {
    const msg = "Error counting LOC in " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const errorTxt = await createTxt(dest + "/" + c.loc.order + ".txt", txtlocs);
  if (errorTxt !== null) {
    const msg = "Error saving data txt " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const locs = await processTxt(__dirname + "/2.txt");
  const locs = await processTxt(dest + "/" + c.loc.order + ".txt");
  if (!locs) {
    const msg = "Error counting LOC txt in " + repo;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //console.log('********** END **********');
  lib.sendResult(req, res, locs, 200);
  doCommand(destroyTemporalFolder);
}

async function uploadLoc(req, res, folder) {
  //console.log('UPLOAD',c.loc.orderInt);
  const destroyTemporalFolder = `rm -r ${folder}`;
  const createTemporalFolder = `mkdir ${folder}`;
  const dest = __dirname + "/" + folder;
  const countloc = `${c.loc.countLoc} ${dest}/src`;

  try {
    await doCommand(destroyTemporalFolder);
    await doCommand(createTemporalFolder);
  } catch (err) {
    console.error('ERROR destroying or creating new folder ', folder, err);
  }

  const fileUploaded = await uploadFile(req, folder);
  const zipFilePath = folder + "/" + fileUploaded;
  if (fileUploaded === null) {
    const msg = "Error uploading file";
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
  const unzip = `7z x ${zipFilePath} -o${dest}/src`;
  const unzipError = await doCommand(unzip);
  if (unzipError !== null) {
    const msg = "Error unziping " + fileUploaded;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const txtlocs = await doCommand(countloc);
  if (!txtlocs) {
    const msg = "Error counting LOC in " + fileUploaded;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const errorTxt = await createTxt(dest + "/" + c.loc.orderInt + ".txt", txtlocs);
  if (errorTxt !== null) {
    const msg = "Error saving data txt " + fileUploaded;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const locs = await processTxt(__dirname + "/2.txt");
  const locs = await processTxt(dest + "/" + c.loc.orderInt + ".txt");
  if (!locs) {
    const msg = "Error counting LOC txt in " + fileUploaded;
    lib.sendError(res, msg, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
  //console.log('********** END **********');
  lib.sendResult(req, res, locs, 200);
  doCommand(destroyTemporalFolder);
}

function uploadFile(req, folder) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const filename = files.inputFile.name;
      const oldpath = files.inputFile.path;
      const newpath = folder + "/" + filename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
          console.log('Error => ', err);
          resolve();
        }
        resolve(filename);
      });
    });
  });
}

function processTxt(textFile) {
  return new Promise((resolve, reject) => {
    countLocFromTxt(textFile, function (err, locs) {
      if (err) {
        resolve(err);
      }
      resolve(locs);
    });
  });
}

function countLocFromTxt(textFile, cb) {
  const lineReader = readline.createInterface({
    input: fs.createReadStream(textFile)
  });
  const languages = [];
  let lang = {
    'language': "language",
    'files': "files",
    'lines': "lines",
    'blanks': "blanks",
    'comments': "comments",
    'linesOfCode': "linesOfCode"
  };
  let lineNumber = 1;
  lineReader.on('line', function (line) {
    if (lineNumber > 3 && line[0] !== "-") {
      let parts = line.trim().replace(/\s\s+/g, ' ').split(" ");
      //console.log(parts);
      let index = 0;
      lang = {};
      if (parts.length > 6) { // two word language name 
        lang.language = parts[0] + " " + parts[1];
        index++;
      } else {
        lang.language = parts[0];
      }
      lang.files = parts[index + 1];
      lang.lines = parts[index + 2];
      lang.blanks = parts[index + 3];
      lang.comments = parts[index + 4];
      lang.linesOfCode = parts[index + 5];
      //console.log('lang',lang);
      languages.push(lang);
    }
    lineNumber++;
  });
  lineReader.on('close', function () {
    cb(languages);
  });
}

function createTxt(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, function (err) {
      if (err) {
        resolve(err);
      }
      resolve(null);
    });
  });
}

function doDownload(url, zipFilePath) {
  return new Promise((resolve, reject) => {
    lib.downloadFile(url, zipFilePath, function (isDone) {
      resolve(isDone);
    });
  });
}

function doCommand(command) {
  //console.log('Command ...', command);
  return new Promise((resolve, reject) => {
    lib.linuxCommand(command, function (err, res) {
      if (err) {
        //console.log('Error doCommand => ', command);
        //console.log(err);
        //reject(res);
      }
      if (command.split(" ")[0] === c.loc.countLoc) {
        resolve(res);
      } else {
        resolve(err);
      }
    });
  });
}

function existsRepo(urlchecked) {
  return new Promise((resolve, reject) => {
    lib.checkUrlExists(urlchecked, function (res) {
      resolve(res);
    });
  });
}

module.exports = app;
