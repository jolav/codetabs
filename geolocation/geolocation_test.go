/* */

package geolocation

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGeoipApi(t *testing.T) {
	g := NewGeoLocation(true)

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
			handler := http.HandlerFunc(g.Router)
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
				var expected geoData
				_ = json.Unmarshal([]byte(test.expected), &expected)
				if to.geoData != expected {
					var fail string
					fail = fmt.Sprintf("\n")
					fail += fmt.Sprintf("---------- got ---------- \n")
					fail += fmt.Sprintf("%v \n", to.geoData)
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
	geoData
}

var geoipTests = []struct {
	it         string
	endpoint   string
	errorText  string
	statusCode int
	expected   string
}{
	{
		"JSON /v1/geolocation/json no parameters",
		"/v1/geolocation/json",
		" is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON valid IP /v1/geolocation/json?q=208.67.222.222",
		"/v1/geolocation/json?q=208.67.222.222",
		"",
		200,
		`{
				"ip": "208.67.222.222",
				"country_code": "GB",
				"country_name": "United Kingdom of Great Britain and Northern Ireland",
				"region_name": "England",
				"city": "London",
				"zip_code": "WC2N",
				"time_zone": "+01:00",
				"latitude": 51.50853,
				"longitude": -0.12574
			 }`,
	},
	{
		"JSON valid IP /v1/geolocation/json?q=8.8.8.8",
		"/v1/geolocation/json?q=8.8.8.8",
		"",
		200,
		`{
				"Ip": "8.8.8.8",
				"Country_code": "US",
				"Country_name": "United States of America",
				"Region_name": "California",
				"City": "Mountain View",
				"Zip_code": "94043",
				"Time_zone": "-07:00",
				"Latitude": 37.40599,
				"Longitude": -122.078514
		 }`,
	},
	{
		"JSON valid IPV6 /v1/geolocation/json?q=2a00:1450:4006:803::200e",
		"/v1/geolocation/json?q=2a00:1450:4006:803::200e",
		"",
		200,
		`{
				"ip": "2a00:1450:4006:803::200e",
				"country_code": "IE",
				"country_name": "Ireland",
				"region_name": "Dublin",
				"city": "Dublin",
				"zip_code": "D8",
				"time_zone": "+01:00",
				"latitude": 53.34399,
				"longitude": -6.26719
			 }`,
	},
	{
		"JSON invalid IP /v1/geolocation/json?q=260.50.50.50",
		"/v1/geolocation/json?q=260.50.50.50",
		"260.50.50.50 is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON invalid IP /v1/geolocation/json?q=20.20.-5.20",
		"/v1/geolocation/json?q=20.20.-5.20",
		"20.20.-5.20 is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"JSON valid Hostname /v1/geolocation/json?q=fsf.org",
		"/v1/geolocation/json?q=fsf.org",
		"",
		200,
		`{
			"Ip": "209.51.188.174",
			"Country_code": "US",
			"Country_name": "United States of America",
			"Region_name": "Massachusetts",
			"City": "Boston",
			"Zip_code": "02108",
			"Time_zone": "-04:00",
			"Latitude": 42.35843,
			"Longitude": -71.05977
		 }`,
	},
	{
		"JSON non existent Hostname /v1/geolocation/json?q=code123456tabs.com",
		"/v1/geolocation/json?q=code123456tabs.com",
		"code123456tabs.com is a unknown host, not a valid IP or hostname",
		400,
		``,
	},
	{
		"XML /v1/geolocation/xml no parameters",
		"/v1/geolocation/xml",
		"",
		400,
		`{
 "Error": " is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML valid IP /v1/geolocation/xml?q=208.67.222.222",
		"/v1/geolocation/xml?q=208.67.222.222",
		"",
		200,
		`<geoData><Ip>208.67.222.222</Ip><Country_code>GB</Country_code><Country_name>United Kingdom of Great Britain and Northern Ireland</Country_name><Region_name>England</Region_name><City>London</City><Zip_code>WC2N</Zip_code><Time_zone>+01:00</Time_zone><Latitude>51.50853</Latitude><Longitude>-0.12574</Longitude></geoData>`,
	},
	{
		"XML valid IP /v1/geolocation/xml?q=8.8.8.8",
		"/v1/geolocation/xml?q=8.8.8.8",
		``,
		200,
		"<geoData><Ip>8.8.8.8</Ip><Country_code>US</Country_code><Country_name>United States of America</Country_name><Region_name>California</Region_name><City>Mountain View</City><Zip_code>94043</Zip_code><Time_zone>-07:00</Time_zone><Latitude>37.40599</Latitude><Longitude>-122.078514</Longitude></geoData>",
	},
	{
		"XML valid IPV6 /v1/geolocation/xml?q=2a00:1450:4006:803::200e",
		"/v1/geolocation/xml?q=2a00:1450:4006:803::200e",
		``,
		200,
		"<geoData><Ip>2a00:1450:4006:803::200e</Ip><Country_code>IE</Country_code><Country_name>Ireland</Country_name><Region_name>Dublin</Region_name><City>Dublin</City><Zip_code>D8</Zip_code><Time_zone>+01:00</Time_zone><Latitude>53.34399</Latitude><Longitude>-6.26719</Longitude></geoData>",
	},
	{
		"XML invalid IP /v1/geolocation/xml?q=260.50.50.50",
		"/v1/geolocation/xml?q=260.50.50.50",
		"260.50.50.50 is a unknown host, not a valid IP or hostname",
		400,
		`{
 "Error": "260.50.50.50 is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML invalid IP /v1/geolocation/xml?q=20.20.-5.20",
		"/v1/geolocation/xml?q=20.20.-5.20",
		"20.20.-5.20 is a unknown host, not a valid IP or hostname",
		400,
		`{
 "Error": "20.20.-5.20 is a unknown host, not a valid IP or hostname"
}`,
	},
	{
		"XML valid Hostname /v1/geolocation/xml?q=fsf.org",
		"/v1/geolocation/xml?q=fsf.org",
		"",
		200,
		"<geoData><Ip>209.51.188.174</Ip><Country_code>US</Country_code><Country_name>United States of America</Country_name><Region_name>Massachusetts</Region_name><City>Boston</City><Zip_code>02108</Zip_code><Time_zone>-04:00</Time_zone><Latitude>42.35843</Latitude><Longitude>-71.05977</Longitude></geoData>",
	},
	{
		"XML non existent Hostname /v1/geolocation/xml?q=code123456tabs.com",
		"/v1/geolocation/xml?q=code123456tabs.com",
		"",
		400,
		`{
 "Error": "code123456tabs.com is a unknown host, not a valid IP or hostname"
}`,
	},
}
