package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

var to testoutput

type testoutput struct {
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
}

var tests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"JSON no parameters'", "/json", " is a unknown host, not a valid IP or hostname", 400},
	{"JSON valid hostname'", "/json/?q=codetabs.com", "", 200},
	{"JSON no valid hostname'", "/json/?q=code%%tabs.com", " is a unknown host, not a valid IP or hostname", 400},
	{"JSON no valid hostname", "/json?q=no-valid-hostname.com", "no-valid-hostname.com is a unknown host, not a valid IP or hostname", 400},
	{"JSON valid ip", "/json?q=208.67.222.222", "", 200},
	{"JSON valid ip", "/json?q=8.8.8.8", "", 200},
	{"JSON valid ipv6", "/json?q=2a00:1450:4006:803::200e", "", 200},
	{"JSON no valid ip", "/json?q=260.50.50.50", "260.50.50.50 is a unknown host, not a valid IP or hostname", 400},
	{"JSON no valid ip", "/json?q=20.20.-5.20", "20.20.-5.20 is a unknown host, not a valid IP or hostname", 400},
	{"XML no parameters'", "/xml", " is a unknown host, not a valid IP or hostname", 400},
	{"XML valid hostname'", "/xml/?q=codetabs.com", "", 200},
	{"XML no valid hostname'", "/xml/?q=code%%tabs.com", " is a unknown host, not a valid IP or hostname", 400},
	{"XML no valid hostname", "/xml?q=no-valid-hostname.com", "no-valid-hostname.com is a unknown host, not a valid IP or hostname", 400},
	{"XML valid ip", "/xml?q=208.67.222.222", "", 200},
	{"XML valid ip", "/xml?q=8.8.8.8", "", 200},
	{"XML valid ipv6", "/xml?q=2a00:1450:4006:803::200e", "", 200},
	{"XML no valid ip", "/xml?q=260.50.50.50", "260.50.50.50 is a unknown host, not a valid IP or hostname", 400},
	{"XML no valid ip", "/xml?q=20.20.-5.20", "20.20.-5.20 is a unknown host, not a valid IP or hostname", 400},
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
			handler := http.HandlerFunc(routerGeoIP)
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
