/* */

package ranking

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

type AlexaTestOutput struct {
	Web   string `json:"web,omitempty"`
	Rank  int    `json:"rank,omitempty"`
	Msg   string `json:"msg,omitempty"`
	Error string `json:"Error,omitempty"`
}

func TestAlexaApi(t *testing.T) {
	const (
		serverURL   = "http://localhost:3000"
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value'. Please read our docs at https://codetabs.com"
	)

	var alexaTests = []struct {
		it         string
		endpoint   string
		statusCode int
		web        string
		rank       int
		errorText  string
	}{
		{"not domain (empty)", "/v1/ranking", 400, "", 0, validFormat},
		{"not domain (empty)", "/v1/ranking/", 400, "", 0, validFormat},
		{"not valid format", "/v1/ranking//", 400, "", 0, validFormat},
		{"not valid format", "/v1/ranking/web?=codetabs.com", 400, "", 0, validFormat},
		{"not valid format", "/v1/ranking?we=codetabs.com", 400, "", 0, validFormat},
		{"valid domain", "/v1/ranking?alexa=google.com", 200, "google.com", 1, ""},
		{"valid domain www subdomain", "/v1/ranking?alexa=wWW.gOOgle.CoM", 200, "www.google.com", 1, ""},
		{"valid domain multiple results", "/v1/ranking?alexa=gov.uk", 200, "gov.uk", 10, ""},
		{"valid domain not in alexa top 1m", "/v1/ranking?alexa=not-top-domain.com", 200, "not-top-domain.com", 0, "not-top-domain.com not in alexa top 1 million"},
	}

	for _, test := range alexaTests {
		var to AlexaTestOutput

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
			t.Errorf("%s got status %v, expected %v", test.it, resp.StatusCode, test.statusCode)
		}

		err = json.NewDecoder(resp.Body).Decode(&to)
		if err != nil {
			t.Fatalf("Error decoding response for %s: %v", test.it, err)
		}

		if resp.StatusCode == 200 && to.Web != test.web {
			t.Errorf("%s got web '%v', expected '%v'", test.it, to.Web, test.web)
		}

		if resp.StatusCode == 200 && to.Rank != test.rank {
			if to.Rank < 0 || to.Rank > 864552 {
				t.Errorf("%s got rank '%v', expected '%v'", test.it, to.Rank, test.rank)
			}
		}

		if resp.StatusCode == 400 && to.Error != test.errorText {
			t.Errorf("%s got error '%v', expected '%v'", test.it, to.Error, test.errorText)
		}

		fmt.Printf("Test OK... %s\n", test.it)
	}
}
