package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	lib "./_lib"
)

func doWeatherRequest(w http.ResponseWriter, r *http.Request, f, city string) {
	var geo = weatherGeoData{}
	o := weatherOutput{
		active: true,
	}
	mw := myWeatherData{
		Unlocked: -1000,
		Main: struct {
			Open float64 `json:"temp,omitempty"`
		}{
			Open: -1000,
		},
	}
	if city == "" {
		getGeo(w, r, &o, &geo)
		if o.active {
			getWeather(w, &o, &mw, &geo)
		}
	} else {
		o.City = city
		var url string
		url = "https://api.openweathermap.org/data/2.5/weather?"
		url += "q=" + city
		url += "&APPID=" + g.OpenWeather.Key
		//fmt.Println(url)
		resp, err := http.Get(url)
		if err != nil {
			e.Error = fmt.Sprintf("ERROR gathering weather from city %s", city)
			log.Printf(e.Error + "\n" + err.Error())
			lib.SendErrorToClient(w, e)
			return
		}
		defer resp.Body.Close()
		decoder := json.NewDecoder(resp.Body)
		err = decoder.Decode(&mw)
		if err != nil {
			e.Error = fmt.Sprintf("ERROR decoding weather from city %s", city)
			log.Printf(e.Error + "\n" + err.Error())
			lib.SendErrorToClient(w, e)
			return
		}
	}

	if o.active {
		prepareOutput(&o, &mw)
		if f == "xml" {
			lib.SendXMLToClient(w, &o)
			return
		}
		lib.SendJSONToClient(w, &o)
	}
}

func prepareOutput(o *weatherOutput, mw *myWeatherData) {
	if mw.Main.Open == -1000 {
		o.TempC = mw.Unlocked
	} else {
		o.TempC = mw.Main.Open - 273.15
	}
	o.TempF = (9 / 5 * o.TempC) + 32
	o.TempC = lib.ToFixedFloat64(o.TempC, 2)
	o.TempF = lib.ToFixedFloat64(o.TempF, 2)
	o.Country = mw.Sys.Country
	o.Lat = mw.Coord.Lat
	o.Lon = mw.Coord.Lon
}

func getWeather(w http.ResponseWriter, o *weatherOutput, mw *myWeatherData,
	geo *weatherGeoData) {
	var url string
	source := lib.GetRandomInt(1, 2)
	if source == 1 { // openWeather
		url = "https://api.openweathermap.org/data/2.5/weather?"
		url += "lat=" + strconv.FormatFloat(geo.Lat, 'f', -1, 64)
		url += "&lon=" + strconv.FormatFloat(geo.Lon, 'f', -1, 64)
		url += "&APPID=" + g.OpenWeather.Key
	} else { // weatherUnlocked
		url = "http://api.weatherunlocked.com/api/current/"
		url += strconv.FormatFloat(geo.Lat, 'f', -1, 64) + ","
		url += strconv.FormatFloat(geo.Lon, 'f', -1, 64)
		url += "?app_id=" + g.WeatherUnlocked.AppID
		url += "&app_key=" + g.WeatherUnlocked.Key
		w.Header().Set("Accept", "application/json")
	}
	resp, err := http.Get(url)
	if err != nil {
		e.Error = fmt.Sprint("ERROR requesting GetWeather URL")
		log.Printf(e.Error + "\n" + err.Error())
		lib.SendErrorToClient(w, e)
		o.active = false
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&mw)
	if err != nil {
		e.Error = fmt.Sprint("ERROR decoding GetWeather URL")
		log.Printf(e.Error + "\n" + err.Error())
		lib.SendErrorToClient(w, e)
		o.active = false
		return
	}
}

func getGeo(w http.ResponseWriter, r *http.Request, o *weatherOutput,
	geo *weatherGeoData) {
	url := "https://geoip.xyz/v1/json?q=" + lib.GetIP(r)
	//fmt.Println(`URl =>`, url)
	resp, err := http.Get(url)
	if err != nil {
		e.Error = fmt.Sprint("ERROR requesting GetGeo URL")
		log.Printf(e.Error + "\n" + err.Error())
		lib.SendErrorToClient(w, e)
		o.active = false
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&geo)
	if err != nil {
		e.Error = fmt.Sprint("ERROR decoding GetGeo URL")
		log.Printf(e.Error + "\n" + err.Error())
		lib.SendErrorToClient(w, e)
		o.active = false
		return
	}
	o.City = geo.City
	o.Country = geo.CountryCode
	o.Lat = geo.Lat
	o.Lon = geo.Lon
}
