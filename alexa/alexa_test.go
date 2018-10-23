package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

var to testoutput

type testoutput struct {
	Domain     string `json:"domain"`
	Rank       int    `json:"rank"`
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
}

var tests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"not domain(empty)", "/get", "Bad Request", 400},
	{"not a valid domain name", "/get/code%%tabs.com", `parse /get/code%%tabs.com: invalid URL escape "%%t"`, 0},
	{"domain in routes parameters", "/get/google.com", "", 200},
	{"www.github.com", "/get/www.github.com", "", 200},
	{"github.com", "/get/github.com", "", 200},
	{"valid domain not in alexa top 1m", "/get/not-top-domain.com", "not-top-domain.com not in alexa top 1 million", 400},
	{"awwwards.com ,www in the middle of the domain", "/get/awwwards.com", "", 200},
	{"progresswww.nl ,www at the end of the domain", "/get/progresswww.nl", "", 200},
	{"www.gov.uk ,www as subdomain", "/get/www.gov.uk", "", 200},
	{"gov.uk ,multiple results", "/get/gov.uk", "", 200},
	{"www.nic.in ,www as subdomain", "/get/www.nic.in", "", 200},
	{"bih.nic.in ,not www subdomain in multiple results", "/get/bih.nic.in", "", 200},
	{"nic.in ,multiple results", "/get/nic.in", "", 200},
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
			handler := http.HandlerFunc(routerAlexa)
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
