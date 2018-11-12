/* global */

const alexa = (function () {
  /* code here */

  let baseUrl = 'https://api.codetabs.com/v1/alexa';
  if (window.mode === "dev") {
    baseUrl = 'http://localhost:3000/v1/alexa';
  }

  function init() {
    console.log('Init Alexa');
    document.getElementById('getDomain').addEventListener('click', getDomain);
  }

  function getDomain(e) {
    let domain = document.getElementById('domainName').value;
    if (domain === '') {
      alert('domain cannot be empty');
      return;
    }
    if (!isValidHostname(domain)) {
      alert('domain is not a valid hostname');
      return;
    }
    let urlData = baseUrl + '?web=' + domain;
    console.log('Request ......', urlData);
    getAjaxData(urlData, showData);
  }

  function showData(data) {
    // console.log(data)
    document.getElementById('rankResult2').innerText = '';
    document.getElementById('rankResult').innerText = data.rank;
  }

  function showError(dataError) {
    // console.log(dataError)
    if (dataError.Error) {
      // alert(dataError.error)
      document.getElementById('rankResult').innerText = '';
      document.getElementById('rankResult2').innerText = dataError.Error;
    } else {
      alert('An error has ocurred while fetching data');
    }
  }

  function limitExceeded() {
    alert('Rate limit exceeded, wait a few seconds');
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
          // Error parsed from backend myError
          // console.log(xhr.responseText)
          showError(JSON.parse(xhr.responseText));
        }
      }
    };
    xhr.open('GET', urlData); // add false to synchronous request
    xhr.send();
  }

  function isValidHostname(hostname) {
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

window.addEventListener('load', alexa.init);

