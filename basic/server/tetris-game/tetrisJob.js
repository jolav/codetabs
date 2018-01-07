const lib = require(__dirname + '/../lib.js');

const filePath = __dirname + '/tetris.json';

const init = [
  {
    'player': 'cpu',
    'score': 9999
  },
  {
    'player': 'cpu',
    'score': 8888
  },
  {
    'player': 'cpu',
    'score': 7777
  },
  {
    'player': 'cpu',
    'score': 6666
  },
  {
    'player': 'cpu',
    'score': 5555
  }
];

function getHighScore (req, res) {
  lib.loadJSONfile(filePath, 0, (data) => {
    res.status(200).send(data);
  });
}

function postHighScore (req, res) {
  let score = req.body;
  for (let i in score) {
    if (score[i].player.length > 2) {
      score[i].player = score[i].player.slice(0, 3);
    }
  }
  lib.writeJSONtoFile(filePath, score, function () {
    res.end();
  });
  res.end();
}

/*

curl -d '@tetris2.json' -H "Content-Type: application/json" -X POST http://localhost:3000/tetris/hs

*/

module.exports = {
  getHighScore: getHighScore,
  postHighScore: postHighScore
};
