/* */

package headers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHeadersApi(t *testing.T) {

	const (
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
	)

	h := NewHeaders(true)

	type headersTestOutput struct {
		StatusCode int    // `json:"statusCode"`
		Error      string `json:"Error,omitempty"`
	}

	var headersTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"not domain (empty)", "/v1/headers/", validFormat, 400},
		{"not valid hostname", "/v1/headers?domain=no-valid-hostname.com", "ERROR /v1/headers?domain=no-valid-hostname.com -> Couldn't resolve host no-valid-hostname.com", 400},
		{"not valid domain", "/v1/headers/?domain=no-valid-hostname.com", "ERROR /v1/headers/?domain=no-valid-hostname.com -> Couldn't resolve host no-valid-hostname.com", 400},
		{"without redirection", "/v1/headers/?domain=codetabs.com", "", 200},
		{"without redirection", "/v1/headers?domain=codetabs.com", "", 200},
		{"with redirection", "/v1/headers/?domain=www.codetabs.com", "", 200},
		{"with redirection", "/v1/headers?domain=www.codetabs.com", "", 200},
		{"with https", "/v1/headers?domain=https://codetabs.com", "", 200},
		{"with http", "/v1/headers?domain=http://codetabs.com", "", 200},
		{"with https and www", "/v1/headers?domain=https://www.codetabs.com", "", 200},
		{"with https and www", "/v1/headers?domain=http://www.codetabs.com", "", 200},
	}

	for _, test := range headersTests {
		var to = headersTestOutput{}
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
			handler := http.HandlerFunc(h.Router)
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
