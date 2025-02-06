
![Version](https://img.shields.io/badge/version-0.9.4a-orange.svg)  
![Maintained YES](https://img.shields.io/badge/Maintained%3F-yes-green.svg)  
![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)  

# ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ct/ct64r.png?raw=true) **ONLINE TOOLS ([codetabs.com](https://codetabs.com))** 

**version 0.9.4a**

1. [Count LOC (lines of code) online from github/gitlab repos or zipped uploaded folder](#count-loc-online)  
2. [CORS proxy](#cors-proxy)  
3. [Github Gitlab Stars graphical history](#github-gitlab-stars-graphical-history)  
4. [IP GeoLocation](#ip-geolocation)  
5. [Alexa](#alexa)  
6. [HTTP Headers](#headers)  
7. [API weather temp](#weather)  
8. [Random Data API](#random-data-api)


[To Do List](#to-do)

In order to run this program you need installed

`apt install curl git p7zip zip unzip`

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/loc48.png?raw=true) 

## **COUNT LOC ONLINE** 

### **[DEMO and API DOCS online](https://codetabs.com/count-loc/count-loc-online.html)**

- Count lines of code, blank lines, comment lines, and physical lines of source code in many programming languages.
- Enter user/repo , then click add 
- Can count GitHub and GitLab repos  
- Max GitHub/GitLab Repo size : 500 mb, greater repos will not work.  
- Can select a branch different than master using &branch=branchName  
- Can ignore files or directories writing them separated by commas in the ignoreBox.  
- Default colors are the same as github.  
- You can edit the colors of the segments by clicking on any point of it.
Segment will randomly change color as it is clicked.  

![Example](https://github.com/jolav/codetabs/blob/master/www/_public/images/locExample.png?raw=true)

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

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/proxy48.png?raw=true)  

## **CORS-PROXY**

### **[API DOCS online](https://codetabs.com/cors-proxy/cors-proxy.html)**

- Free CORS proxy server to bypass same-origin policy related to performing standard AJAX requests to 3rd party services.
You can use to prevent mixed content of images and JSON data proxying the resources to serve them under https.

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/stars48.png?raw=true) 

## **GITHUB GITLAB STARS GRAPHICAL HISTORY**

### **[DEMO and API DOCS online](https://codetabs.com/github-stars/github-star-history.html)**

- Select Github or GitLab source.  
- Enter user/repo , then click add.
- You can edit the colors of the lines by clicking on any point of it. Line will randomly change color as it is clicked.  

![Example2](https://github.com/jolav/codetabs/blob/master/www/_public/images/starExample2.png?raw=true)

![Example1](https://github.com/jolav/codetabs/blob/master/www/_public/images/starExample.png?raw=true)

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ip48.png?raw=true) 

## **IP GEOLOCATION**

### **[DEMO and API Docs online](https://codetabs.com/ip-geolocation/ip-geolocation.html)**


- Free service that provides a public secure API (CORS enabled) to retrieve geolocation from any IP or hostname.  
- This API requires no key or signup.  
- JSON and XML supported
- IPv4 and IPv6 supported  
- CORS support out of the box makes this perfect to your front end apps or webs  

```json
{   
  "ip": "172.168.90.240",
  "country_code": "FR",
  "country_name": "France",
  "region_code": "IDF",
  "region_name": "Ile-de-France",
  "city": "Paris",
  "zip_code": "75001",
  "time_zone": "Europe/Paris",
  "latitude": 48.8628,
  "longitude": 2.3292   
}
```

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/alexa48.png?raw=true) 

## **ALEXA**

### **[DEMO and API DOCS online](https://codetabs.com/alexa/alexa-ranking.html)**

 - Tool for know Alexa Ranking Top 1 million about a website.Alexa ranking is deprecated. Last Update on February 1, 2023  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/headers48.png?raw=true) 

## **HEADERS**

### **[DEMO and API DOCS online](https://codetabs.com/http-headers/headers.html)**  

 - Tool to get list of response headers including redirect chain of a HTTP connection

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/weather48.png?raw=true) 

## **WEATHER** 

### **[API DOCS online](https://codetabs.com/weather/weather.html)**

 - Retrieve actual temp (ºC and ºF) based on your public IP geolocation or a city passed as a parameter  
 - JSON and XML supported  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/gif48.png?raw=true) 

## **RANDOM DATA API**

### **[API Docs online](https://codetabs.com/random-data/random-data.html)**

 - Random Integers
 - Lists of integers with randomized order  
 - Random Names   

<hr>

## **Acknowledgment**

* This site includes Ben Boyter <a href="https://github.com/boyter/scc">boyter/scc</a> for counting lines of code.

* This site includes IP2Location LITE data available from <a href="https://lite.ip2location.com">https://lite.ip2location.com</a>.
