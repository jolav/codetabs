/* */

package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

type weatherTestOutput struct {
	StatusCode int
	Error      string  `json:"Error,omitempty"`
	TempC      float64 `json:"tempC"`
	TempF      float64 `json:"tempF"`
	City       string  `json:"city"`
	Country    string  `json:"country"`
	Lat        float64 `json:"latitude"`
	Lon        float64 `json:"longitude"`
}

func TestWeatherApi(t *testing.T) {
	const (
		serverURL   = "http://localhost:3000"
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value'. Please read our docs at https://codetabs.com"
	)

	var weatherTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"empty", "/v1/weather", "", 406},
		{"bad city", "/v1/weather?city=notRealCity", "", 200},
		{"bad city", "/v1/weather/?city=lon%%don", validFormat, 400},
		{"incomplete", "/v1/weather?city=&format=xml", "", 406},
		{"bad", "/v1/weather/bad", validFormat, 400},
		{"local temp", "/v1/weather/", validFormat, 400},
		{"empty city", "/v1/weather?city=", "", 406},
		{"london", "/v1/weather?city=london", "", 200},
		{"new york", "/v1/weather?city=new+york", "", 200},
	}

	for _, test := range weatherTests {
		var to weatherTestOutput

		req, err := http.NewRequest("GET", fmt.Sprintf("%s%s", serverURL, test.endpoint), nil)
		if err != nil {
			t.Errorf("Error preparing request for %s: %v", test.it, err)
			continue
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("Error making request for %s: %v", test.it, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != test.statusCode {
			t.Errorf("%s got %v, expected %v", test.it, resp.StatusCode, test.statusCode)
		}

		err = json.NewDecoder(resp.Body).Decode(&to)
		if err != nil {
			t.Fatalf("Error decoding response for %s: %v", test.it, err)
		}

		if to.Error != test.errorText {
			t.Errorf("%s got '%v', expected '%v'", test.it, to.Error, test.errorText)
		}

		if test.statusCode == 200 && test.errorText == "" {
			if to.City == "" && to.TempC == 0 && to.Lat == 0 && to.Lon == 0 {
				t.Errorf("%s: incomplete or incorrect weather data", test.it)
			}
		}

		fmt.Printf("Test OK... %s\n", test.it)
	}
}
