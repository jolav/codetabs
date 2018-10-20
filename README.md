
![Maintained YES](https://img.shields.io/badge/Maintained%3F-yes-green.svg)  
![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)  

# ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ct/ct64r.png?raw=true) **ONLINE TOOLS ([codetabs.com](https://codetabs.com))** 

1. [IP GeoLocation](#ip-geolocation)
2. [Count LOC (lines of code) online from github repos or zipped uploaded folder](#count-loc-online)  
3. [Github Stars graphical history](#github-stars-graphical-history)  
4. [CORS proxy](#cors-proxy)  
5. [Alexa Ranking](#alexa)  
6. [HTTP Headers](#headers)  
7. [API weather temp](#weather)  

<hr>

## ![Logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/ip48.png?raw=true)  
# **IP GEOLOCATION**

version 0.1.0

### **[DEMO online](https://codetabs.com/ip-geolocation/geoip.html)**

- Free service that provides a public secure API (CORS enabled) to retrieve geolocation from any IP or hostname.  
- 5 request per second. Once reached subsequent requests will result in error 429 until your quota is cleared.  
- This API requires no key or signup.  
- JSON and XML supported
- IPv4 and IPv6 supported  
- CORS support out of the box makes this perfect to your front end apps or webs  

Response JSON :

```json
{   
  "ip": "192.168.200.200",
  "country_code": "GB",
  "country_name": "United Kingdom",
  "region_code": "ENG",
  "region_name": "England",
  "city": "London",
  "zip_code": "SL1",
  "time_zone": "Europe/London",
  "latitude": 50.0500,
  "longitude": 0.6172   
}
```

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/loc48.png?raw=true)  
# **COUNT LOC ONLINE** 

version 0.6.0

### **[DEMO and DOCS online](https://codetabs.com/count-loc/count-loc-online.html)**

- Enter user/repo , then click add or select a zipped folder and upload it  
- File max size 100mb;
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/www/_public/images/locExample.png?raw=true)

**API LOC**

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

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/stars48.png?raw=true)  
# **GITHUB STARS GRAPHICAL HISTORY**

version 0.5.0

### **[DEMO online](https://codetabs.com/github-stars/github-star-history.html)**

- Enter user/repo , then click add.
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/www/_public/images/starExample.png?raw=true)

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/proxy48.png?raw=true)  
# **CORS-PROXY**

version 0.2.0

### **[Read DOCS online](https://codetabs.com/cors-proxy/cors-proxy.html)**

- Free CORS proxy server to bypass same-origin policy related to performing standard AJAX requests to 3rd party services.
You can use to prevent mixed content of images and JSON data proxying the resources to serve them under https.
- API URL => append the url with the resource you want to "https://api.codetabs.com/v1/proxy/"
- Each request is limited to 5mb (2mb for old endpoint) size download to avoid abuse.
- Only suppports GET request.
- Limit : 5 request per second. Once reached subsequent requests will result in error 429 (too many requests) until your quota is cleared. 

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/alexa48.png?raw=true)  
# **ALEXA**

version 0.4.0

Tool for know Alexa Ranking Top 1 million about a website.  

### **[Get Alexa Ranking Online](https://codetabs.com/alexa/alexa-ranking.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed  

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/headers48.png?raw=true)  
# **HEADERS**

version 0.4.0

Tool to get list of response headers including redirect chain of a HTTP connection

### **[DEMO and DOCS online](https://codetabs.com/http-headers/headers.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/www/_public/icons/weather48.png?raw=true)  
# **WEATHER** 

version 0.4.0

### **[Read DOCS online](https://codetabs.com/weather/weather.html)**

- Petitions are limited to 5 per sec. You will get a 429 error if you exceed 
- CORS is enabled allowing Javascript make requests across domain boundaries
- Supported formats, json and xml  

<hr>

## **Acknowledgment**

* This site includes Curtis Gagliardi <a href="https://github.com/cgag/loc">cgag/loc</a> for counting lines of code.

* This site includes GeoLite2 data created by MaxMind, available from  [maxmind.com](http://maxmind.com)

