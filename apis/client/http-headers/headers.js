/* global */

const stars = (function () {
  'use strict';
  /* code here */

  // const baseUrl = 'http://localhost:3000/http-headers/'
  const baseUrl = 'https://api.codetabs.com/http-headers/';

  function init () {
    console.log('Init HTTP Headers');
    document.getElementById('addUrl').addEventListener('click', getHeaders);
  }

  function getHeaders (e) {
    let url = document.getElementById('urlName').value;
    if (url === '') {
      alert('Url cannot be empty');
      return;
    }
    if (!isValidHostname(url)) {
      alert('Not a valid url');
      return;
    }
    let urlData = baseUrl + 'get/' + url;
    console.log('Requesting ...', urlData);
    getAjaxData(urlData, showData);
  }

  function showData (data) {
    // console.log('DATA => ', data)
    let res = '';
    for (let i = 0; i < data.length; i++) {
      res += `
      <table class="table">
          <thead class="thead">
            <tr>
              <th class="header">Header</th>
              <th class="value">Value</th>
            </tr>
          </thead>
          <tbody class="tbody">`;
      for (let prop in data[i]) {
        res +=
          `<tr class="tr">
        <td>${prop}</td>
        <td>${data[i][prop]}</td>
        </tr>`;
      }
      res += `
      </tbody>`;
    }
    res += `</table>`;
    document.getElementById('result').innerHTML = res;
  }

  function showError (dataError) {
    console.log('SHOW ERROR');
    if (dataError.error) {
      // alert(dataError.error)
      document.getElementById('result').innerText = dataError.error;
    } else {
      alert('An error has ocurred while fetching data');
    }
  }

  function limitExceeded () {
    alert('Rate limit exceeded, wait a few seconds');
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
          // Error parsed from backend myError
          // console.log(xhr.responseText)
          showError(JSON.parse(xhr.responseText));
        }
      }
    };
    xhr.open('GET', urlData); // add false to synchronous request
    xhr.send();
  }

  function isValidHostname (hostname) {
    hostname = hostname.replace('https://', '');
    hostname = hostname.replace('http://', '');
    let condition = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$/;
    if (condition.test(hostname)) {
      return true;
    }
    return false;
  }

  return {
    init: init
  };
}());

window.addEventListener('load', stars.init);
