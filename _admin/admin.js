const admingeoip = (function () {
  'use strict';
  /* code here */

  const dataFile = './hits.json';

  function init () {
    console.log('Init Admin geoIP.tools');
    getAjaxData(dataFile, orderData);
  }

  function orderData (data) {
    let ips = Object.getOwnPropertyNames(data);
    let datas = Object.values(data);
    for (let i = 0; i < datas.length; i++) {
      datas[i].ip = ips[i];
    }
    datas.sort(function (a, b) {
      return new Date(b.lastTime) - new Date(a.lastTime);
    });
    showData(datas);
  }

  function showData (datas) {
    let res = `      
    <table class="table">
        <thead class="thead">
          <tr>
            <th class="ip">IP</th>
            <th class="times">Times</th>
            <th class="lastTime">Last Visit</th>
          </tr>
        </thead>
        <tbody class="tbody">`;

    for (let i = 0; i < datas.length;i++) {
      res +=
        `<tr class="tr">
              <td>${datas[i].ip}</td>
              <td>${datas[i].times}</td>
              <td>${datas[i].lastTime}</td>
            </tr>`;
    }
    res += `
        </tbody>
        </table>`;
    document.getElementById('hitsData').innerHTML = res;
  }

  function getAjaxData (urlData, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) { // 4 = "DONE"
        if (xhr.status === 200) { // 200 ="OK"
          callback(JSON.parse(xhr.responseText));
        } else {
          console.log('Error: ' + xhr.status);
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

window.addEventListener('load', admingeoip.init);
