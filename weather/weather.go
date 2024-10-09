/* */

package weather

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"

	h "github.com/jolav/codetabs/_utils"
)

type myData struct {
	City    string  `json:"city"`
	Country string  `json:"country"`
	Lat     float64 `json:"lat"`
	Lon     float64 `json:"lon"`
	TempC   float64 `json:"tempC"`
	TempF   float64 `json:"tempF"`
}

func Router(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")

	if city == "" {
		var err error
		city, err = getCityFromGeo(r)
		if err != nil {
			log.Println(err)
			h.SendResponse(w, err, http.StatusNotAcceptable)
			return
		}
	}
	myData, err := cityToTemp(city)
	if err != nil {
		log.Println(err)
		h.SendResponse(w, err, http.StatusNotAcceptable)
		return
	}
	h.SendResponse(w, myData, http.StatusOK)
}

func getCityFromGeo(r *http.Request) (string, error) {
	ip := h.GetIP(r)
	/*if ip == "127.0.0.1" || ip == "localhost" {
		ip = "8.8.8.8"
	}*/
	path := fmt.Sprintf("http://localhost:%d/v1/geolocation/json?q=%s", PORT, ip)
	fmt.Println(path)
	g := struct {
		City string `json:"city"`
	}{
		City: "",
	}
	err := h.FetchGET(path, &g)
	if err != nil {
		err := fmt.Sprintf("ERROR Weather Geolocation => %v", err)
		return "", errors.New(err)
	}
	return g.City, nil
}

func cityToTemp(city string) (myData, error) {
	u, err := url.Parse(BASE_URL)
	if err != nil {
		err := fmt.Sprintf("ERROR Parsing URL => %v", err)
		return myData{}, errors.New(err)
	}
	params := url.Values{
		"key": {API_KEY},
		"aqi": {"no"},
		"q":   {city},
	}
	u.RawQuery = params.Encode()
	path := u.String()

	fd := &fullData{}

	err = h.FetchGET(path, fd)
	if err != nil {
		err := fmt.Sprintf("ERROR Weather API => %v", err)
		return myData{}, errors.New(err)
	}
	md := myData{
		City:    city,
		Country: fd.Location.Country,
		Lat:     fd.Location.Lat,
		Lon:     fd.Location.Lon,
		TempC:   fd.Current.TempC,
		TempF:   fd.Current.TempF,
	}
	return md, nil
}

type fullData struct {
	Location struct {
		//Name string `json:"name"`
		// Region         string  `json:"region"`
		Country string  `json:"country"`
		Lat     float64 `json:"lat"`
		Lon     float64 `json:"lon"`
		// TzID           string  `json:"tz_id"`
		// LocaltimeEpoch int     `json:"localtime_epoch"`
		// Localtime      string  `json:"localtime"`
	} `json:"location"`
	Current struct {
		// LastUpdatedEpoch int     `json:"last_updated_epoch"`
		// LastUpdated      string  `json:"last_updated"`
		TempC float64 `json:"temp_c"`
		TempF float64 `json:"temp_f"`
		// IsDay            int     `json:"is_day"`
		// Condition        struct {
		//		Text string `json:"text"`
		//		Icon string `json:"icon"`
		//		Code int    `json:"code"`
		// } `json:"condition"`
		// WindMph    float64 `json:"wind_mph"`
		// WindKph    float64 `json:"wind_kph"`
		// WindDegree int     `json:"wind_degree"`
		// WindDir    string  `json:"wind_dir"`
		// PressureMb float64 `json:"pressure_mb"`
		// PressureIn float64 `json:"pressure_in"`
		// PrecipMm   float64 `json:"precip_mm"`
		// PrecipIn   float64 `json:"precip_in"`
		// Humidity   int     `json:"humidity"`
		// Cloud      int     `json:"cloud"`
		// FeelslikeC float64 `json:"feelslike_c"`
		// FeelslikeF float64 `json:"feelslike_f"`
		// WindchillC float64 `json:"windchill_c"`
		// WindchillF float64 `json:"windchill_f"`
		// HeatindexC float64 `json:"heatindex_c"`
		// HeatindexF float64 `json:"heatindex_f"`
		// DewpointC  float64 `json:"dewpoint_c"`
		// DewpointF  float64 `json:"dewpoint_f"`
		// VisKm      float64 `json:"vis_km"`
		// VisMiles   float64 `json:"vis_miles"`
		// Uv         float64 `json:"uv"`
		// GustMph    float64 `json:"gust_mph"`
		// GustKph    float64 `json:"gust_kph"`
	} `json:"current"`
}
