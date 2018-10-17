/* global L value1 value2 value3 value4 value5 value6 value7 */
const geoip = (function () {
  'use strict';
  /* code here */

  // let geoipUrl = 'http://localhost:3750/json'
  let geoipUrl = 'https://api.codetabs.com/v1/geoip/json';
  let q = '';
  let data = {};

  function init () {
    q = getURLParameter('q');
    if (q === '' || q === null || q === undefined) {
      getAjaxData(geoipUrl, drawMap);
    } else {
      // console.log(geoipUrl + '?q=' + q)
      getAjaxData(geoipUrl + '?q=' + q, drawMap);
    }
  }

  function drawMap (data) {
    console.log(data);
    if (q === '' || q === null || q === undefined) {
      document.getElementById('q').value = data.ip;
    } else {
      document.getElementById('q').value = q;
    }
    value1.innerText = data.ip;
    value2.innerText = data.city;
    value3.innerText = data.region_name + ' ' + data.region_code;
    value4.innerText = data.country_name + ' ' + data.country_code;
    value5.innerText = data.zip_code;
    value6.innerText = data.time_zone;
    value7.innerText = data.latitude + ' , ' + data.longitude;

    let map = L.map('mapid').setView([data.latitude, data.longitude], 4);
    let popupText = `<b>You Are Here</b><br>IP : ${data.ip}`;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([data.latitude, data.longitude])
      .addTo(map)
      .bindPopup(popupText)
      .openPopup();
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

  function getURLParameter (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  }

  return {
    init: init
  };
}());

window.addEventListener('load', geoip.init);
