package random

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

// Estructura para manejar la respuesta JSON de la API
type RandomTestOutput struct {
	Quest string `json:"quest,omitempty"`
	Data  []int  `json:"data,omitempty"`
	Msg   string `json:"msg,omitempty"`
	Error string `json:"Error,omitempty"`
}

func TestRandomApi(t *testing.T) {
	const (
		serverURL   = "http://localhost:3000"
		validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value'. Please read our docs at https://codetabs.com"
	)

	var randomTests = []struct {
		it         string
		endpoint   string
		statusCode int
		quest      string
		dataLen    int
		msg        string
		errorText  string
	}{
		// Tests /v1/random/name
		{"get random name", "/v1/random/name", 200,
			"Random Name", 0, "", ""},
		{"404 route not found", "/v1/random", 400,
			"", 0, "", validFormat},
		{"bad request for invalid random endpoint", "/v1/random/inte", 400,
			"", 0, "", validFormat},

		// Tests /v1/random/integer
		{"get random integer", "/v1/random/integer?min=1&max=10", 200,
			"Random Integer between 1-10", 1, "", ""},
		{"get multiple integers", "/v1/random/integer?min=1&max=10&times=5", 200,
			"5 Random Integers between 1-10", 5, "", ""},
		{"bad request times <1", "/v1/random/integer?min=1&max=10&times=-5", 400,
			"", 0, "", validFormat},
		{"bad request invalid min", "/v1/random/integer?min=-1&max=10", 400,
			"", 0, "", validFormat},
		{"bad request max less than min", "/v1/random/integer?min=10&max=1", 400, "", 0, "", validFormat},

		// Tests /v1/random/list
		{"get randomized list", "/v1/random/list?len=5", 200, "Randomized order list with 5 elements", 5, "", ""},
		{"bad request for list length too small", "/v1/random/list?len=1", 400, "", 0, "", validFormat},
		{"bad request for list length too large", "/v1/random/list?len=10001", 400, "", 0, "", validFormat},
	}

	for _, test := range randomTests {
		var to RandomTestOutput

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

		if resp.StatusCode == 200 && to.Quest != test.quest {
			t.Errorf("%s got quest '%v', expected '%v'", test.it, to.Quest, test.quest)
		}

		if resp.StatusCode == 200 && len(to.Data) != test.dataLen {
			t.Errorf("%s got data length %v, expected %v", test.it, len(to.Data), test.dataLen)
		}

		if resp.StatusCode == 400 && to.Error != test.errorText {
			t.Errorf("%s got error '%v', expected '%v'", test.it, to.Error, test.errorText)
		}

		if test.msg != "" && to.Msg != test.msg {
			t.Errorf("%s got msg '%v', expected '%v'", test.it, to.Msg, test.msg)
		}

		fmt.Printf("Test OK... %s\n", test.it)
	}
}
