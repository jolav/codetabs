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
	{"JSON api", "/apis-v1-jolav.glitch.me/time/", "", 200},
	{"image", `/cdn.glitch.com/c160c73d-cd9a-4c2f-aeb3-c01f00805b6c%2Fjolav128.png?1524902823082`, "", 200},
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
			handler := http.HandlerFunc(proxyURL)
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
