/* */
const lib = require(__dirname + '/lib.js');
const fs = require("fs");
const readline = require("readline");
const formidable = require('formidable');

async function repoLoc(req, res, folderID, cb) {
  const url = "https://github.com/";
  const repo = req.query.repo;
  const username = repo.split('/')[0];
  const reponame = repo.split('/')[1];
  const destroyTemporalFolder = `rm -r tmp/${folderID}`;
  const createTemporalFolder = `mkdir tmp/${folderID}`;
  //console.log('FOLDERID=>', folderID);
  //console.log(`Repo ${repo} ==> ${username} + ${reponame}`);
  
  const exists = await existsRepo(url + repo);
  if (!exists) {
    console.log('NO EXISTS');
    cb({ 'Error': (repo + " doesn't exist") }, 400);
    doCommand(destroyTemporalFolder);
    return;
  } 
  try {
    await doCommand(destroyTemporalFolder);
    await doCommand(createTemporalFolder);
  } catch (err) {
    console.log('FAIL =>', err); 
  } 

  // some repos like rethinkdb/rethinkdb uses -next instead of -master
  const downloadA = "https://codeload.github.com/" + repo + "/zip/master";
  const downloadB = "https://codeload.github.com/" + repo + "/zip/next";
  const where = __dirname + "/tmp/" + folderID + "/" + reponame + ".zip";
  //console.log('WHERE', where);
  let isDownloaded = false;
  const existsDownload = await existsRepo(downloadA);
  if (existsDownload) {
    isDownloaded = await doDownload(downloadA, where);
  } else {
    isDownloaded = await doDownload(downloadB, where);
  }
  if (!isDownloaded) {
    console.log("Can't download repo " + repo);
    cb({ 'Error': ("Can't download repo " + repo) }, 400);
    doCommand(destroyTemporalFolder);
    return; 
  }
  
  //unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
  const dest = __dirname + "/tmp/" + folderID;
  const unzip = `7z x ${where} -o${dest}/src`;
  const unzipError = await doCommand(unzip);
  if (unzipError !== null) {
    console.log("Error unziping " + repo);
    cb({ 'Error': ("Error unziping " + repo) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const countError = await doCountLoc(dest + "/src");
  const countloc = `./loc ${dest}/src`;
  const txtlocs = await doCommand(countloc);
  if (!txtlocs) {
    console.log("Error counting LOC in " + repo);
    cb({ 'Error': ("Error counting LOC in " + repo) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const errorTxt = await createTxt(dest+"/"+folderID+".txt", txtlocs);
  if (errorTxt !== null) {
    console.log("Error saving data txt " + repo);
    cb({ 'Error': ("Error saving data txt " + repo) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
  
  //const locs = await processTxt(__dirname + "/2.txt");
  const locs = await processTxt(dest + "/" + folderID + ".txt");
  if (!locs) {
    console.log("Error counting LOC txt in " + repo);
    cb({ 'Error': ("Error counting LOC txt in " + repo) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
  // console.log("AQUI",locs);
  //console.log('********** END **********');
  cb({locs }, 200); 
  doCommand(destroyTemporalFolder);
}
 
async function uploadLoc(req, res, folderID, cb) {
  //console.log('UPLOAD',folderID);
  const destroyTemporalFolder = `rm -r tmp/${folderID}`;
  const createTemporalFolder = `mkdir tmp/${folderID}`;
  try {
    await doCommand(destroyTemporalFolder);
    await doCommand(createTemporalFolder);
  } catch (err) {
    console.log('FAIL =>', err); 
  }  

  const fileUploaded = await uploadFile(req, folderID);
  const where = __dirname + "/tmp/" + folderID + "/" + fileUploaded;
  if (fileUploaded === null) {
    console.log("Error uploading file");
    cb({ 'Error': ("Error uploading file") }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
 
  //unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
  const dest = __dirname + "/tmp/" + folderID;
  const unzip = `7z x ${where} -o${dest}/src`;
  const unzipError = await doCommand(unzip);
  if (unzipError !== null) {
    console.log("Error unziping " + fileUploaded);
    cb({ 'Error': ("Error unziping " + fileUploaded) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const countError = await doCountLoc(dest + "/src");
  const countloc = `./loc ${dest}/src`;
  const txtlocs = await doCommand(countloc);
  if (!txtlocs) {
    console.log("Error counting LOC in " + fileUploaded);
    cb({ 'Error': ("Error counting LOC in " + fileUploaded) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  const errorTxt = await createTxt(dest+"/"+folderID+".txt", txtlocs);
  if (errorTxt !== null) {
    console.log("Error saving data txt " + fileUploaded);
    cb({ 'Error': ("Error saving data txt " + fileUploaded) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }

  //const locs = await processTxt(__dirname + "/2.txt");
  const locs = await processTxt(dest + "/" + folderID + ".txt");
  if (!locs) {
    console.log("Error counting LOC txt in " + fileUploaded);
    cb({ 'Error': ("Error counting LOC txt in " + fileUploaded) }, 400);
    doCommand(destroyTemporalFolder);
    return;
  }
  //console.log('********** END **********');
  cb({locs }, 200); 
  doCommand(destroyTemporalFolder);
}

function uploadFile(req,folderID) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const filename = files.inputFile.name;
      const oldpath = files.inputFile.path;
      const newpath = __dirname + "/tmp/" + folderID + "/" + filename;
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
    if (lineNumber > 3 && line[0]!== "-") {
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
      lang.files = parts[index+1];
      lang.lines = parts[index+2];
      lang.blanks = parts[index+3];
      lang.comments = parts[index+4];
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
    fs.writeFile(filePath, data, function(err) {
      if(err) {
        resolve(err);
      }  
      resolve(null);
    }); 
  });
} 
 
function doDownload(url, where) {
  return new Promise((resolve, reject) => {
    lib.downloadFile(url, where, function (isDone) {
      resolve(isDone);
    });
  });
}

function doCommand(command) {
  //console.log('Command ...', command);
  return new Promise((resolve, reject) => {
    lib.linuxCommand(command, function (err, res) {
      if (err) {
        //reject(res);
      }
      if (command.split(" ")[0] === "./loc") {
        resolve(res);
      } else {
        resolve(err);
      }
    });
  });
}

function existsRepo (urlchecked) {
  return new Promise((resolve, reject) => {
    lib.checkUrlExists(urlchecked, function (res) {
      resolve(res);
    });
  });
}

module.exports = {
  repoLoc: repoLoc,
  uploadLoc:uploadLoc
};

