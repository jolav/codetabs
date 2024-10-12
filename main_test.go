/*
go test ./...
*/

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	u "github.com/jolav/codetabs/_utils"
)

func TestMainApi(t *testing.T) {

	const (
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
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
		{"empty path", "/", validFormat, 400},
		{"bad path", "", validFormat, 400},
		{"bad path", "/=)/)(&)(", validFormat, 400},
		{"bad path", "/V1/lexa", validFormat, 400},
		{"bad path", "/v2/loc/", validFormat, 400},
		{"bad path", "v1/proxy/", validFormat, 400},
		{"bad path", "v1/proxy", validFormat, 400},
		{"bad path", "V1/proxy/codetabs.com", validFormat, 400},
		{"bad path", "v2/", validFormat, 400},
		{"bad path", "/v1/v1/alexa/get/codetabs.com", validFormat, 400},
		{"bad path", "//v1/headers/codetabs.com", validFormat, 400},
		{"bad path", "/v1//headers/codetabs.com", validFormat, 400},
		{"bad path", "/v1/headers//", validFormat, 400},
		{"bad path", "/hi/proxy/codetabs.com", validFormat, 400},
		{"bad path", "/v1/not", validFormat, 400},
		{"bad path", "/code%6%&tabs.com", `parse "/code%6%&tabs.com": invalid URL escape "%6%"`, 400},
		{"bad path", "/code%%&tabs.com", `parse "/code%%&tabs.com": invalid URL escape "%%&"`, 400},
		{"bad path", "/code%%tabs.com", `parse "/code%%tabs.com": invalid URL escape "%%t"`, 400},
		{"bad path", "*%67%%%%", `parse "*%67%%%%": invalid URL escape "%%%"`, 400},
		{"bad path", "/*%67%%%%", `parse "/*%67%%%%": invalid URL escape "%%%"`, 400},
		{"bad path", "*/%67%/%%%", `parse "*/%67%/%%%": invalid URL escape "%/%"`, 400},
	}

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
			handler := http.HandlerFunc(u.BadRequest)
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
