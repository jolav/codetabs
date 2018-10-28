package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

type proxyTestOutput struct {
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
}

var proxyTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
}{
	{"JSON api", "/v1/proxy/apis-v1-jolav.glitch.me/time/", "", 200},
	{"JSON api", "/v1/proxy/https://geoip.xyz/v1/json", "", 200},
	{"image", "/v1/proxy/https:/jolav.me/_public/icons/jolav128.png", "", 200},
	{"empty", "/v1/proxy/", "ERROR Bad Request, not enough parameters", 400},
	{"not existing", "/v1/proxy/sure-this-domain-dont-exist.com", "http://sure-this-domain-dont-exist.com is not a valid resource", 400},
	{"not a valid domain name", "/v1/proxy/code%%tabs.com", `parse /v1/proxy/code%%tabs.com: invalid URL escape "%%t"`, 0},
	//{"", "/v1/proxy/", "", 200},
}

func TestProxyApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range proxyTests {
		var to = proxyTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			//fmt.Println(`------------------------------`)
			//fmt.Println(err.Error())
			//fmt.Println(test.errorText)
			//fmt.Println(`------------------------------`)
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
