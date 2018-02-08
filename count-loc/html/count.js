/*jshint node: true */
/* global Chart */

const stars = (function () {
  'use strict';
  /* code here */

  // const urlBase = 'http://localhost:3000/'
  const urlBase = 'https://api.codetabs.com/count-loc/';

  const ctx = document.getElementById('myPie');
  const pointsPerLine = 70;
  let myChart;
  let repo = '';

  function init () {
    console.log('Init Count Loc');
    document.getElementById('addRepo').addEventListener('click', addRepo);
    document.getElementById('upload').addEventListener('click', upload);
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    document.getElementsByClassName('pie')[0].style.display = 'none';
  }

  function addRepo (e) {
    repo = document.getElementById('repoName').value;
    if (repo === '') {
      alert('user/repo cannot be empty');
      return;
    }
    document.getElementsByClassName('loader')[0].style.visibility = 'visible';
    let urlData = urlBase + 'get?repo=' + repo;
    // console.log(urlData)
    // console.log('1', myChart)
    if (myChart !== undefined) {
      myChart.destroy();
    }
    getAjaxData(urlData, prepareData);
  }

  function upload (e) {
    e.preventDefault();
    let urlData = urlBase + 'upload';
    // console.log(urlData)
    // console.log('2', myChart)
    if (myChart !== undefined) {
      myChart.destroy();
    }
    let formData = new FormData();
    let inputFile = document.getElementById('inputFile');
    if (inputFile.files.length === 0) {
      alert('file input cannot be empty');
      return;
    }
    formData.append('inputFile', inputFile.files[0]);
    makeAjaxRequest(urlData, 'POST', prepareData, formData);
  }

  function showError (dataError) {
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    if (dataError.Error) {
      alert(dataError.Error);
    } else {
      alert('An error has ocurred while fetching data');
    }
  }

  function limitExceeded () {
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    alert('Rate limit exceeded, wait a few seconds');
  }

  function prepareData (dataRepo) {
    // console.log('RECEIVE => ', dataRepo.length)
    if (dataRepo.length === 1) {
      if (dataRepo[0].linesOfCode === 0 || dataRepo[0].linesOfCode === undefined) {
        alert('Not a valid file');
        return;
      }
    }
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    let linesOfCode = [];
    let labels = [];
    for (let i = 0; i < dataRepo.length; i++) {
      if (dataRepo[i].language !== 'Total') {
        linesOfCode.push(dataRepo[i].linesOfCode);
        labels.push(dataRepo[i].language);
      }
    }
    drawChart(linesOfCode, labels);
  }

  function drawChart (loc, langs) {
    document.getElementsByClassName('pie')[0].style.display = 'block';
    let colors = [];
    let data = [];
    for (let i = 0; i < loc.length; i++) {
      colors.push(getRandomColor());
    }
    myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        datasets: [{
          data: loc,
          backgroundColor: colors
        }],
        labels: langs
      },
      options: {
        legend: {
          labels: {
            fontSize: 12,
            padding: 3,
            boxWidth: 10
          }
        }
      }
    });
  }

  function getRandomColor () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getAjaxData (urlData, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          callback(JSON.parse(xhr.responseText));
        } else if (xhr.status === 503) { // 200 ="OK"
          limitExceeded();
        } else {
          if (xhr.status === 0) {
            // Error usually about fetching github API
            showError(xhr.responseText);
          } else {
            // Error parsed from backend myError
            console.log(xhr.responseText);
            showError(JSON.parse(xhr.responseText));
          }
        }
      }
    };
    xhr.open('GET', urlData); // add false to synchronous request
    xhr.send();
  }

  function makeAjaxRequest (url, action, callback, params) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          const data = JSON.parse(xhr.responseText);
          callback(data);
        } else if (xhr.status === 503) {
          limitExceeded();
        } else {
          console.log('AINSS Error : ' + xhr.status + xhr.response);
          showError(JSON.parse(xhr.responseText));
        }
      }
    };
    xhr.open(action, url);
    if (action === 'GET') {
      xhr.send();
    } else if (action !== 'GET') {
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
      xhr.send(params);
    }
  }

  return {
    init: init
  };
}());

window.addEventListener('load', stars.init);
