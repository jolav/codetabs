package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

var to testoutput

type testoutput struct {
	StatusCode int     // `json:"statusCode"`
	Error      string  `json:"Error,omitempty"`
	TempC      float64 `json:"tempC"`
	TempF      float64 `json:"tempF"`
	City       string  `json:"city"`
	Country    string  `json:"country"`
	Lat        float64 `json:"latitude"`
	Lon        float64 `json:"longitude"`
}

var tests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"local temp", "/temp", "", 200},
	{"empty city", "/temp?city=", "", 200},
	{"london", "/temp?city=london", "", 200},
	{"new york", "/temp?city=new york", "", 200},
}

func TestAlexaApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range tests {
		var to = testoutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			if err.Error() != test.errorText {
				t.Fatalf("Error Request %s", err.Error())
			} else {
				pass = false
			}
		}
		if pass {
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(RouterWeather)
			handler.ServeHTTP(rr, req)
			if rr.Code != test.statusCode {
				t.Errorf("%s got %v want %v", test.endpoint, rr.Code, test.statusCode)
			}
			_ = json.Unmarshal(rr.Body.Bytes(), &to)
			if to.Error != test.errorText {
				t.Errorf("%s got %v want %v", test.endpoint, to.Error, test.errorText)
			}
		}
	}
}
