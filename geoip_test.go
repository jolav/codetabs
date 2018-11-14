package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGeoipApi(t *testing.T) {
	c.App.Mode = "test"

	for _, test := range geoipTests {
		var to = geoipTestOutput{}
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

			class := strings.Split(test.it, " ")[0]

			if class == "JSON" {
				_ = json.Unmarshal(rr.Body.Bytes(), &to)
				if to.Error != test.errorText {
					t.Errorf("%s got %v want %v\n", test.endpoint, to.Error, test.errorText)
				}
				var expected geoipOutput
				_ = json.Unmarshal([]byte(test.expected), &expected)
				if to.geoipOutput != expected {
					var fail string
					fail = fmt.Sprintf("\n")
					fail += fmt.Sprintf("---------- got ---------- \n")
					fail += fmt.Sprintf("%v \n", to.geoipOutput)
					fail += fmt.Sprintf("---------- want ---------- \n")
					fail += fmt.Sprintf("%v \n", expected)
					fail += fmt.Sprintf("------------------------- \n")
					t.Error(fail)
				}
			}

			if class == "XML" {
				if string(rr.Body.Bytes()) != test.expected {
					var fail string
					fail = fmt.Sprintf("\n")
					fail += fmt.Sprintf("---------- got ---------- \n")
					fail += fmt.Sprintf("%s \n", string(rr.Body.Bytes()))
					fail += fmt.Sprintf("---------- want ---------- \n")
					fail += fmt.Sprintf("%s \n", test.expected)
					fail += fmt.Sprintf("------------------------- \n")
					t.Error(fail)
				}
			}
		}
		fmt.Printf("Test OK...%s\n", test.endpoint)
	}
}

type geoipTestOutput struct {
	StatusCode int    // `json:"statusCode"`
	Error      string `json:"Error,omitempty"`
	geoipOutput
}

var geoipTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
	expected   string
}{
	{
		"JSON /v1/geoip/json no parameters",
		"/v1/geoip/json",
		" is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON valid IP /v1/geoip/json?q=208.67.222.222",
		"/v1/geoip/json?q=208.67.222.222",
		"",
		200,
		`{
			"ip": "208.67.222.222",
			"country_code": "US",
			"country_name": "United States",
			"region_code": "NY",
			"region_name": "New York",
			"city": "Howard Beach",
			"zip_code": "11414",
			"time_zone": "America/New_York",
			"latitude": 40.6588,
			"longitude": -73.8438
		 }`,
	},
	{
		"JSON valid IP /v1/geoip/json?q=8.8.8.8",
		"/v1/geoip/json?q=8.8.8.8",
		"",
		200,
		`{
			"ip": "8.8.8.8",
			"country_code": "US",
			"country_name": "United States",
			"region_code": "",
			"region_name": "",
			"city": "",
			"zip_code": "",
			"time_zone": "",
			"latitude": 37.751,
			"longitude": -97.822
		 }`,
	},
	{
		"JSON valid IPV6 /v1/geoip/json?q=2a00:1450:4006:803::200e",
		"/v1/geoip/json?q=2a00:1450:4006:803::200e",
		"",
		200,
		`{
			"ip": "2a00:1450:4006:803::200e",
			"country_code": "IE",
			"country_name": "Ireland",
			"region_code": "",
			"region_name": "",
			"city": "",
			"zip_code": "",
			"time_zone": "Europe/Dublin",
			"latitude": 53,
			"longitude": -8
		 }`,
	},
	{
		"JSON invalid IP /v1/geoip/json?q=260.50.50.50",
		"/v1/geoip/json?q=260.50.50.50",
		"260.50.50.50 is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON invalid IP /v1/geoip/json?q=20.20.-5.20",
		"/v1/geoip/json?q=20.20.-5.20",
		"20.20.-5.20 is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON valid Hostname /v1/geoip/json?q=codetabs.com",
		"/v1/geoip/json?q=codetabs.com",
		"",
		200,
		`{
			"ip": "62.210.192.107",
			"country_code": "FR",
			"country_name": "France",
			"region_code": "",
			"region_name": "",
			"city": "",
			"zip_code": "",
			"time_zone": "Europe/Paris",
			"latitude": 48.8581,
			"longitude": 2.3387
		 }`,
	},
	{
		"JSON non existent Hostname /v1/geoip/json?q=code123456tabs.com",
		"/v1/geoip/json?q=code123456tabs.com",
		"code123456tabs.com is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"XML /v1/geoip/xml no parameters",
		"/v1/geoip/xml",
		"",
		400,
		`{
 "Error": " is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML valid IP /v1/geoip/xml?q=208.67.222.222",
		"/v1/geoip/xml?q=208.67.222.222",
		"",
		200,
		`<geoipOutput><ip>208.67.222.222</ip><country_code>US</country_code><country_name>United States</country_name><region_code>NY</region_code><region_name>New York</region_name><city>Howard Beach</city><zip_code>11414</zip_code><time_zone>America/New_York</time_zone><latitude>40.6588</latitude><longitude>-73.8438</longitude></geoipOutput>`,
	},
	{
		"XML valid IP /v1/geoip/xml?q=8.8.8.8",
		"/v1/geoip/xml?q=8.8.8.8",
		``,
		200,
		"<geoipOutput><ip>8.8.8.8</ip><country_code>US</country_code><country_name>United States</country_name><latitude>37.751</latitude><longitude>-97.822</longitude></geoipOutput>",
	},
	{
		"XML valid IPV6 /v1/geoip/xml?q=2a00:1450:4006:803::200e",
		"/v1/geoip/xml?q=2a00:1450:4006:803::200e",
		``,
		200,
		"<geoipOutput><ip>2a00:1450:4006:803::200e</ip><country_code>IE</country_code><country_name>Ireland</country_name><time_zone>Europe/Dublin</time_zone><latitude>53</latitude><longitude>-8</longitude></geoipOutput>",
	},
	{
		"XML invalid IP /v1/geoip/xml?q=260.50.50.50",
		"/v1/geoip/xml?q=260.50.50.50",
		"260.50.50.50 is a unknown host, not a valid IP or hostname",
		400,
		`{
 "Error": "260.50.50.50 is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML invalid IP /v1/geoip/xml?q=20.20.-5.20",
		"/v1/geoip/xml?q=20.20.-5.20",
		"20.20.-5.20 is a unknown host, not a valid IP or hostname",
		400,
		`{
 "Error": "20.20.-5.20 is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML valid Hostname /v1/geoip/xml?q=codetabs.com",
		"/v1/geoip/xml?q=codetabs.com",
		"",
		200,
		"<geoipOutput><ip>62.210.192.107</ip><country_code>FR</country_code><country_name>France</country_name><time_zone>Europe/Paris</time_zone><latitude>48.8581</latitude><longitude>2.3387</longitude></geoipOutput>",
	},
	{
		"XML non existent Hostname /v1/geoip/xml?q=code123456tabs.com",
		"/v1/geoip/xml?q=code123456tabs.com",
		"",
		400,
		`{
 "Error": "code123456tabs.com is a unknown host, not a valid IP or hostname"
}`,
	},
}
