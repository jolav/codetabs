package main

import (
	"encoding/json"
	"fmt"
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
	{"not domain (empty)", "/", "Bad Request", 400},
	{"not valid hostname", "/no-valid-hostname.com", "ERROR Couldn't resolve host no-valid-hostname.com", 400},
	{"not registered domain", "/sure-this-is-not-registered.com", "ERROR Couldn't resolve host sure-this-is-not-registered.com", 400},
	{"domain without redirection", "/codetabs.com", "", 200},
	{"domain with redirection", "/www.codetabs.com", "", 200},
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
			handler := http.HandlerFunc(routerHeaders)
			handler.ServeHTTP(rr, req)
			if rr.Code != test.statusCode {
				t.Errorf("%s got %v want %v", test.endpoint, rr.Code, test.statusCode)
			}
			_ = json.Unmarshal(rr.Body.Bytes(), &to)
			fmt.Println(to.StatusCode, to.Error)
			if to.Error != test.errorText {
				t.Errorf("%s got %v want %v", test.endpoint, to.Error, test.errorText)
			}
		}
	}
}
