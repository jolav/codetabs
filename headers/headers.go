/* */

package headers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	h "github.com/jolav/codetabs/_utils"
)

type headersRequest struct {
	headers []map[string]string
	domain  string
}

func Router(w http.ResponseWriter, r *http.Request) {
	hr := newHeadersRequest()
	hr.domain = r.URL.Query().Get("domain")
	if hr.domain == "" {
		h.SendResponse(w, nil, http.StatusBadRequest)
		return
	}
	err := hr.doHeadersRequest(r)
	if err != nil {
		h.SendResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	h.SendResponse(w, hr.headers, http.StatusOK)
}

func (hr *headersRequest) doHeadersRequest(r *http.Request) error {
	notMoreRedirections := false
	count := 0
	const curl = "curl -fsSI "
	var curlStatus = map[string]string{
		"exit status 6": "Couldn't resolve host",
		"exit status 7": "Failed to connect to host",
		//"exit status ": "",
	}

	for !notMoreRedirections && count < 10 {
		rawData, err := h.ExecCommand(curl + hr.domain)
		if err != nil {
			msg := fmt.Sprintf("ERROR Curl Headers %s => %s %s",
				r.URL.RequestURI(),
				curlStatus[err.Error()],
				hr.domain,
			)
			log.Println(msg)
			return errors.New(curlStatus[err.Error()])
		}
		hr.headers = append(hr.headers, parseHeadString(string(rawData)))
		if hr.headers[count]["Location"] == "" {
			notMoreRedirections = true
		} else {
			hr.domain = hr.headers[count]["Location"]
		}
		count++
	}
	return nil
}

func parseHeadString(rawData string) map[string]string {
	last := ""
	myheader := make(map[string]string)
	lines := strings.Split(rawData, "\r\n")
	// protocol and status code is the first line
	name := strings.Split(lines[0], " ")[0]
	value := lines[0][len(name)+1 : len(lines[0])]
	myheader[name] = value
	for k, v := range lines {
		if len(v) > 0 && k > 0 {
			name := strings.Split(v, ": ")[0]
			value := strings.Split(v, ": ")[1]
			if name == "Location" || name == "location" {
				last = value
			} else {
				myheader[name] = value
			}
			// last line is location if exist
			if last != "" {
				myheader["Location"] = last
			}
		}
	}
	return myheader
}

func newHeadersRequest() *headersRequest {
	hr := &headersRequest{
		headers: make([]map[string]string, 0),
		domain:  "",
	}
	return hr
}
