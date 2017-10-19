/* global bl */

const tetris = (function () {
  const urlBase = 'https://api.codetabs.com/games/tetris/';
  // const urlBase = 'http://localhost:3000/games/tetris/'
  let canvas = document.getElementById('lienzo');
  let ctx = canvas.getContext('2d');
  let canvas2 = document.getElementById('lienzo2');
  let ctx2 = canvas2.getContext('2d');
  const ppp = 20;
  const cols = 10;
  const rows = 22;
  let fps = 1;
  let onoff;
  let game = false;
  let running = false;
  let score = 0;
  let board = [];
  let nextBoard = [];
  let actual;
  let next;
  let pos = {}; // rotation fig, x, y
  let dropNewPiece = false;
  let endGame = false;
  let loop;
  canvas.width = cols * ppp;
  canvas.height = rows * ppp;
  canvas2.width = 4 * ppp;
  canvas2.height = 4 * ppp;
  let completed = 0;
  let used = 0;
  let highscore = [];
  let player = '___';

  function init () {
    console.log('Init Tetris', canvas.width, canvas.height);
    addActionEvents();
    document.getElementById('lienzo').style.backgroundColor = '#cfcfcf';
    window.addEventListener('keydown', actionKey);
    initBoard();
    drawBorderMyCanvas();
    drawBoard();
    getHighScores();
  }

  function start () {
    game = true;
    completed = 0;
    used = 0;
    endGame = false;
    running = true;
    score = 0;
    actual = getRandomNumber(1, 7);
    pos = { rot: 0, x: 3, y: 0 };
    next = getRandomNumber(1, 7);
    initBoard();
    drawNextBoard();
    clearInterval(loop);
    gameLoop();
  }

  function gameLoop () {
    loop = setInterval(function () {
      if (running) {
        update('down');
        render();
      }
    }, 1000 / fps);
  }

  function update (dir) {
    if (canPieceMove(dir)) {
      erasePiece();
      movePiece(dir);
      drawBoard();
      drawPiece();
    } else if (endGame) {
      clearInterval(loop);
      pause();
      if (score > highscore[4].score) {
        player = prompt('New record, enter player name (3 letters');
        player = player.substring(0, 3);
        console.log(player);
        checkHighScore();
      }
      if (confirm('GAME OVER \n Play Again?')) {
        pause();
        start();
      } else {
        setControlsStatus();
      }
    } else if (dropNewPiece) {
      addPieceToBoard();
      pause();
      checkCompleteRows();
      render();
      pause();
      actual = next;
      pos = { rot: 0, x: 3, y: 0 };
      next = getRandomNumber(1, 7);
      drawNextBoard();
      dropNewPiece = false;
    }
    if (fps < 10) {
      fps = Math.floor(score / 1000) + 1;
      document.getElementById('level').innerText = fps;
      clearInterval(loop);
      gameLoop();
    }
  }

  function checkHighScore () {
    var pos = 4;
    for (let i = highscore.length - 1; i >= 0; i--) {
      if (score > highscore[i].score) {
        pos = i;
      }
    }
    for (let i = highscore.length - 1; i >= pos; i--) {
      if (i !== pos) {
        highscore[i].player = highscore[i - 1].player;
        highscore[i].score = highscore[i - 1].score;
        highscore[i].text = highscore[i - 1].text;
      } else {
        highscore[i].player = player;
        highscore[i].score = score;
        highscore[i].text = player + ' ' + score;
      }
    }
    let urlData = urlBase + `hs`; // ?player=${player}&score=${score}`
    let dataJSON = [];
    for (let i = 0; i < highscore.length; i++) {
      var aux = {};
      aux.player = highscore[i].player;
      aux.score = highscore[i].score;
      dataJSON.push(aux);
    }
    let param = JSON.stringify(dataJSON);
    makeAjaxRequest(urlData, 'POST', getHighScores, param);
  }

  function getHighScores () {
    let urlData = urlBase + 'hs/';
    makeAjaxRequest(urlData, 'GET', setHighScores, null);
  }

  function setHighScores (data) {
    for (let i = 0; i < data.length; i++) {
      let aux = {};
      aux.player = data[i].player;
      aux.score = data[i].score;
      aux.text = data[i].player + ' ' + data[i].score;
      highscore[i] = aux;
      document.getElementById('hs' + (i + 1)).innerText = highscore[i].text;
    }
  }

  function pause () {
    if (game) {
      if (running) {
        window.removeEventListener('keydown', actionKey);
      } else {
        window.addEventListener('keydown', actionKey);
      }
      running = !running;
    }
  }

  function canPieceMove (dir) {
    let down = 0;
    let side = 0;
    if (dir === 'down') { down = 1; }
    if (dir === 'left') { side = -1; }
    if (dir === 'right') { side = 1; }
    for (let y = pos.y; y < pos.y + 4; y++) { // rows
      for (let x = pos.x; x < pos.x + 4; x++) { // cols
        if (bl.figs[actual][pos.rot][y - pos.y][x - pos.x] !== 0) {
          if (y + down >= rows) { // end of board
            // console.log('Board end')
            dropNewPiece = true;
            return false;
          }
          if (x + side < 0 || x + side >= cols) { // avoid board[] undefined
            // console.log('Dont get out of the margins')
            return false;
          }
          if (board[y + down][x] !== 0) { // exists other piece down
            // console.log('exists other piece down')
            dropNewPiece = true;
            return false;
          }
          if (board[y][x + side] !== 0) { // exists other piece aside
            // console.log('exists other piece aside')
            return false;
          }
        }
      }
    }
    return true;
  }

  function movePiece (dir) {
    let down = 0;
    let side = 0;
    if (dir === 'down') { down = 1; }
    if (dir === 'left') { side = -1; }
    if (dir === 'right') { side = 1; }
    for (let y = pos.y; y < pos.y + 4; y++) { // rows
      for (let x = pos.x; x < pos.x + 4; x++) { // cols
        if (bl.figs[actual][pos.rot][y - pos.y][x - pos.x] !== 0) {
          if (x + side >= 0 && x + side < cols) { // avoid board[] undefined
            if (board[y][x] !== 0) {
              board[y + down][x + side] = board[y][x]; // fall one pos
              board[y][x] = 0; // delete old pos
            }
          }
        }
      }
    }
    if (dir === 'down') { pos.y++; }
    if (dir === 'left') { pos.x--; }
    if (dir === 'right') { pos.x++; }
  }

  function addPieceToBoard () {
    for (let y = pos.y; y < pos.y + 4; y++) {
      for (let x = pos.x; x < pos.x + 4; x++) {
        if (bl.figs[actual][pos.rot][y - pos.y][x - pos.x] !== 0) {
          if (y < rows && x >= 0 && x < cols) { // NEW
            if (board[y][x] !== 0) {
              endGame = true;
              return;
            } else {
              board[y][x] = actual;
            }
          } // NEW
        }
      }
    }
  }

  function rotatePiece () {
    erasePiece();
    let aux = pos.rot;
    if (pos.rot === 3) {
      pos.rot = 0;
    } else {
      pos.rot++;
    }
    if (!canPieceMove()) {
      pos.rot = aux;
    }
    drawPiece();
  }

  function checkCompleteRows () {
    let rowsToDelete = [];
    let isComplete;
    for (let y = 0; y < rows; y++) {
      isComplete = true;
      for (let x = 0; x < cols; x++) {
        if (board[y][x] === 0) {
          isComplete = false;
        }
      }
      if (isComplete) {
        rowsToDelete.push(y);
      }
    }
    score += rowsToDelete.length * 100;
    if (rowsToDelete.length > 0) {
      deleteRow(rowsToDelete[rowsToDelete.length - 1]);
      completed++;
      checkCompleteRows();
    }
  }

  function deleteRow (rowToDelete) {
    for (let y = rowToDelete; y > 0; y--) {
      board[y] = board[y - 1];
    }
    board[0] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // this fix bug
  }

  function render () {
    document.getElementById('lienzo').style.backgroundColor = '#cfcfcf';
    score += fps;
    document.getElementById('score').innerText = score;
    document.getElementById('completed').innerText = completed;
    drawBoard();
    erasePiece();
    drawPiece();
  }

  function erasePiece () {
    for (let y = pos.y; y < pos.y + 4; y++) {
      for (let x = pos.x; x < pos.x + 4; x++) {
        if (bl.figs[actual][pos.rot][y - pos.y][x - pos.x] !== 0) {
          ctx.beginPath();
          ctx.fillStyle = bl.colors[board[y][x]];
          ctx.fillRect((x * ppp) + 1, (y * ppp) + 1, ppp - 1, ppp - 1);
        }
      }
    }
  }

  function drawPiece () {
    for (let y = pos.y; y < pos.y + 4; y++) {
      for (let x = pos.x; x < pos.x + 4; x++) {
        if (bl.figs[actual][pos.rot][y - pos.y][x - pos.x] !== 0) {
          ctx.beginPath();
          ctx.fillStyle = bl.colors[actual];
          ctx.fillRect((x * ppp) + 1, (y * ppp) + 1, ppp - 1, ppp - 1);
        }
      }
    }
  }

  function drawBoard () {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        ctx.fillStyle = bl.colors[board[y][x]];
        ctx.fillRect((x * ppp) + 1, (y * ppp) + 1, ppp - 1, ppp - 1);
      }
    }
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, 0);
    ctx.strokeStyle = '#cfcfcf';
    ctx.stroke();
  }

  function drawNextBoard () {
    // board
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        ctx2.beginPath();
        ctx2.fillStyle = '#eee'; // bl.colors[0]
        ctx2.fillRect((x * ppp) + 1, (y * ppp) + 1, ppp - 1, ppp - 1);
      }
    }
    // piece
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (bl.figs[next][0][y][x] !== 0) {
          ctx2.beginPath();
          ctx2.fillStyle = bl.colors[next];
          ctx2.fillRect((x * ppp) + 1, (y * ppp) + 1, ppp - 1, ppp - 1);
        }
      }
    }
  }

  function drawBorderMyCanvas () {
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cfcfcf';
    ctx.stroke();
  }

  function setControlsStatus () {
    if (game) {
      if (running) {
        document.getElementById('0').style.backgroundColor = 'burlywood';
        document.getElementById('1').style.backgroundColor = '#fafafa';
        document.getElementById('0').innerText = 'Playing';
        document.getElementById('1').innerText = 'Pause';
      } else if (endGame) {
        document.getElementById('0').style.backgroundColor = '#fafafa';
        document.getElementById('1').style.backgroundColor = '#fafafa';
        document.getElementById('0').innerText = 'Play';
        document.getElementById('1').innerText = 'Pause';
      } else {
        document.getElementById('0').style.backgroundColor = '#fafafa';
        document.getElementById('1').style.backgroundColor = 'burlywood';
        document.getElementById('0').innerText = 'Play';
        document.getElementById('1').innerText = 'Resume';
      }
    }
  }

  function addActionEvents () {
    const aux = document.getElementsByClassName('action');
    for (let i = 0; i < aux.length; i++) {
      aux[i].addEventListener('click', actionsMenu);
    }
  // window.addEventListener('keydown', actionKey)
  }

  function actionKey (e) {
    let key = String.fromCharCode(e.keyCode);
    // console.log(key)
    switch (key) {
      case '&':
      case 'W':
      case 'w':
        rotatePiece();
        // console.log('Rotate...')
        break;
      case "'":
      case 'D':
      case 'd':
        update('right');
        // console.log('Right...')
        break;
      case '(':
      case 'X':
      case 'x':
        update('down');
        // console.log('Down...')
        break;
      case '%':
      case 'A':
      case 'a':
        update('left');
        // console.log('Left...')
        break;
      default:
    // console.log(e.target.id, ' -- Not recognized event')
    }
  }

  function actionsMenu (e) {
    switch (parseInt(e.target.id)) {
      case 0:
        start();
        break;
      case 1:
        pause();
        break;
      default:
    // console.log(e.target.id, ' -- Not recognized event')
    }
    setControlsStatus();
  }

  function initBoard () { // [22][10] 
    for (let y = 0; y < rows; y++) {
      board[y] = [];
      for (let x = 0; x < cols; x++) {
        board[y][x] = 0; // getRandomNumber(1, bl.colors.length)
      }
    }
  // console.log('create board...', board.length, board[0].length)
  }

  function getRandomNumber (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function makeAjaxRequest (url, action, callback, params) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          if (action === 'GET') {
            callback(JSON.parse(xhr.responseText));
          } else {
            callback();
          }
        } else {
          console.log('Error: ' + xhr.status);
        }
      }
    };
    xhr.open(action, url);
    if (action === 'GET') {
      xhr.send();
    } else if (action !== 'GET') {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(params);
    }
  }

  return {
    init: init
  };
}());

window.addEventListener('load', tetris.init);
