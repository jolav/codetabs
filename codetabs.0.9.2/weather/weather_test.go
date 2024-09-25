/* */

package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWeatherApi(t *testing.T) {

	const (
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
	)

	w := NewWeather(true)

	type weatherTestOutput struct {
		StatusCode int     // `json:"statusCode"`
		Error      string  `json:"Error,omitempty"`
		TempC      float64 `json:"tempC"`
		TempF      float64 `json:"tempF"`
		City       string  `json:"city"`
		Country    string  `json:"country"`
		Lat        float64 `json:"latitude"`
		Lon        float64 `json:"longitude"`
	}

	var weatherTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"empty", "/v1/weather", "", 200},
		{"bad city", "/v1/weather?city=i-dont-exist", "", 200},
		{"bad city", "/v1/weather/?city=lon%%don", "", 200},
		{"incomplete", "/v1/weather/?city=&format=xml", "", 200},
		{"bad", "/v1/weather/bad", validFormat, 400},
		{"local temp", "/v1/weather/", "", 200},
		{"empty city", "/v1/weather/?city=", "", 200},
		{"london", "/v1/weather/?city=london", "", 200},
		{"new york", "/v1/weather?city=new york", "", 200},
		{"", "/v1/weather?format=json", "", 200},
		{"", "/v1/weather?format=invalid", validFormat, 400},
		{"", "/v1/weather?format=xml", "", 200},
		//{"", "/v1/weather", "", 00},
	}

	for _, test := range weatherTests {
		var to = weatherTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		//fmt.Println(`------------------------------`)
		//fmt.Println(err.Error())
		//fmt.Println(test.errorText)
		//fmt.Println(`------------------------------`)
		if err != nil {
			if err.Error() != test.errorText {
				t.Fatalf("Error Request %s\n", err.Error())
			} else {
				pass = false
			}
		}
		if pass {
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(w.Router)
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
