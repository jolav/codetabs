/* */

const head = `
<!-- Begin Head -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Free Online Services. Github star history. Count Lines of Code. CORS proxy server. IP GeoLocation. Convert video to gif. HTTP Headers. Api weather temp. Alexa ranking." />

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/_public/icons/ct/ct24r.png">
<!-- END-->
`;

const footer = `
<!-- Begin Footer-->
<style>
  .footer {
    font-family: "arial", sans-serif;
    text-align: center;
    font-size: 0.95em;
    line-height: 1.2em;
  }

  html {
    height: 100%;
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  body {
    position: relative;
    margin: 0 auto;
    min-height: 98%;
    padding-bottom: 6rem;
  }

  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 1rem;
    text-align: center;
  }

  @font-face {
    font-family: 'Varela';
    font-style: normal;
    font-weight: 400;
    src: url('/_public/fonts/Varela.ttf');
    font-display: fallback;
  }

</style>

<footer class="footer">
  <hr>
  <a href="//codetabs.com">
    <img class="verticalImage" alt="goHome" src="/_public/icons/ct/ct24r.png"> <strong>codetabs.com</strong>
  </a>
  <br>
  <span>You can submit your questions, feedbacks, and feature requests opening a issue on github or
    <strong>
      <a class="m" href="#">0f67664f6c606b6a7b6e6d7c216c6062Of989968bbc95bb968a888c9caf968080
      </a>
    </strong>
  </span>
  <br>
  <img class="logo" style="max-height:32px; vertical-align:middle" alt="" src="/_public/icons/ct/jolav32.png">
  Jolav
  &copy; <span id="year"></span> -
  <strong>
    <a href="https://github.com/jolav/codetabs">View on GitHub</a>
  </strong>
  <hr>
</footer>
<br>
<!-- End -->
`;

const footerIP = `
<!-- Begin Footer-->
<style>
  .footer {
    font-family: "arial", sans-serif;
    text-align: center;
    font-size: 0.95em;
    line-height: 1.2em;
  }

  html {
    height: 100%;
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  body {
    position: relative;
    margin: 0 auto;
    min-height: 98%;
    padding-bottom: 6rem;
  }

  /*.footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 1rem;
    text-align: center;
  }*/

  @font-face {
    font-family: 'Varela';
    font-style: normal;
    font-weight: 400;
    src: url('/_public/fonts/Varela.ttf');
    font-display: fallback;
  }

</style>


<footer class="footer">
  <hr>
  <a href="//codetabs.com">
    <img class="verticalImage" alt="goHome" src="/_public/icons/ct/ct24r.png"> <strong>codetabs.com</strong>
  </a>
  <br>
  <span>
    This site includes IP2Location LITE data available from <a
      href="https://lite.ip2location.com">https://lite.ip2location.com</a>.
  </span>
  <br>
  <span>You can submit your questions, feedbacks, and feature requests opening a issue on github or
    <strong>
      <a class="m" href="#">0f67664f6c606b6a7b6e6d7c216c6062Of989968bbc95bb968a888c9caf968080
      </a>
    </strong>
  </span>
  <br>
  <img class="logo" style="max-height:32px; vertical-align:middle" alt="" src="/_public/icons/ct/jolav32.png">
  Jolav
  &copy; <span id="year"></span> -
  <strong>
    <a href="https://github.com/jolav/codetabs">View on GitHub</a>
  </strong>
  <hr>
</footer>
<br>
<!-- End -->
`;

const footerLoc = `
<!-- Begin Footer-->
<style>
  .footer {
    font-family: "arial", sans-serif;
    text-align: center;
    font-size: 0.95em;
    line-height: 1.2em;
  }

  html {
    height: 100%;
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  body {
    position: relative;
    margin: 0 auto;
    min-height: 98%;
    padding-bottom: 6rem;
  }

  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 1rem;
    text-align: center;
  }

  @font-face {
    font-family: 'Varela';
    font-style: normal;
    font-weight: 400;
    src: url('/_public/fonts/Varela.ttf');
    font-display: fallback;
  }

</style>

<footer class="footer">
  <hr>
  <a href="//codetabs.com">
    <img class="verticalImage" alt="goHome" src="/_public/icons/ct/ct24r.png"> <strong>codetabs.com</strong>
  </a>
  <br>
  <span>
    This site includes Ben Boyter
    <a href="https://github.com/boyter/scc">boyter/scc</a> for counting lines of code.
  </span>
  <br>
  <span>You can submit your questions, feedbacks, and feature requests opening a issue on github or
    <strong>
      <a class="m" href="#">0f67664f6c606b6a7b6e6d7c216c6062Of989968bbc95bb968a888c9caf968080
      </a>
    </strong>
  </span>
  <br>
  <img class="logo" style="max-height:32px; vertical-align:middle" alt="" src="/_public/icons/ct/jolav32.png">
  Jolav
  &copy; <span id="year"></span> -
  <strong>
    <a href="https://github.com/jolav/codetabs">View on GitHub</a>
  </strong>
  <hr>
</footer>
<br>
<!-- End -->
`;

const version = `
<!-- Version -->
<h2 class="centerText">
  API doc
  <small>
    <small>(version 0.11.4)</small>
  </small>
</h2>
<!-- End  -->`;

const data = {
  init: function () {
    const ms = document.getElementsByClassName("m");

    for (let i = 0; i < ms.length; i++) {
      const el = ms[i];
      const oldValue = el.innerHTML;
      const aux = oldValue.split("O")[0];
      const value = this.getValue(aux);
      if (i === 0) {
        el.textContent = "emailing us";
      }
      if (i === 1) {
        el.textContent = value;
      }
      el.href = 'mailto:' + value;
    }

    const year = document.getElementById("year");
    year.textContent = new Date().getFullYear();
  },
  getValue: function (oldValue) {
    var value = "";
    var keyInHex = oldValue.substr(0, 2);
    var key = parseInt(keyInHex, 16);
    for (var n = 2; n < oldValue.length; n += 2) {
      var charInHex = oldValue.substr(n, 2);
      var char = parseInt(charInHex, 16);
      var output = char ^ key;
      value += String.fromCharCode(output);
    }
    return value;
  },

};

export {
  head,
  footer,
  footerIP,
  footerLoc,
  data,
  version,
};
