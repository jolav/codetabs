# ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/ct64r.png?raw=true) **ONLINE TOOLS ([codetabs.com](https://codetabs.com))** 

1. [Github Stars graphical history](#github-stars-graphical-history)  
2. [Count LOC (lines of code) online from github repos or zipped uploaded folder](#count-loc-online)  
3. [Geolocation IP](#geoip)
4. [CORS proxy](#cors-proxy)
5. [API weather temp](#weather)  
6. [HTTP Headers](#headers)
7. [Alexa Ranking](#alexa)

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/stars32.png?raw=true)  **GITHUB STARS GRAPHICAL HISTORY**

version 0.4.2

### **[DEMO online](https://codetabs.com/github-stars/github-star-history.html)**

- Enter user/repo , then click add.
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/_public/images/starExample.png?raw=true)

<hr>


## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/count32.png?raw=true)  **COUNT LOC ONLINE** 

version 0.4.2

### **[DEMO and DOCS online](https://codetabs.com/count-loc/count-loc-online.html)**

- Enter user/repo , then click add or select a zipped folder and upload it  
- File max size 100mb;
- Petitions are limited to 1 every 5 secs. You will get a 429 error if you exceed 

![Example](https://github.com/jolav/codetabs/blob/master/_public/images/locExample.png?raw=true)

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

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/geoip32.png?raw=true)  **GEOLOCATION IP**

version 0.1.8

### **[Read API DOCS online](https://codetabs.com/geolocation-ip/geolocation-ip.html)**

- Free GeoIP service that provides a public HTTPS (SSL access) API to retrieve geolocation from any IPv4, IPv6 or hostname  
- Supported formats, json and xml  
- 120 requests per minute. Once reached subsequent requests will result in error 429 (too many requests) until your quota is cleared  
- API requires no key or signup.

```json
{   
  "ip": "94.168.50.200",
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

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/server32.png?raw=true)  **CORS-PROXY**

version 0.2.2

### **[Read DOCS online](https://codetabs.com/cors-proxy/cors-proxy.html)**

- Petitions are limited to 5 per sec. You will get a 429 error if you exceed 
- Free CORS proxy server that allows access resources from any website
- You can use to prevent mixed content of images and JSON data proxying the resources to serve them under https.
- Each request is limited to 2mb size download to avoid abuse
- Only suppports GET request


<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/weather32.png?raw=true)  **WEATHER** 

version 0.2.2

### **[Read DOCS online](https://codetabs.com/weather/weather.html)**

- Petitions are limited to 5 per sec. You will get a 429 error if you exceed 
- CORS is enabled allowing Javascript make requests across domain boundaries
- Supported formats, json and xml  

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/podium32.png?raw=true)  **ALEXA**

version 0.2.2

Tool for know Alexa Ranking Top 1 million about a website.  

### **[Get Alexa Ranking Online](https://codetabs.com/alexa/alexa-ranking.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed  

<hr>

## ![logo](https://github.com/jolav/codetabs/blob/master/_public/icons/headers32.png?raw=true)  **HEADERS**

version 0.2.2

Tool to get list of response headers including redirect chain of a HTTP connection

### **[DEMO and DOCS online](https://codetabs.com/http-headers/headers.html)**

- Petitions are limited to 5 per second. You will get a 429 error if you exceed

<hr>

## **Acknowledgment**

* This site includes Curtis Gagliardi <a href="https://github.com/cgag/loc">cgag/loc</a> for counting lines of code.

* This site includes GeoLite2 data created by MaxMind, available from  [maxmind.com](http://maxmind.com)

