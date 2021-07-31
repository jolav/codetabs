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
  let addComments = false;
  let jsonData = [];

  function init() {
    console.log('Init Count Loc');
    document.getElementById('addRepo').addEventListener('click', addRepo);
    document.getElementById('upload').addEventListener('click', upload);
    document.getElementById("toggle").addEventListener('click', toggle);
    document.getElementById("toggle").style.display = "none";
    document.getElementsByClassName('pie')[0].style.display = 'none';
    hideLoader();
  }

  function addRepo(e) {
    repo = document.getElementById('repoName').value;
    const select = document.getElementsByName("source")[0];
    const source = select.options[select.selectedIndex].value;
    const branch = document.getElementById("branch").value;
    console.log('branch', branch);
    if (repo === '') {
      alert('user/repo cannot be empty');
      return;
    }
    showLoader();
    let urlData = urlBase + '?' + source + '=' + repo;
    if (branch) {
      urlData += "&branch=" + branch;
    }
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
    //console.log('REQUEST => ', urlData, prepareData, formData);
    makeAjaxRequest(urlData, 'POST', prepareData, formData);
  }

  function hideLoader() {
    document.getElementsByClassName('loader')[0].style.visibility = 'hidden';
    document.getElementsByClassName('loader')[0].style.display = 'none';
  }

  function showLoader() {
    document.getElementsByClassName('loader')[0].style.visibility = 'visible';
    document.getElementsByClassName('loader')[0].style.display = 'block';
    document.getElementById("toggle").style.display = "block";
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

  function toggle() {
    myChart.destroy();
    let text = document.getElementById("toggle");
    if (addComments) {
      addComments = false;
      text.innerHTML = "Include Comments in Pie Chart";
    } else {
      addComments = true;
      text.innerHTML = "Exclude Comments from Pie Chart";
    }
    prepareData(jsonData);
  }

  function prepareData(dataRepo) {
    jsonData = dataRepo;
    console.log('RECEIVE => ', dataRepo);
    if (dataRepo.length === 1) {
      if (dataRepo[0].linesOfCode === 0 || dataRepo[0].linesOfCode === undefined) {
        alert('Not a valid file');
        return;
      }
    }
    hideLoader();
    let data = [];
    if (addComments) {
      data = locWithComments(dataRepo);
    } else {
      data = locNotComments(dataRepo);
    }
    const linesOfCode = data[0];
    const labels = data[1];
    drawChart(linesOfCode, labels);
    showTotal(dataRepo);
  }

  function locWithComments(dataRepo) {
    let linesOfCode = [];
    let labels = [];
    for (let i = 0; i < dataRepo.length - 1; i++) { // -1 avoid "Total" line
      linesOfCode.push(dataRepo[i].linesOfCode + dataRepo[i].comments);
      labels.push(dataRepo[i].language);
    }
    return [linesOfCode, labels];
  }

  function locNotComments(dataRepo) {
    let linesOfCode = [];
    let labels = [];
    for (let i = 0; i < dataRepo.length - 1; i++) {
      //if (dataRepo[i].language !== 'Total') {
      linesOfCode.push(dataRepo[i].linesOfCode);
      labels.push(dataRepo[i].language);
      //}
    }
    return [linesOfCode, labels];
  }

  function drawChart(loc, langs) {
    document.getElementsByClassName('pie')[0].style.display = 'block';
    let colors = [];
    //let data = [];
    for (let i = 0; i < loc.length; i++) {
      colors.push(languageToColor[langs[i]]);
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
          },
          // https://github.com/chartjs/Chart.js/issues/2437
          /*onClick: (e, item) => {
            const original = myChart.defaults.global.legend.onClick;
            myChart.defaults.global.legend.onClick = function (e, legendItem) {
              // do custom stuff here 
              console.log('HI');
              original.call(this, e, legendItem);
            };
          },*/
        },
        onClick: function (e) {
          const element = this.getElementAtEvent(e);
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
        /*onClick: function (e, element) {
        if (element[0]) {
          const order = element[0]._index;
          let line = this.active[0]._chart.config.data.datasets[0];
          line.backgroundColor[order] = getRandomColor();
          myChart.update();
        }
      },*/
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
    //const total = dataRepo[dataRepo.length - 1];
    const data = {
      files: 0,
      lines: 0,
      blanks: 0,
      comments: 0,
      linesOfCode: 0,
    };
    for (let v in dataRepo) {
      if (dataRepo[v].language !== "Total") {
        data.files += dataRepo[v].files;
        data.lines += dataRepo[v].lines;
        data.blanks += dataRepo[v].blanks;
        data.comments += dataRepo[v].comments;
        data.linesOfCode += dataRepo[v].linesOfCode;
      }
    }
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

// https://github.com/LeeReindeer/github-colors/blob/go/color.json
const languageToColor =
  { "1C-Enterprise": "#814CCC", "ABAP": "#E8274B", "ABNF": "", "AGS-Script": "#B9D9FF", "AMPL": "#E6EFBB", "ANTLR": "#9DC3FF", "API-Blueprint": "#2ACCA8", "APL": "#5A8164", "ASN.1": "", "ASP": "#6a40fd", "ATS": "#1ac620", "ActionScript": "#882B0F", "Ada": "#02f88c", "Adobe-Font-Metrics": "", "Agda": "#315665", "Alloy": "#64C800", "Alpine-Abuild": "", "AngelScript": "#C7D7DC", "Ant-Build-System": "", "ApacheConf": "", "Apex": "", "Apollo-Guidance-Computer": "", "AppleScript": "#101F1F", "Arc": "#aa2afe", "Arduino": "#bd79d1", "AsciiDoc": "", "AspectJ": "#a957b0", "Assembly": "#6E4C13", "Augeas": "", "AutoHotkey": "#6594b9", "AutoIt": "#1C3552", "Awk": "", "Ballerina": "#FF5000", "Batchfile": "#C1F12E", "Befunge": "", "Bison": "", "BitBake": "", "Blade": "", "BlitzBasic": "", "BlitzMax": "#cd6400", "Bluespec": "", "Boo": "#d4bec1", "Brainfuck": "#2F2530", "Brightscript": "", "Bro": "", "C": "#555555", "C#": "#178600", "C++": "#f34b7d", "C-ObjDump": "", "C2hs-Haskell": "", "CLIPS": "", "CMake": "", "COBOL": "", "COLLADA": "", "CSON": "", "CSS": "#563d7c", "CSV": "", "CWeb": "", "Cap'n-Proto": "", "CartoCSS": "", "Ceylon": "#dfa535", "Chapel": "#8dc63f", "Charity": "", "ChucK": "", "Cirru": "#ccccff", "Clarion": "#db901e", "Clean": "#3F85AF", "Click": "#E4E6F3", "Clojure": "#db5855", "Closure-Templates": "", "CoffeeScript": "#244776", "ColdFusion": "#ed2cd6", "ColdFusion-CFC": "", "Common-Lisp": "#3fb68b", "Common-Workflow-Language": "#B5314C", "Component-Pascal": "#B0CE4E", "Cool": "", "Coq": "", "Cpp-ObjDump": "", "Creole": "", "Crystal": "#776791", "Csound": "", "Csound-Document": "", "Csound-Score": "", "Cuda": "#3A4E3A", "Cycript": "", "Cython": "", "D": "#ba595e", "D-ObjDump": "", "DIGITAL-Command-Language": "", "DM": "#447265", "DNS-Zone": "", "DTrace": "", "Darcs-Patch": "", "Dart": "#00B4AB", "DataWeave": "#003a52", "Diff": "", "Dockerfile": "", "Dogescript": "#cca760", "Dylan": "#6c616e", "E": "#ccce35", "EBNF": "", "ECL": "#8a1267", "ECLiPSe": "", "EJS": "", "EQ": "#a78649", "Eagle": "", "Easybuild": "", "Ecere-Projects": "", "Edje-Data-Collection": "", "Eiffel": "#946d57", "Elixir": "#6e4a7e", "Elm": "#60B5CC", "Emacs-Lisp": "#c065db", "EmberScript": "#FFF4F3", "Erlang": "#B83998", "F#": "#b845fc", "FLUX": "#88ccff", "Factor": "#636746", "Fancy": "#7b9db4", "Fantom": "#14253c", "Filebench-WML": "", "Filterscript": "", "Formatted": "", "Forth": "#341708", "Fortran": "#4d41b1", "FreeMarker": "#0050b2", "Frege": "#00cafe", "G-code": "", "GAMS": "", "GAP": "", "GCC-Machine-Description": "", "GDB": "", "GDScript": "", "GLSL": "", "GN": "", "Game-Maker-Language": "#8fb200", "Genie": "#fb855d", "Genshi": "", "Gentoo-Ebuild": "", "Gentoo-Eclass": "", "Gerber-Image": "", "Gettext-Catalog": "", "Gherkin": "#5B2063", "Glyph": "#e4cc98", "Gnuplot": "#f0a9f0", "Go": "#00ADD8", "Golo": "#88562A", "Gosu": "#82937f", "Grace": "", "Gradle": "", "Grammatical-Framework": "#79aa7a", "Graph-Modeling-Language": "", "GraphQL": "", "Graphviz-(DOT)": "", "Groovy": "#e69f56", "Groovy-Server-Pages": "", "HCL": "", "HLSL": "", "HTML": "#e34c26", "HTML+Django": "", "HTML+ECR": "", "HTML+EEX": "", "HTML+ERB": "", "HTML+PHP": "", "HTTP": "", "Hack": "#878787", "Haml": "", "Handlebars": "", "Harbour": "#0e60e3", "Haskell": "#5e5086", "Haxe": "#df7900", "Hy": "#7790B2", "HyPhy": "", "IDL": "#a3522f", "IGOR-Pro": "", "INI": "", "IRC-log": "", "Idris": "#b30000", "Inform-7": "", "Inno-Setup": "", "Io": "#a9188d", "Ioke": "#078193", "Isabelle": "#FEFE00", "Isabelle-ROOT": "", "J": "#9EEDFF", "JFlex": "", "JSON": "", "JSON5": "", "JSONLD": "", "JSONiq": "#40d47e", "JSX": "", "Jasmin": "", "Java": "#b07219", "Java-Server-Pages": "", "JavaScript": "#f1e05a", "Jison": "", "Jison-Lex": "", "Jolie": "#843179", "Julia": "#a270ba", "Jupyter-Notebook": "#DA5B0B", "KRL": "#28431f", "KiCad-Layout": "", "KiCad-Legacy-Layout": "", "KiCad-Schematic": "", "Kit": "", "Kotlin": "#F18E33", "LFE": "#4C3023", "LLVM": "#185619", "LOLCODE": "#cc9900", "LSL": "#3d9970", "LabVIEW": "", "Lasso": "#999999", "Latte": "", "Lean": "", "Less": "", "Lex": "#DBCA00", "LilyPond": "", "Limbo": "", "Linker-Script": "", "Linux-Kernel-Module": "", "Liquid": "", "Literate-Agda": "", "Literate-CoffeeScript": "", "Literate-Haskell": "", "LiveScript": "#499886", "Logos": "", "Logtalk": "", "LookML": "#652B81", "LoomScript": "", "Lua": "#000080", "M": "", "M4": "", "M4Sugar": "", "MAXScript": "#00a6a6", "MQL4": "#62A8D6", "MQL5": "#4A76B8", "MTML": "#b7e1f4", "MUF": "", "Makefile": "#427819", "Mako": "", "Markdown": "", "Marko": "", "Mask": "#f97732", "Mathematica": "", "Matlab": "#e16737", "Maven-POM": "", "Max": "#c4a79c", "MediaWiki": "", "Mercury": "#ff2b2b", "Meson": "#007800", "Metal": "#8f14e9", "MiniD": "", "Mirah": "#c7a938", "Modelica": "", "Modula-2": "", "Module-Management-System": "", "Monkey": "", "Moocode": "", "MoonScript": "", "Myghty": "", "NCL": "#28431f", "NL": "", "NSIS": "", "Nearley": "#990000", "Nemerle": "#3d3c6e", "NetLinx": "#0aa0ff", "NetLinx+ERB": "#747faa", "NetLogo": "#ff6375", "NewLisp": "#87AED7", "Nginx": "", "Nim": "#37775b", "Ninja": "", "Nit": "#009917", "Nix": "#7e7eff", "Nu": "#c9df40", "NumPy": "", "OCaml": "#3be133", "ObjDump": "", "Objective-C": "#438eff", "Objective-C++": "#6866fb", "Objective-J": "#ff0c5a", "Omgrofl": "#cabbff", "Opa": "", "Opal": "#f7ede0", "OpenCL": "", "OpenEdge-ABL": "", "OpenRC-runscript": "", "OpenSCAD": "", "OpenType-Feature-File": "", "Org": "", "Ox": "", "Oxygene": "#cdd0e3", "Oz": "#fab738", "P4": "#7055b5", "PAWN": "#dbb284", "PHP": "#4F5D95", "PLSQL": "#dad8d8", "PLpgSQL": "", "POV-Ray-SDL": "", "Pan": "#cc0000", "Papyrus": "#6600cc", "Parrot": "#f3ca0a", "Parrot-Assembly": "", "Parrot-Internal-Representation": "", "Pascal": "#E3F171", "Pep8": "#C76F5B", "Perl": "#0298c3", "Perl-6": "#0000fb", "Pic": "", "Pickle": "", "PicoLisp": "", "PigLatin": "#fcd7de", "Pike": "#005390", "Pod": "", "PogoScript": "#d80074", "Pony": "", "PostCSS": "", "PostScript": "#da291c", "PowerBuilder": "#8f0f8d", "PowerShell": "#012456", "Processing": "#0096D8", "Prolog": "#74283c", "Propeller-Spin": "#7fa2a7", "Protocol-Buffer": "", "Public-Key": "", "Pug": "", "Puppet": "#302B6D", "Pure-Data": "", "PureBasic": "#5a6986", "PureScript": "#1D222D", "Python": "#3572A5", "Python-console": "", "Python-traceback": "", "QML": "#44a51c", "QMake": "", "R": "#198CE7", "RAML": "#77d9fb", "RDoc": "", "REALbasic": "", "REXX": "", "RHTML": "", "RMarkdown": "", "RPM-Spec": "", "RUNOFF": "#665a4e", "Racket": "#22228f", "Ragel": "#9d5200", "Rascal": "#fffaa0", "Raw-token-data": "", "Reason": "", "Rebol": "#358a5b", "Red": "#f50000", "Redcode": "", "Regular-Expression": "", "Ren'Py": "#ff7f7f", "RenderScript": "", "Ring": "#0e60e3", "RobotFramework": "", "Roff": "#ecdebe", "Rouge": "#cc0088", "Ruby": "#701516", "Rust": "#dea584", "SAS": "#B34936", "SCSS": "", "SMT": "", "SPARQL": "", "SQF": "#3F3F3F", "SQL": "", "SQLPL": "", "SRecode-Template": "#348a34", "STON": "", "SVG": "", "Sage": "", "SaltStack": "#646464", "Sass": "", "Scala": "#c22d40", "Scaml": "", "Scheme": "#1e4aec", "Scilab": "", "Self": "#0579aa", "ShaderLab": "", "Shell": "#89e051", "ShellSession": "", "Shen": "#120F14", "Slash": "#007eff", "Slim": "", "Smali": "", "Smalltalk": "#596706", "Smarty": "", "SourcePawn": "#5c7611", "Spline-Font-Database": "", "Squirrel": "#800000", "Stan": "#b2011d", "Standard-ML": "#dc566d", "Stata": "", "Stylus": "", "SubRip-Text": "", "Sublime-Text-Config": "", "SugarSS": "", "SuperCollider": "#46390b", "Swift": "#ffac45", "SystemVerilog": "#DAE1C2", "TI-Program": "#A0AA87", "TLA": "", "TOML": "", "TXL": "", "Tcl": "#e4cc98", "Tcsh": "", "TeX": "#3D6117", "Tea": "", "Terra": "#00004c", "Text": "", "Textile": "", "Thrift": "", "Turing": "#cf142b", "Turtle": "", "Twig": "", "Type-Language": "", "TypeScript": "#2b7489", "Unified-Parallel-C": "", "Unity3D-Asset": "", "Unix-Assembly": "", "Uno": "", "UnrealScript": "#a54c4d", "UrWeb": "", "VCL": "#0298c3", "VHDL": "#adb2cb", "Vala": "#fbe5cd", "Verilog": "#b2b7f8", "Vim-script": "#199f4b", "Visual-Basic": "#945db7", "Volt": "#1F1F1F", "Vue": "#2c3e50", "Wavefront-Material": "", "Wavefront-Object": "", "Web-Ontology-Language": "", "WebAssembly": "#04133b", "WebIDL": "", "World-of-Warcraft-Addon-Data": "", "X10": "#4B6BEF", "XC": "#99DA07", "XCompose": "", "XML": "", "XPM": "", "XPages": "", "XProc": "", "XQuery": "#5232e7", "XS": "", "XSLT": "#EB8CEB", "Xojo": "", "Xtend": "", "YAML": "", "YANG": "", "YARA": "", "Yacc": "#4B6C4B", "Zephir": "#118f9e", "Zimpl": "", "desktop": "", "eC": "#913960", "edn": "", "fish": "", "mupad": "", "nesC": "#94B0C7", "ooc": "#b0b77e", "reStructuredText": "", "wdl": "#42f1f4", "wisp": "#7582D1", "xBase": "#403a40" };
