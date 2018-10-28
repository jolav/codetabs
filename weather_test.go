package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

type weatherTestOutput struct {
	StatusCode int     // `json:"statusCode"`
	Error      string  `json:"Error,omitempty"`
	TempC      float64 `json:"tempC"`
	TempF      float64 `json:"tempF"`
	City       string  `json:"city"`
	Country    string  `json:"country"`
	Lat        float64 `json:"latitude"`
	Lon        float64 `json:"longitude"`
}

var weatherTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"empty", "/v1/weather", "ERROR Bad Request, not enough parameters", 400},
	{"bad city", "/v1/weather/temp?city=i-dont-exist", "", 200},
	{"bad city", "/v1/weather/temp?city=lon%%don", "", 200},
	{"incomplete", "/v1/weather/temp?city=", "", 200},
	{"bad", "/v1/weather/bad", "ERROR Bad Request", 400},
	{"local temp", "/v1/weather/temp", "", 200},
	{"empty city", "/v1/weather/temp?city=", "", 200},
	{"london", "/v1/weather/temp?city=london", "", 200},
	{"new york", "/v1/weather/temp?city=new york", "", 200},
}

func TestWeatherApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range weatherTests {
		var to = weatherTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		//fmt.Println(`------------------------------`)
		//fmt.Println(err.Error())
		//fmt.Println(test.errorText)
		//fmt.Println(`------------------------------`)
		if err != nil {
			if err.Error() != test.errorText {
				t.Fatalf("Error Request %s\n", err.Error())
			} else {
				pass = false
			}
		}
		if pass {
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(router)
			handler.ServeHTTP(rr, req)
			if rr.Code != test.statusCode {
				t.Errorf("%s got %v want %v\n", test.endpoint, rr.Code, test.statusCode)
			}
			_ = json.Unmarshal(rr.Body.Bytes(), &to)
			if to.Error != test.errorText {
				t.Errorf("%s got %v want %v\n", test.endpoint, to.Error, test.errorText)
			}
		}
		fmt.Printf("Test OK...%s\n", test.endpoint)
	}
}
