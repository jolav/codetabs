
![Version](https://img.shields.io/badge/version-0.8.2-orange.svg)  
![Maintained YES](https://img.shields.io/badge/Maintained%3F-yes-green.svg)  
![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)  

# ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ct/ct64r.png?raw=true) **ONLINE TOOLS ([codetabs.com](https://codetabs.com))** 

**version 0.8.2**

1. [Count LOC (lines of code) online from github/gitlab repos or zipped uploaded folder](#count-loc-online)  
2. [CORS proxy](#cors-proxy)  
3. [Github Gitlab Stars graphical history](#github-gitlab-stars-graphical-history)  
4. [IP GeoLocation](#ip-geolocation)  
5. [Alexa Ranking](#alexa)  
6. [HTTP Headers](#headers)  
7. [API weather temp](#weather)  
8. [Video To Gif](#video2gif)


[To Do List](#to-do)

In order to run this program you need installed

`apt install curl git p7zip zip unzip ffmepg gifsicle`

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/loc48.png?raw=true) 

## **COUNT LOC ONLINE** 

### **[DEMO and DOCS online](https://codetabs.com/count-loc/count-loc-online.html)**

- Enter user/repo , then click add or select a zipped folder and upload it  
- Can count GitHub and GitLab repos  
- Max GitHub/GitLab Repo size : 500 mb, greater repos will not work.  
- File max size for upload 200mb;  
- Can select a branch different than master using &branch=branchName  
- Can ignore files or directories writing them separated by commas in the ignoreBox.  
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed  
- Default colors are the same as github.  
- You can edit the colors of the segments by clicking on any point of it.
Segment will randomly change color as it is clicked.  

![Example](https://github.com/jolav/codetabs/blob/master/www/_public/images/locExample.png?raw=true)

**API LOC**

* curl Request  
add -L flag  
`curl -L https://api.codetabs.com/v1/loc?source=username/reponame`

*  Make a GET HTTP Request   
`https://api.codetabs.com/v1/loc?github=USERNAME/REPONAME`  
`https://api.codetabs.com/v1/loc?gitlab=USERNAME/REPONAME`  

If you want a different branch than master  
`https://api.codetabs.com/v1/loc?SOURCE=USERNAME/REPONAME&branch=branchName`  

Ignore files or directories  
`https://api.codetabs.com/v1/loc?SOURCE=USERNAME/REPONAME&ignored=DIRNAME1,DIRNAME2,FILENAME`


Example :   
https://api.codetabs.com/v1/loc?github=jolav/betazone  
https://api.codetabs.com/v1/loc?gitlab=jolav/chuletas  
https://api.codetabs.com/v1/loc?github=imageMagick/imageMagick&branch=gh-pages  
https://api.codetabs.com/v1/loc?github=jolav/betazone&ignored=www,main.go   


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


### **[Read DOCS online](https://codetabs.com/cors-proxy/cors-proxy.html)**

- Free CORS proxy server to bypass same-origin policy related to performing standard AJAX requests to 3rd party services.
You can use to prevent mixed content of images and JSON data proxying the resources to serve them under https.
- API URL => append the url with the resource you want to "https://api.codetabs.com/v1/proxy/"
- Each request is limited to 5mb size download to avoid abuse.
- Only suppports GET request.
- Limit : 5 request per second. Once reached subsequent requests will result in error 429 (too many requests) until your quota is cleared. 

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/stars48.png?raw=true) 

## **GITHUB GITLAB STARS GRAPHICAL HISTORY**

### **[DEMO online](https://codetabs.com/github-stars/github-star-history.html)**

- Select Github or GitLab source.  
- Enter user/repo , then click add.
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed  
- You can edit the colors of the lines by clicking on any point of it. Line will randomly change color as it is clicked.  

![Example2](https://github.com/jolav/codetabs/blob/master/www/_public/images/starExample2.png?raw=true)

![Example1](https://github.com/jolav/codetabs/blob/master/www/_public/images/starExample.png?raw=true)

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ip48.png?raw=true) 

## **IP GEOLOCATION**

### **[Demo and Docs online](https://codetabs.com/ip-geolocation/ip-geolocation.html)**


- Free service that provides a public secure API (CORS enabled) to retrieve geolocation from any IP or hostname.  
- 10 request per second. Once reached subsequent requests will result in error 429 until your quota is cleared.  
- This API requires no key or signup.  
- JSON and XML supported
- IPv4 and IPv6 supported  
- CORS support out of the box makes this perfect to your front end apps or webs  


Examples

https://api.codetabs.com/v1/geolocation/json  
https://api.codetabs.com/v1/geolocation/json?q=codetabs.com  
https://api.codetabs.com/v1/geolocation/xml?q=8.8.8.8  
https://api.codetabs.com/v1/geolocation/xml?q=2a00:1450:4006:803::200e  

Response JSON :

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

Tool for know Alexa Ranking Top 1 million about a website.  

### **[Get Alexa Ranking Online](https://codetabs.com/alexa/alexa-ranking.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/headers48.png?raw=true) 

## **HEADERS**

Tool to get list of response headers including redirect chain of a HTTP connection

### **[DEMO and DOCS online](https://codetabs.com/http-headers/headers.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/weather48.png?raw=true) 

## **WEATHER** 

### **[Read DOCS online](https://codetabs.com/weather/weather.html)**

- Petitions are limited to 5 per sec. You will get a 429 error if you exceed 
- CORS is enabled allowing Javascript make requests across domain boundaries
- Supported formats, json and xml  

<hr>

![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/gif48.png?raw=true) 

## **VIDEO2GIF**

### **[Video2Gif Converter online](https://codetabs.com/video2gif/video-to-gif.html)**

- Tool for converting videos to animated gifs
- File max size 100mb
- Limit : 1 request every 30 seconds. Once reached subsequent requests will result in error 429 (too many requests) until your quota is cleared.

**Parameters** 

Frames : Set frame rate (frames per second). Max value 10, default 5.

Start : Seek to given time position in seconds. "hh:mm:ss" syntax is also supported. Default is from start
> - 100 - begin from second 100   
> - 01:40 - begin from minute 1 and second 40  

Duration : Restrict the captured video sequence to the duration specified in seconds. "hh:mm:ss" syntax is also supported. Default is all duration
> - 200 - take 200 seconds from start  
> - 03:20 - take 3 minutes and 20 seconds from start  

Scale : Set width:height , if one parameter is -1 it will automatically determine the other while preserving the aspect ratio. Default is 320:160. Max 480.
> - 480:480 set width = 480 and height = 480  
> - 380:-1 set width = 380 and height automatically preserving the aspect ratio  
> - -1:320 set height = 320 and width automatically preserving the aspect ratio  

<hr>

## TO DO

- [ ] **WWW** clean unused parts, css, etc
- [ ] **WWW** change web design

- [ ] **ALL** Fix the tests. They are outdated and unusable.

- [X] **LOC** Save Historical Data  
- [X] **LOC** Gitlab  
- [ ] **LOC** Bitbucket  
- [X] **LOC** Use same colours for languages as github   
- [X] **LOC** Change cgag/loc  
- [X] **LOC** Select different branch than master  
- [X] **LOC** toggle pie chart to showing non blank lines  
- [X] **LOC** box to ignore patterns such as ./vendor  
- [ ] **LOC** update line count when hiding languages  

- [X] **STARS** Save Historical Data (unstar = problem)  
- [X] **STARS** Gitlab  
- [ ] **STARS** Optimize doing far fewer requests. Extrapolate data  

- [ ] **GEOLOCATION** Use csv data instead bin for remove dependency and load all data in memory ???   

- [X] **WEATHER** Search more sources for weather data

- [X] **VIDEO2GIF** Get better compression

## **Acknowledgment**

* This site includes Ben Boyter <a href="https://github.com/boyter/scc">boyter/scc</a> for counting lines of code.

* This site includes IP2Location LITE data available from <a href="https://lite.ip2location.com">https://lite.ip2location.com</a>.
