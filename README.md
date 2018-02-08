# ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/ct64r.png?raw=true) **ONLINE TOOLS ([codetabs.com](https://codetabs.com))** 

1. [Github Stars graphical history](#github-stars-graphical-history)  
2. [Count LOC (lines of code) online from github repos or zipped uploaded folder](#count-loc-online)  
3. [CORS proxy](#cors-proxy)
4. [API / weather temp](#api)  
5. [HTTP Headers](#headers)
6. [Alexa Ranking](#alexa)
7. [Tetris](#tetris)  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/stars32.png?raw=true) 

## **GITHUB STARS GRAPHICAL HISTORY**

version 0.4.1

### **[DEMO online](https://codetabs.com/github-stars/github-star-history.html)**

Enter user/repo , then click add.

Petitions are limited to 1 every 5 secs. You will get a 503 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/_public/images/starExample.png?raw=true)

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/count32.png?raw=true)  
## **COUNT LOC ONLINE** 

version 0.4.1

### **[DEMO and DOCS online](https://codetabs.com/count-loc/count-loc-online.html)**

Enter user/repo , then click add or select a zipped folder and upload it  

File max size 100mb;

Petitions are limited to 1 every 5 secs. You will get a 503 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/_public/images/locExample.png?raw=true)

### **API LOC**

*  Make a GET HTTP Request   
`https://api.codetabs.com/count-loc/get?repo=USERNAME/REPONAME`

Example :   
https://api.codetabs.com/count-loc/get?repo=jolav/codetabs

Response (JSON) :

```json
[
 {
  "language": "JavaScript",
  "files": 1,
  "lines": 176,
  "blanks": 14,
  "comments": 6,
  "linesOfCode": 156
 },   
 ... more languages
 {
  "language": "Total",
  "files": 8,
  "lines": 921,
  "blanks": 132,
  "comments": 46,
  "linesOfCode": 743
 }
]
```

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/server32.png?raw=true)

## **CORS-PROXY**

version 0.2.1

### **[Read DOCS online](https://codetabs.com/cors-proxy/cors-proxy.html)**

Petitions are limited to 5 per sec. You will get a 503 error if you exceed 

Free CORS proxy server that allows access resources from any website

You can use to prevent mixed content of images and JSON data proxying the resources to serve them under https.

Each request is limited to 2mb size download to avoid abuse

For now it only suppports GET request

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/hub32.png?raw=true) 

## **API** 

version 0.2.1

### **[Read DOCS online](https://codetabs.com/api/api.html)**

Petitions are limited to 5 per sec. You will get a 503 error if you exceed 

CORS is enabled allowing Javascript make requests across domain boundaries
       
Supported formats, json and xml  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/podium32.png?raw=true)

## **ALEXA**

version 0.2.1

Tool for know Alexa Ranking Top 1 million about a website.  

### **[Get Alexa Ranking Online](https://codetabs.com/alexa/alexa-ranking.html)**

Petitions are limited to 5 per second. You will get a 503 error if you exceed  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/headers32.png?raw=true)

## **HEADERS**

version 0.1.1

Tool to get list of response headers including redirect chain of a HTTP connection

### **[DEMO and DOCS online](https://codetabs.com/http-headers/headers.html)**

Petitions are limited to 1 per second. You will get a 503 error if you exceed

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/tetris32.png?raw=true) 

## **TETRIS**

version 0.2.1

### **[Play now](https://codetabs.com/tetris-game/tetris.html)** the great classic game

<hr>

## **Acknowledgment**

* This site includes Curtis Gagliardi <a href="https://github.com/cgag/loc">cgag/loc</a> for counting lines of code.

