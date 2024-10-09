/* */

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

func TestMainApi(t *testing.T) {
	const (
		serverURL = "http://localhost:3000"

		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value'. Please read our docs at https://codetabs.com"
	)

	type mainTestOutput struct {
		StatusCode int    `json:"statusCode"`
		Error      string `json:"Error,omitempty"`
	}

	var mainTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"empty path", "/", validFormat, 400},
		{"almost valid path", "/v1/weather/", validFormat, 400},
		{"bad path", "", validFormat, 400},
		{"bad path", "/=)/)(&)(", validFormat, 400},
		{"bad path", "/V1/lexa", validFormat, 400},
		{"bad path", "/v2/loc/", validFormat, 400},
		{"bad path", "/v1/v1/alexa/get/codetabs.com", validFormat, 400},
		{"bad path", "//v1/headers/codetabs.com", validFormat, 400},
		{"bad path", "/v1//headers/codetabs.com", validFormat, 400},
		{"bad path", "/v1/headers//", validFormat, 400},
		{"bad path", "/hi/proxy/codetabs.com", validFormat, 400},
		{"bad path", "/v1/not", validFormat, 400},
		{"invalid URL escape", "/code%6%&tabs.com",
			"parse \"" + serverURL + `/code%6%&tabs.com": invalid URL escape "%6%"`, 400},
		{"invalid URL escape", "/code%%&tabs.com",
			"parse \"" + serverURL + `/code%%&tabs.com": invalid URL escape "%%&"`, 400},
		{"invalid URL escape", "/code%%tabs.com",
			"parse \"" + serverURL + `/code%%tabs.com": invalid URL escape "%%t"`, 400},
		{"invalid URL escape", "*%67%%%%",
			"parse \"" + serverURL + `*%67%%%%": invalid port ":3000*%67%%%%" after host`, 400},
		{"invalid URL escape", "/*%67%%%%",
			"parse \"" + serverURL + `/*%67%%%%": invalid URL escape "%%%"`, 400},
		{"invalid URL escape", "*/%67%/%%%",
			"parse \"" + serverURL + `*/%67%/%%%": invalid port ":3000*" after host`, 400},
	}

	for _, test := range mainTests {
		var to mainTestOutput

		req, err := http.NewRequest("GET", fmt.Sprintf("%s%s", serverURL, test.endpoint), nil)
		if err != nil {
			//fmt.Println("****************")
			//fmt.Println(err.Error())
			//fmt.Println(test.errorText)
			//fmt.Println("***************")
			if err.Error() == test.errorText {

				fmt.Printf("Test OK...%s\n", test.endpoint)

				continue
			}
			t.Errorf("Error Request %s\n", err.Error())
			continue
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("Error doing request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != test.statusCode {
			t.Errorf("%s got %v want %v\n", test.endpoint, resp.StatusCode, test.statusCode)
		}

		err = json.NewDecoder(resp.Body).Decode(&to)
		if err != nil {
			t.Fatalf("Error deserializing response: %v", err)
		}

		if to.Error != test.errorText {
			t.Errorf("%s got %v want %v\n", test.endpoint, to.Error, test.errorText)
		}
		fmt.Printf("Test OK...%s\n", test.endpoint)
	}
}
