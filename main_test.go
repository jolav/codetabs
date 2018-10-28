package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mainTestOutput struct {
	Domain     string `json:"domain"`
	Rank       int    `json:"rank"`
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
}

var mainTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"empty path", "", "ERROR Bad Request", 400},
	{"bad path", "/V1/lexa", "ERROR Bad Request, endpoint 'lexa' unknown", 400},
	{"bad path", "/v2/loc/", "ERROR Bad Request", 400},
	{"bad path", "v1", "ERROR Bad Request", 400},
	{"bad path", "v2/", "ERROR Bad Request", 400},
	{"bad path", "/hi/proxy/codetabs.com", "ERROR Bad Request", 400},
	{"bad path", "/v1/not", "ERROR Bad Request, endpoint 'not' unknown", 400},
	{"bad path", "/code%6%&tabs.com", `parse /code%6%&tabs.com: invalid URL escape "%6%"`, 400},
	//{"bad path", "", "ERROR Bad Request", 400},
}

func TestMainApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range mainTests {
		var to = mainTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			//fmt.Println(`------------------`)
			//fmt.Println(err.Error())
			//fmt.Println(test.errorText)
			//fmt.Println(`------------------`)
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
