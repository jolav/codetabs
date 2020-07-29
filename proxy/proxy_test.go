/* */

package proxy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestProxyApi(t *testing.T) {

	const (
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
	)

	p := NewProxy(true)

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
		{"JSON api", "/v1/proxy?quest=apis-v1-jolav.glitch.me/time/", "", 200},
		{"JSON api", "/v1/proxy?quest=https://geoip.xyz/v1/xml?q=codetabs.com", "", 200},
		{"image", "/v1/proxy?quest=https://jolav.me/_public/icons/jolav128.png", "", 200},
		{"empty", "/v1/proxy//", validFormat, 400},
		{"empty", "/v1/proxy/?quest=&&", validFormat, 400},
		{"empty", "/v1/proxy/?quest=codetabs.com", "", 200},
		{"empty", "/v1/proxy/?q=codetabs.com", validFormat, 400},

		{"not existing", "/v1/proxy?quest=sure-this-domain-dont-exist.com", "http://sure-this-domain-dont-exist.com is not a valid resource", 400},
		{"not a valid domain name", "/v1/proxy?quest=code%%tabs.com", validFormat, 400},
		//{"", "/v1/proxy/", "", 200},
	}

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
			handler := http.HandlerFunc(p.Router)
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
