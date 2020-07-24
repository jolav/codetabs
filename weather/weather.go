/* */

package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	u "github.com/jolav/codetabs/_utils"
)

type weather struct{}

type weatherGeoData struct {
	IP          string `json:"ip" xml:"ip,omitempty"`
	City        string `json:"city" xml:"city,omitempty"`
	CountryCode string `json:"country_code" xml:"country_code,omitempty"`
	Lat         float64
	Lon         float64
	latString   string `json:"latitude" xml:"latitude,omitempty"`
	lonString   string `json:"longitude" xml:"longitude,omitempty"`
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

func (wt *weather) Router(w http.ResponseWriter, r *http.Request) {
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
	r.ParseForm()
	format := strings.ToLower(r.Form.Get("format"))
	city := strings.ToLower(r.Form.Get("city"))
	if format == "" {
		format = "json"
	}
	if format != "xml" && format != "json" {
		u.BadRequest(w, r)
		return
	}
	wt.doWeatherRequest(w, r, format, city)
}

func (wt *weather) doWeatherRequest(w http.ResponseWriter, r *http.Request,
	format, city string) {
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
		wt.getGeo(w, r, &o, &geo)
		if o.active {
			wt.getWeather(w, &o, &mw, &geo)
		}
	} else {
		o.City = city
		var url string
		url = "https://api.openweathermap.org/data/2.5/weather?"
		url += "q=" + city
		url += "&APPID=" + OPENWEATHER_KEY
		//fmt.Println(url)
		resp, err := http.Get(url)
		if err != nil {
			msg := fmt.Sprintf("ERROR gathering weather from city %s", city)
			u.ErrorResponse(w, msg)
			return
		}
		defer resp.Body.Close()
		decoder := json.NewDecoder(resp.Body)
		err = decoder.Decode(&mw)
		if err != nil {
			msg := fmt.Sprintf("ERROR decoding weather from city %s", city)
			u.ErrorResponse(w, msg)

			return
		}
	}

	if o.active {
		wt.prepareOutput(&o, &mw)
		if format == "xml" {
			u.SendXMLToClient(w, &o, 200)
			return
		}
		u.SendJSONToClient(w, &o, 200)
	}
}

func (wt *weather) prepareOutput(o *weatherOutput, mw *myWeatherData) {
	if mw.Main.Open == -1000 {
		o.TempC = mw.Unlocked
	} else {
		o.TempC = mw.Main.Open - 273.15
	}
	o.TempF = (9 / 5 * o.TempC) + 32
	o.TempC = u.ToFixedFloat64(o.TempC, 2)
	o.TempF = u.ToFixedFloat64(o.TempF, 2)
	o.Country = mw.Sys.Country
	o.Lat = mw.Coord.Lat
	o.Lon = mw.Coord.Lon
}

func (wt *weather) getWeather(w http.ResponseWriter, o *weatherOutput,
	mw *myWeatherData,
	geo *weatherGeoData) {
	var url string
	source := u.GetRandomInt(1, 2)
	if source == 1 { // openWeather
		url = "https://api.openweathermap.org/data/2.5/weather?"
		url += "lat=" + strconv.FormatFloat(geo.Lat, 'f', -1, 64)
		url += "&lon=" + strconv.FormatFloat(geo.Lon, 'f', -1, 64)
		url += "&APPID=" + OPENWEATHER_KEY
	} else { // weatherUnlocked
		url = "http://api.weatherunlocked.com/api/current/"
		url += strconv.FormatFloat(geo.Lat, 'f', -1, 64) + ","
		url += strconv.FormatFloat(geo.Lon, 'f', -1, 64)
		url += "?app_id=" + WEATHERUNLOCKED_APPID
		url += "&app_key=" + WEATHERUNLOCKED_KEY
		w.Header().Set("Accept", "application/json")
	}
	resp, err := http.Get(url)
	if err != nil {
		msg := fmt.Sprint("ERROR requesting GetWeather URL")
		u.ErrorResponse(w, msg)
		o.active = false
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&mw)
	if err != nil {
		msg := fmt.Sprint("ERROR decoding GetWeather URL")
		u.ErrorResponse(w, msg)
		o.active = false
		return
	}
}

func (wt *weather) getGeo(w http.ResponseWriter, r *http.Request,
	o *weatherOutput, geo *weatherGeoData) {
	url := "https://api.codetabs.com/v1/geolocation/json?q=" + u.GetIP(r)
	//fmt.Println(`URl =>`, url)
	resp, err := http.Get(url)
	if err != nil {
		msg := fmt.Sprint("ERROR requesting GetGeo URL")
		u.ErrorResponse(w, msg)
		o.active = false
		return
	}
	defer resp.Body.Close()
	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&geo)
	if err != nil {
		msg := fmt.Sprint("ERROR decoding GetGeo URL")
		u.ErrorResponse(w, msg)
		o.active = false
		return
	}
	o.City = geo.City
	o.Country = geo.CountryCode
	o.Lat = geo.Lat
	o.Lon = geo.Lon
	o.Lat, _ = strconv.ParseFloat(geo.latString, 64)
	o.Lon, _ = strconv.ParseFloat(geo.lonString, 64)
}

func NewWeather(test bool) weather {
	wt := weather{}
	return wt
}
