package main

import (
	"net/http"
	"time"
)

var configjson = []byte(`
{
  "app": {
    "version": "0.2.0",
    "mode": "production",
    "port": 3510,
		"service": "",
		"hitslog":"./logs/hits.log",
		"errlog":"./logs/error.log",
		"services": ["alexa","headers","loc","proxy","stars","weather","video2gif"]
  },
  "alexa": {
    "dataFilePath": "./_data/alexa/top-1m.csv",
		"zipFile": "./_data/alexa/top-1m.csv.zip",
		"dataDir": "./_data/alexa",
    "dataFileURL": "https://s3.amazonaws.com/alexa-static/top-1m.csv.zip"
	},
	"loc": {
		"locLinux": "./_data/loc/locLinux",
		"order": "0",
		"orderInt": 0
	},
	"video2gif": {
		"order": "1",
		"orderInt": 1
	}
}
`)

var c configuration

type configuration struct {
	App struct {
		Mode     string //`json:"mode"`
		Port     int    //`json:"port"`
		Service  string //`json:"service"`
		Version  string //`json:"version"`
		HitsLog  string
		ErrLog   string
		Services []string
	} //`json:"app"`
	Alexa struct {
		DataFilePath string
		ZipFilePath  string `json:"zipFile"`
		DataDir      string
		DataFileURL  string
	}
	Loc struct {
		LocLinux string
		Order    string
		OrderInt int
	}
	Video2Gif struct {
		order    string
		orderInt int
	}
}

var g privateConfiguration

type privateConfiguration struct {
	OpenWeather struct {
		Name string `json:"name"`
		Key  string `json:"key"`
	} `json:"openWeather"`
	WeatherUnlocked struct {
		AppID string `json:"appId"`
		Key   string `json:"key"`
	} `json:"weatherUnlocked"`
	GitHub struct {
		Token []string `json:"token"`
	} `json:"github"`
}

var e myError

type myError struct {
	Error string `json:"Error,omitempty"`
}

// ALEXA

var alexaList map[string](int)

type alexaOutput struct {
	Domain string `json:"domain"`
	Rank   int    `json:"rank"`
}

// HEADERS

type header struct {
	Header map[string]string `json:"header"`
}

// LOC

type language struct {
	Name     string `json:"language"`
	Files    int    `json:"files"`
	Lines    int    `json:"lines"`
	Blanks   int    `json:"blanks"`
	Comments int    `json:"comments"`
	Code     int    `json:"linesOfCode"`
}

// PROXY

// STARS

type star struct {
	StarredAt *time.Time `json:"starred_at"`
}

type point struct {
	When     string `json:"x"`
	Quantity int    `json:"y"`
}

type httpResponse struct {
	link     string
	response *http.Response
	err      error
	id       int
}

// WEATHER

type weatherGeoData struct {
	IP          string  `json:"ip" xml:"ip,omitempty"`
	City        string  `json:"city" xml:"city,omitempty"`
	CountryCode string  `json:"country_code" xml:"country_code,omitempty"`
	Lat         float64 `json:"latitude" xml:"latitude,omitempty"`
	Lon         float64 `json:"longitude" xml:"longitude,omitempty"`
}

type weatherOutput struct {
	TempC   float64 `json:"tempC"`
	TempF   float64 `json:"tempF"`
	City    string  `json:"city"`
	Country string  `json:"country"`
	Lat     float64 `json:"latitude"`
	Lon     float64 `json:"longitude"`
	active  bool
}

type myWeatherData struct {
	Coord struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"coord"`
	Main struct {
		Open float64 `json:"temp,omitempty"`
	} `json:"main"`
	Sys struct {
		Country string `json:"country"`
	} `json:"sys"`
	Unlocked float64 `json:"temp_c,omitempty"`
}

type myWeatherDataFull struct {
	Coord struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"coord"`
	Weather []struct {
		ID          int    `json:"id"`
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Base string `json:"base"`
	Main struct {
		Temp     float64 `json:"temp"`
		Pressure int     `json:"pressure"`
		Humidity int     `json:"humidity"`
		TempMin  float64 `json:"temp_min"`
		TempMax  float64 `json:"temp_max"`
	} `json:"main"`
	Visibility int `json:"visibility"`
	Wind       struct {
		Speed int `json:"speed"`
	} `json:"wind"`
	Clouds struct {
		All int `json:"all"`
	} `json:"clouds"`
	Dt  int `json:"dt"`
	Sys struct {
		Type    int     `json:"type"`
		ID      int     `json:"id"`
		Message float64 `json:"message"`
		Country string  `json:"country"`
		Sunrise int     `json:"sunrise"`
		Sunset  int     `json:"sunset"`
	} `json:"sys"`
	ID   int    `json:"id"`
	Name string `json:"name"`
	Cod  int    `json:"cod"`
}

// VIDEO2GIF

type parameters2 struct {
	fps   int
	start int
	dur   int
	scale string
}

type parameters struct {
	fps   string
	start string
	dur   string
	scale string
}
