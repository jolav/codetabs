/* */

const express = require('express');
const app = express();

const path = require('path');
const graphqlRequest = require('graphql-request');

const c = require(path.join(__dirname, '_config.js'));
const lib = require(path.join(__dirname, '/_lib/lib.js'));
let tokens = require(path.join(__dirname, '_private.js'));
tokens = tokens.tokens;

app.use(function (req, res, next) {
  next();
});

// localhost:3000/v1/stars?repo=codetabs.com => {quest: 'codetabs.com'}
app.get('/*', function (req, res) {
  //console.log('==>', req.query.repo)
  if (req.query.repo) {
    getRepoHistory(req, res, function (response, status) {
      if (response.data) {
        response = response.data;
      }
      lib.sendResult(req, res, response, status);
    });
  } else {
    const msg = `Repo is empty`;
    lib.sendError(res, msg, 400);
  }
});

app.get('/*', function (req, res) {
  c.error.Error = "Bad request : " + req.path;
  res.status(400).json(c.error);
});

let points = [];
let stars = [];
const today = new Date().toISOString().split('T')[0];

async function getRepoHistory(req, res, cb) {
  stars = [];
  points = [];
  const repo = req.query.repo;
  const username = repo.split('/')[0];
  const reponame = repo.split('/')[1];
  if (username === "" || reponame === "" || !reponame) {
    cb({ 'Error': ("Incorrect user/repo") }, 400);
    return;
  }

  const totalStars = await getTotalStars(repo);
  // console.log('TOTALSTARS => ', totalStars);
  if (totalStars === -1) { // repo not exists
    // console.log(repo ,' not exists');
    cb({ 'Error': (repo + " doesn't exist") }, 400);
    return;
  } else if (totalStars === 0) {
    // console.log(repo ,' has no stars');
    cb({ data: [] }, 200);
    return;
  }

  const rate = await getApiLimit();
  const limit = rate.resources.core.remaining;
  // console.log('LIMITS ==> ', limit);

  if (limit < 402) {
    cb({ 'Error': "GitHub API Limit Exceeded, Please wait ..." }, 400);
    return;
  }

  const links = await doFirstRequest(repo, totalStars);
  //cleanInputJSONFromGithub(fs.readFileSync("__test2.json"));

  if (links) {
    await doLinksRequests(links);
  }

  // console.log('STARS = >', stars.length);
  await sortStarsByDate();
  await convertStarsToPoints();
  // console.log('LAST', points[points.length-1]);
  if (totalStars > 40000) { // draw points unreachable through api limit
    if (points[points.length - 1].x === today) { // fcc exception ???
      points[points.length - 1].y = totalStars;
    } else {
      const point = {
        'x': today,
        'y': totalStars
      };
      // console.log('NEW LAST', points[points.length - 1]);
      // console.log('ADDING LAST SPECIAL', point);
      points.push(point);
    }
  }
  //console.log('POINTS = >', points.length);

  cb({ data: points }, 200);
  // console.log('************* END ***********');
}

function getApiLimit() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: "/rate_limit",
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + tokens[lib.getRandomNumber(0, 9)],
        "User-Agent": "github stars repos",
        'Accept': '/application/vnd.github.v3.star+json',
      }
    };
    lib.makeRequest(options, null, function (err, data, headers) {
      if (err) {
        console.log('Error => ', err);
        reject(-1);
      }
      resolve(data);
    });
  });
}

function sortStarsByDate() {
  return new Promise((resolve, reject) => {
    stars.sort(function (a, b) {
      return new Date(a.starredAt) - new Date(b.starredAt);
    });
    resolve();
  });
}

function doLinksRequests(links) {
  return new Promise((resolve, reject) => {
    let responsePool = [];
    let calls = links.length;
    //console.log('CALLS => ', calls);
    for (let i = 0; i < calls; i++) {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: links[i].slice(22),
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + tokens[lib.getRandomNumber(0, 9)],
          "User-Agent": "github stars repos",
          'Accept': '/application/vnd.github.v3.star+json',
        }
      };
      lib.makeRequest(options, null, function (err, response, headers) {
        if (err) {
          console.log('Err requesting === ', i, err);
          calls--;
        }
        calls--;
        cleanInputJSONFromGithub(response);
        responsePool.push(response);
        if (calls <= 0) {
          // all calls done  
          resolve();
        }
      });
    }
  });
}

function doFirstRequest(repo, totalStars) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: "/repos/" + repo + '/stargazers?per_page=100',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + tokens[lib.getRandomNumber(0, 9)],
        "User-Agent": "github stars repos",
        'Accept': '/application/vnd.github.v3.star+json',
      }
    };
    lib.makeRequest(options, null, function (err, data, headers) {
      if (err) {
        console.log('Error => ', err);
        reject(-1);
      }
      //console.log('HEADERS => ', headers.link);
      cleanInputJSONFromGithub(data);
      if (totalStars > 100) {
        resolve(parseHeadersLink(headers.link, totalStars));
      } else {
        resolve();
      }
    });
  });
}

function parseHeadersLink(link, totalStars) {
  let links = [];
  let begin = "https://api.github.com/repositories/";//00000000 8 digit number ?
  let end = "/stargazers?per_page=100&page=";
  let pages = Math.ceil((totalStars - 100) / 100) + 1;
  if (pages > 400) pages = 400;
  //console.log('PAGES => ', pages,link);
  const number = link.slice(37).split("/")[0];
  //console.log('number = ', number);
  for (let page = 2; page <= pages; page++) {
    let link = begin + number + end + page;
    links.push(link);
  }
  return links;
}

function getTotalStars(repo) {
  return new Promise((resolve, reject) => {
    const username = repo.split('/')[0];
    const reponame = repo.split('/')[1];
    const graphqlQuery = (`
    query {
      repository(owner:"${username}", name:"${reponame}") {
        stargazers{
          totalCount
        }
      }
    }`);
    const target = "https://api.github.com/graphql";
    const client = new graphqlRequest.GraphQLClient(target, {
      headers: {
        'Authorization': 'Bearer ' + tokens[lib.getRandomNumber(0, 9)],
      },
    });
    client.request(graphqlQuery)
      .then(data => {
        resolve(data.repository.stargazers.totalCount);
        return Promise.reject();
      })
      .catch(err => {
        //console.log('Error => ', err);
        resolve(-1);
      });
  });
}
function convertStarsToPoints() {
  //console.log("CONVERT STARS TO POINTS");
  let point = {
    'x': stars[0].starredAt, // when
    'y': 0                    // qty
  };
  for (let i = 1; i < stars.length; i++) {
    if (stars[i].starredAt !== point.x) {
      point.y = i;
      points.push(point);
      point = {
        'x': stars[i].starredAt,
        'y': i
      };
    }
  }
  // Now Add the last entrie and actual day
  if (today !== stars[stars.length - 1].starredAt) {
    point.y++;
    points.push(point);
  }
  point = {
    'x': today,
    'y': stars.length
  };
  points.push(point);
}

function cleanInputJSONFromGithub(data) {
  //console.log('CLEAN INPUT JSON');
  for (let i = 0; i < data.length; i++) {
    let star = {
      starredAt: new Date(data[i].starred_at).toISOString().split('T')[0]
    };
    stars.push(star);
  }
}

module.exports = app;
