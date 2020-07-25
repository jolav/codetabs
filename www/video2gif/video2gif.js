/* global Chart */

const video2gif = (function () {
  'use strict';
  /* code here */

  console.log(window.mode);

  let baseUrl = 'https://api.codetabs.com/v1/video2gif/';
  if (window.mode === "dev") {
    baseUrl = 'http://localhost:3000/v1/video2gif/';
  }

  function init() {
    console.log('Init Count video2gif');
    document.getElementById('upload').addEventListener('click', upload);
    // document.getElementsByClassName('pie')[0].style.display = 'none'
    hideLoader();
  }

  function upload(e) {
    var gifs = document.getElementsByClassName('gif')[0];
    console.log(gifs);
    if (gifs || gifs !== null) {
      while (gifs.firstChild) {
        gifs.removeChild(gifs.firstChild);
      }
    }
    showLoader();
    e.preventDefault();
    let urlData = baseUrl;
    let formData = new FormData();
    let inputFile = document.getElementById('inputFile');
    if (inputFile.files.length === 0) {
      alert('file input cannot be empty');
      return;
    }
    let fps = document.getElementById('fps').value;
    let start = document.getElementById('start').value;
    let duration = document.getElementById('duration').value;
    let scale = document.getElementById('scale').value;
    formData.append('inputFile', inputFile.files[0]);
    formData.append('fps', fps);
    formData.append('start', start);
    formData.append('duration', duration);
    formData.append('scale', scale);
    console.log('REQUEST => ', urlData, showGif, formData);
    makeAjaxRequest(urlData, 'POST', showGif, formData);
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

  function showGif(dataGif) {
    var i = new Image();
    i.onload = function () {
      hideLoader();
      var img = document.createElement('img');
      img.src = i.src;
      img.width = i.width;
      img.height = i.height;
      document.getElementsByClassName('gif')[0].appendChild(img);
      const d = document.createElement('a');
      d.download = 'your.gif';
      d.href = i.src;
      document.getElementsByClassName('gif')[0].appendChild(d);
      d.click();
    };
    i.src = 'data:image/gif;base64,' + /* btoa*/dataGif;
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
          callback(xhr.response);
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
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
      xhr.send(params);
    }
  }

  return {
    init: init
  };
}());

window.addEventListener('load', video2gif.init);
