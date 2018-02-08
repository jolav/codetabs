/* global Chart */

const stars = (function () {
  'use strict';
  /* code here */

  const urlBase = 'https://api.codetabs.com/github-stars/';
  // const urlBase = 'http://localhost:3000/'
  const ctx = document.getElementById('myChart');
  const pointsPerLine = 70;
  let myChart;
  let dataSets = [];
  let repo = '';

  function init () {
    console.log('Init GitHub Star History');
    document.getElementById('addRepo').addEventListener('click', addRepo);
    document.getElementById('clearAll').addEventListener('click', clearAll);
    document.getElementById('addRepo2').addEventListener('click', addRepo);
    document.getElementById('clearAll2').addEventListener('click', clearAll);
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
  }

  function addRepo (e) {
    repo = document.getElementById('repoName').value;
    if (repo === '') {
      alert('user/repo cannot be empty');
      return;
    }
    for (let i = 0; i < dataSets.length; i++) {
      if (dataSets[i].label === repo) {
        alert(`${repo} already shown`);
        return;
      }
    }
    document.getElementsByClassName('loader')[0].style.visibility = 'visible';
    let urlData = urlBase + 'get?repo=' + repo;
    console.log(urlData);
    getAjaxData(urlData, showData);
  }

  function clearAll () {
    dataSets = [];
    myChart.destroy();
  }

  function cutData (dataRepo) {
    let hop = Math.ceil(dataRepo.length / 100);
    let data = [];
    console.log('POINTS', dataRepo.length, 'HOP', hop);
    for (let i = 0; i < dataRepo.length; i++) {
      if (i === 0) { // ensure first star
        data.push(dataRepo[i]);
      }
      if (i % hop === 0) {
        data.push(dataRepo[i]);
      }
      if (i === dataRepo.length - 1) { // ensure last star
        data.push(dataRepo[i]);
      }
    }
    return data;
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

  function showData (dataRepo) {
    console.log('Receive .......... => ', dataRepo);
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    let newDataRepo = {};
    newDataRepo.label = repo;
    newDataRepo.data = cutData(dataRepo);
    newDataRepo.fill = false;
    newDataRepo.backgroundColor = getRandomColor();
    newDataRepo.borderColor = newDataRepo.backgroundColor;
    newDataRepo.borderWidth = 1;
    newDataRepo.pointRadius = 2;
    newDataRepo.pointHitRadius = 5;
    dataSets.push(newDataRepo);
    if (dataSets.length > 1) {
      myChart.update();
      return;
    }
    drawHistory();
  }

  function drawHistory () {
    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: dataSets
      },
      options: {
        tooltips: {
        },
        responsive: true,
        title: {
          display: false,
          text: 'GitHub Star History'
        },
        elements: {
          line: {
            tension: 0, // disables bezier curves
          }
        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        scales: {
          xAxes: [{
            type: 'time',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Stars'
            }
          }]
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
            console.log(xhr.status + ' ' + xhr.responseText);
            showError(JSON.parse(xhr.responseText));
          }
        }
      }
    };
    xhr.open('GET', urlData); // add false to synchronous request
    xhr.send();
  }

  return {
    init: init
  };
}());

window.addEventListener('load', stars.init);
