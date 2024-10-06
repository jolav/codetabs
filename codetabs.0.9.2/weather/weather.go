/* */

package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	u "github.com/jolav/codetabs.0.9.2/_utils"
)

type weather struct {
	Out output
}

type output struct {
	TempC     float64 `json:"tempC"`
	TempF     float64 `json:"tempF"`
	City      string  `json:"city"`
	Country   string  `json:"country"`
	Lat       float64 `json:"latitude"`
	Lon       float64 `json:"longitude"`
	format    string
	hasLatLon bool
}

type apiData struct {
	// OpenWeather
	Coord struct {
		Lon float64 `json:"lon"`
		Lat float64 `json:"lat"`
	} `json:"coord"`
	Main struct {
		Temp float64 `json:"temp,omitempty"`
	} `json:"main"`
	Sys struct {
		Country string `json:"country"`
	} `json:"sys"`
	// WeatherApi
	Current struct {
		TempC float64 `json:"temp_c"`
		TempF float64 `json:"temp_f"`
	} `json:"current"`
	Location struct {
		Country string  `json:"country"`
		Lat     float64 `json:"lat"`
		Lon     float64 `json:"lon"`
	} `json:"location"`
	// WeatherUnlocked
	TempC float64 `json:"temp_c"`
	TempF float64 `json:"temp_f"`
}

func Router(w http.ResponseWriter, r *http.Request) {
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		u.BadRequest(w, r)
		return
	}
	if len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	wt := newWeather(false)
	r.ParseForm()
	wt.Out.format = strings.ToLower(r.Form.Get("format"))
	wt.Out.City = strings.ToLower(r.Form.Get("city"))
	if wt.Out.format == "" {
		wt.Out.format = "json"
	}
	if wt.Out.format != "xml" && wt.Out.format != "json" {
		u.BadRequest(w, r)
		return
	}
	wt.doWeatherRequest(w, r)
}

func (wt *weather) doWeatherRequest(w http.ResponseWriter, r *http.Request) {
	if wt.Out.City == "" {
		wt.getGeo(w, r)
	}
	wt.getWeather(w, r)
	if wt.Out.format == "xml" {
		u.SendXMLToClient(w, &wt.Out, 200)
		return
	}
	u.SendJSONToClient(w, &wt.Out, 200)
}

func (wt *weather) getWeather(w http.ResponseWriter, r *http.Request) {
	var url string
	var api = apiData{}
	source := u.GetRandomInt(1, 3)
	if !wt.Out.hasLatLon {
		source = u.GetRandomInt(2, 3)
	}
	if source == 1 {
		url = "http://api.weatherunlocked.com/api/current/"
		url += strconv.FormatFloat(wt.Out.Lat, 'f', -1, 64) + ","
		url += strconv.FormatFloat(wt.Out.Lon, 'f', -1, 64)
		url += "?app_id=" + WEATHERUNLOCKED_APPID
		url += "&app_key=" + WEATHERUNLOCKED_KEY
		w.Header().Set("Accept", "application/json")
	} else if source == 2 {
		url = "https://api.openweathermap.org/data/2.5/weather?"
		url += "q=" + wt.Out.City
		url += "&APPID=" + OPENWEATHER_KEY
	} else if source == 3 {
		url = "https://api.weatherapi.com/v1/current.json"
		url += "?key=" + WEATHERAPI_KEY
		url += "&q=" + wt.Out.City + "&aqui=no"
	}
	resp, err := http.Get(url)
	if err != nil {
		msg := fmt.Sprint("ERROR requesting GetWeather URL")
		u.ErrorResponse(w, msg)
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&api)
	if err != nil {
		msg := fmt.Sprint("ERROR decoding GetWeather URL")
		u.ErrorResponse(w, msg)
		return
	}
	wt.prepareOutput(api)
}

func (wt *weather) prepareOutput(api apiData) {
	if api.Main.Temp != 0 { // openweather
		wt.Out.TempC = api.Main.Temp - 273.15
		wt.Out.TempF = wt.Out.TempC*9/5 + 32
		wt.Out.Lat = api.Coord.Lat
		wt.Out.Lon = api.Coord.Lon
		wt.Out.Country = api.Sys.Country
	} else if api.TempC == 0 && api.TempF == 0 { // weatherApi
		wt.Out.TempC = api.Current.TempC
		wt.Out.TempF = api.Current.TempF
		wt.Out.Country = api.Location.Country
	} else { // weatherUnlocked
		wt.Out.TempC = api.TempC
		wt.Out.TempF = api.TempF
	}
	wt.Out.TempC = u.ToFixedFloat64(wt.Out.TempC, 2)
	wt.Out.TempF = u.ToFixedFloat64(wt.Out.TempF, 2)
}

type geoData struct {
	City    string  `json:"city" xml:"city,omitempty"`
	Country string  `json:"country_code" xml:"country_code,omitempty"`
	Lat     float64 `json:"latitude" xml:"latitude,omitempty"`
	Lon     float64 `json:"longitude" xml:"longitude,omitempty"`
}

func (wt *weather) getGeo(w http.ResponseWriter, r *http.Request) {
	var geo = geoData{}
	url := "https://api.codetabs.com/v1/geolocation/json?q=" + u.GetIP(r)
	resp, err := http.Get(url)
	if err != nil {
		msg := fmt.Sprint("ERROR requesting GetGeo URL")
		u.ErrorResponse(w, msg)
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&geo)
	if err != nil {
		msg := fmt.Sprint("ERROR decoding GetGeo URL")
		u.ErrorResponse(w, msg)
		return
	}
	wt.Out.City = geo.City
	wt.Out.Country = geo.Country
	wt.Out.Lat = geo.Lat
	wt.Out.Lon = geo.Lon
	wt.Out.hasLatLon = true
}

func newWeather(test bool) weather {
	wt := weather{}
	return wt
}
