package main

var configjson = []byte(`
{
	"app": {
		"version":"0.4.0",
		"mode":"production",
		"port": 3703,
		"service":"weather"
  }
}
`)

var g conf

type conf struct {
	OpenWeather struct {
		Name string `json:"name"`
		Key  string `json:"key"`
	} `json:"openWeather"`
	WeatherUnlocked struct {
		AppID string `json:"appId"`
		Key   string `json:"key"`
	} `json:"weatherUnlocked"`
}

var geo mygeoData

type mygeoData struct {
	IP          string  `json:"ip" xml:"ip,omitempty"`
	City        string  `json:"city" xml:"city,omitempty"`
	CountryCode string  `json:"country_code" xml:"country_code,omitempty"`
	Lat         float64 `json:"latitude" xml:"latitude,omitempty"`
	Lon         float64 `json:"longitude" xml:"longitude,omitempty"`
}

var o output

type output struct {
	TempC   float64 `json:"tempC"`
	TempF   float64 `json:"tempF"`
	City    string  `json:"city"`
	Country string  `json:"country"`
	Lat     float64 `json:"latitude"`
	Lon     float64 `json:"longitude"`
}

var c configuration

type configuration struct {
	App struct {
		Mode    string `json:"mode"`
		Port    int    `json:"port"`
		Service string `json:"service"`
		Version string `json:"version"`
	} `json:"app"`
}

var e myError

type myError struct {
	Error string `json:"Error,omitempty"`
}

var mw myWeatherData

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
