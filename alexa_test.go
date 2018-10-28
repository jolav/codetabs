package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

type alexaTestOutput struct {
	Domain     string `json:"domain"`
	Rank       int    `json:"rank"`
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
}

var alexaTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"not domain(empty)", "/v1/alexa/get", "ERROR Bad Request, incorrect parameters", 400},
	{"wrong domain", "/v1/alexa/wrong", "ERROR Bad Request, incorrect parameters", 400},
	{"wrong domain", "/v1/alexa/too/much/parameters", "ERROR Bad Request, incorrect parameters", 400},
	{"not a valid domain name", "/v1/alexa/get/code%%tabs.com", `parse /v1/alexa/get/code%%tabs.com: invalid URL escape "%%t"`, 0},
	{"domain in routes parameters", "/v1/alexa/get/google.com", "", 200},
	{"www.github.com", "/v1/alexa/get/www.github.com", "", 200},
	{"github.com", "/v1/alexa/get/github.com", "", 200},
	{"valid domain not in alexa top 1m", "/v1/alexa/get/not-top-domain.com", "not-top-domain.com not in alexa top 1 million", 400},
	{"awwwards.com ,www in the middle of the domain", "/v1/alexa/get/awwwards.com", "", 200},
	{"progresswww.nl ,www at the end of the domain", "/v1/alexa/get/progresswww.nl", "", 200},
	{"www.gov.uk ,www as subdomain", "/v1/alexa/get/www.gov.uk", "", 200},
	{"gov.uk ,multiple results", "/v1/alexa/get/gov.uk", "", 200},
	{"www.nic.in ,www as subdomain", "/v1/alexa/get/www.nic.in", "", 200},
	{"bih.nic.in ,not www subdomain in multiple results", "/v1/alexa/get/bih.nic.in", "", 200},
	{"nic.in ,multiple results", "/v1/alexa/get/nic.in", "", 200},
}

func TestAlexaApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range alexaTests {
		var to = alexaTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			//fmt.Println(`------------------------------`)
			//fmt.Println(err.Error())
			//fmt.Println(test.errorText)
			//fmt.Println(`------------------------------`)
			if err.Error() != test.errorText {
				t.Errorf("Error Request %s\n", err.Error())
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
