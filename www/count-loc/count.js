/* global Chart */

const loc = (function () {
  'use strict';
  /* code here */

  let urlBase = 'https://api.codetabs.com/v1/loc/';
  if (window.mode === "dev") {
    urlBase = 'http://localhost:3000/v1/loc/';
  }

  const ctx = document.getElementById('myPie');
  let myChart;
  let repo = '';

  function init() {
    console.log('Init Count Loc');
    document.getElementById('addRepo').addEventListener('click', addRepo);
    document.getElementById('upload').addEventListener('click', upload);
    document.getElementsByClassName('pie')[0].style.display = 'none';
    hideLoader();
  }

  function addRepo(e) {
    repo = document.getElementById('repoName').value;
    if (repo === '') {
      alert('user/repo cannot be empty');
      return;
    }
    showLoader();
    let urlData = urlBase + '?github=' + repo;
    console.log(urlData);
    // console.log('1', myChart)
    if (myChart !== undefined) {
      myChart.destroy();
      document.getElementById("totalResume").innerHTML = "";
    }
    getAjaxData(urlData, prepareData);
  }

  function upload(e) {
    showLoader();
    e.preventDefault();
    let urlData = urlBase;
    console.log(urlData);
    // console.log('2', myChart)
    if (myChart !== undefined) {
      myChart.destroy();
      document.getElementById("totalResume").innerHTML = "";
    }
    let formData = new FormData();
    let inputFile = document.getElementById('inputFile');
    if (inputFile.files.length === 0) {
      alert('file input cannot be empty');
      return;
    }
    formData.append('inputFile', inputFile.files[0]);
    console.log('REQUEST => ', urlData, prepareData, formData);
    makeAjaxRequest(urlData, 'POST', prepareData, formData);
  }

  function hideLoader() {
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    document.getElementsByClassName('loader')[0].style.display = 'none';
  }

  function showLoader() {
    document.getElementsByClassName('loader')[0].style.visibility = 'visible';
    document.getElementsByClassName('loader')[0].style.display = 'block';
  }

  function showError(dataError) {
    hideLoader();
    if (dataError.Error) {
      alert(dataError.Error);
    } else {
      alert('An error has ocurred while fetching data');
    }
  }

  function limitExceeded() {
    hideLoader();
    alert('Rate limit exceeded, wait a few seconds');
  }

  function prepareData(dataRepo) {
    //console.log('RECEIVE => ', dataRepo);
    if (dataRepo.length === 1) {
      if (dataRepo[0].linesOfCode === 0 || dataRepo[0].linesOfCode === undefined) {
        alert('Not a valid file');
        return;
      }
    }
    hideLoader();
    let linesOfCode = [];
    let labels = [];
    for (let i = 0; i < dataRepo.length; i++) {
      if (dataRepo[i].language !== 'Total') {
        linesOfCode.push(dataRepo[i].linesOfCode);
        labels.push(dataRepo[i].language);
      }
    }
    drawChart(linesOfCode, labels);
    showTotal(dataRepo);
  }

  function drawChart(loc, langs) {
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
        },
        onClick: function (e) {
          const element = this.getElementAtEvent(e);
          //console.log(element[0]);
          if (element[0]) {
            const order = element[0]._index;
            let line = this.active[0]._chart.config.data.datasets[0];
            line.backgroundColor[order] = getRandomColor();
            //const newColor = line.backgroundColor[order];
            //this.config.options.tooltips.legendColorBackground = newColor;
            //this.config.options.tooltips.callbacks.legendColor(this, myChart);
            //this.config.options.tooltips.updateLegendColor(newColor);
            myChart.update();
          }
        },
        tooltips: {
          /*callbacks: {
            legendColor: function (tooltipItem, chart) {
              const helper = chart.config.options.tooltips.legendColorBackground;
              return {
                legendColorBackground: helper,
              };
            },
          },*/
          /*updateLegendColor: function (color) {
            return {
              legendColorBackground: color,
            };
          },*/
          displayColors: false,
          //legendColorBackground: "blue",
        }
      },
    });
  }

  function showTotal(dataRepo) {
    const data = dataRepo[dataRepo.length - 1];
    let res = `
        <table class="table">
          <thead class="thead">
            <tr>
              <th class="Files">Files</th>
              <th class="Lines">Lines</th>
              <th class="Blanks">Blanks</th>
              <th class="Comments">Comments</th>
              <th class="Lines of Code">Lines of Code</th>
            </tr>
          </thead>
          <tbody class="tbody">
            <tr class="tr">
                <td>${data.files}</td>
                <td>${data.lines}</td>
                <td>${data.blanks}</td>
                <td>${data.comments}</td>
                <td>${data.linesOfCode}</td>
            </tr>
            </tbody>
        </table>
    `;
    document.getElementById("totalResume").innerHTML = res;

  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getAjaxData(urlData, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          callback(JSON.parse(xhr.responseText));
        } else if (xhr.status === 429) { // 200 ="OK"
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

  function makeAjaxRequest(url, action, callback, params) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          const data = JSON.parse(xhr.responseText);
          callback(data);
        } else if (xhr.status === 429) {
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
      //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
      xhr.send(params);
    }
  }

  return {
    init: init
  };
}());

window.addEventListener('load', loc.init);
