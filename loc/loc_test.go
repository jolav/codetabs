/* */

package loc

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLocApi(t *testing.T) {

	l := NewLoc(true)

	type locTestOutput struct {
		Domain     string `json:"domain"`
		Rank       int    `json:"rank"`
		StatusCode int    // `json:"statusCode"`
		Error      string `json:"Error,omitempty"`
	}

	var locTests = []struct {
		it         string
		endpoint   string
		errorText  string
		statusCode int
	}{
		{"empty", "/v1/loc", "Incorrect user/repo", 400},   // unless upload
		{"empty", "/v1/loc/", "Incorrect user/repo", 400},  // unless upload
		{"empty", "/v1/loc//", "Incorrect user/repo", 400}, // unless upload
		{"bad user/repo", "/v1/loc?repo=", "Incorrect user/repo", 400},
		{"bad user/repo", "/v1/loc?repo=/", "Incorrect user/repo", 400},
		{"bad user/repo", "/v1/loc?repo=jolav/", "Incorrect user/repo", 400},
		{"bad user/repo", "/v1/loc?repo=/codetabs", "Incorrect user/repo", 400},
		{"bad user/repo", "/v1/loc?repo=/jolav/codetabs/another", "Incorrect user/repo", 400},
	}

	for _, test := range locTests {
		var to = locTestOutput{}
		pass := true
		//fmt.Println(`Test...`, test.endpoint, "...", test.it)
		req, err := http.NewRequest("GET", test.endpoint, nil)
		if err != nil {
			//fmt.Println(`------------------------------`)
			//fmt.Println(err.Error())
			//fmt.Println(test.errorText)
			//fmt.Println(`------------------------------`)
			if err.Error() != test.errorText {
				t.Errorf("Error Request %s\n", err.Error())
			} else {
				pass = false
			}
		}
		if pass {
			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(l.Router)
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
