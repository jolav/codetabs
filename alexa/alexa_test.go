/* */

package alexa

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAlexaApi(t *testing.T) {

	const (
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
	)

	a := NewAlexa(true)

	type alexaTestOutput struct {
		Domain     string `json:"domain"`
		Rank       int    `json:"rank"`
		StatusCode int    `json:"statusCode"`
		Error      string `json:"Error,omitempty"`
	}

	var alexaTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"not domain(empty)", "/v1/alexa", validFormat, 400},
		{"not domain(empty)", "/v1/alexa/", validFormat, 400},
		{"not valid format", "/v1/alexa//", validFormat, 400},
		{"not valid format", "/v1/alexa/&%$/wrong", `parse "/v1/alexa/&%$/wrong": invalid URL escape "%$/"`, 400},
		{"not valid format", "/v1/alexa/web?=codetabs.com", validFormat, 400},
		{"not valid format", "/v1/alexa?we=codetabs.com", validFormat, 400},
		{"not valid format", "/v1/alexa/too/much/parameters", validFormat, 400},
		{"not a valid domain name", "/v1/alexa?web=code%%tabs.com", validFormat, 400},
		{"domain in routes parameters", "/v1/alexa?web=google.com", "", 200},
		{"www.github.com", "/v1/alexa?web=www.github.com", "", 200},
		{"github.com", "/v1/alexa?web=github.com", "", 200},
		{"valid domain not in alexa top 1m", "/v1/alexa?web=not-top-domain.com", "not-top-domain.com not in alexa top 1 million", 400},
		{"awwwards.com ,www in the middle of the domain", "/v1/alexa?web=awwwards.com", "", 200},
		{"progresswww.nl ,www at the end of the domain", "/v1/alexa?web=progresswww.nl", "", 200},
		{"www.gov.uk ,www as subdomain", "/v1/alexa?web=www.gov.uk", "", 200},
		{"gov.uk ,multiple results", "/v1/alexa?web=gov.uk", "", 200},
		{"www.nic.in ,www as subdomain", "/v1/alexa?web=www.nic.in", "", 200},
		{"bih.nic.in ,not www subdomain in multiple results", "/v1/alexa?web=bih.nic.in", "", 200},
		{"nic.in ,multiple results", "/v1/alexa?web=nic.in", "", 200},
	}

	for _, test := range alexaTests {
		var to = alexaTestOutput{}
		pass := true
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			if err.Error() != test.errorText {
				t.Errorf("Error Request %s\n", err.Error())
			} else {
				pass = false
			}
		}
		if pass {
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(a.Router)

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
