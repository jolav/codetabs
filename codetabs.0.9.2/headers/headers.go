/* */

package headers

import (
	"fmt"
	"net/http"
	"strings"

	u "github.com/jolav/codetabs/_utils"
)

type headersRequest struct {
	headers
	domain string
}

type headers []header

type header map[string]string

func Router(w http.ResponseWriter, r *http.Request) {
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		u.BadRequest(w, r)
		return
	}
	hr := newHeadersRequest(false)
	r.ParseForm()
	hr.domain = r.Form.Get("domain")
	if hr.domain == "" || len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	hr.doHeadersRequest(w, r)
}

func (hr *headersRequest) doHeadersRequest(
	w http.ResponseWriter, r *http.Request) {
	notMoreRedirections := false
	count := 0
	const curl = "curl -fsSI "
	var curlStatus = map[string]string{
		"exit status 6": "Couldn't resolve host",
		"exit status 7": "Failed to connect to host",
		//"exit status ": "",
	}

	for !notMoreRedirections && count < 10 {
		rawData, err := u.GenericCommandSH(curl + hr.domain)
		if err != nil {
			msg := fmt.Sprintf("ERROR %s -> %s %s",
				r.URL.RequestURI(),
				curlStatus[err.Error()],
				hr.domain,
			)
			u.ErrorResponse(w, msg)
			return
		}
		parseHeadString(string(rawData), &hr.headers)
		if hr.headers[count]["Location"] == "" {
			notMoreRedirections = true
			//fmt.Println(`No more redirections`)
		} else {
			hr.domain = hr.headers[count]["Location"]
			//fmt.Println(`Redirecting to ... `, domain)
		}
		count++
	}

	u.SendJSONToClient(w, hr.headers, 200)
	return
}

func parseHeadString(rawData string, hs *headers) {
	last := ""
	myheader := make(map[string]string)
	//fmt.Println("PARSE => \n", rawData)
	lines := strings.Split(rawData, "\r\n")
	// protocol and status code is the first line
	name := strings.Split(lines[0], " ")[0]
	value := lines[0][len(name)+1 : len(lines[0])]
	myheader[name] = value
	for k, v := range lines {
		if len(v) > 0 && k > 0 {
			//fmt.Println(k, len(v))
			name := strings.Split(v, ": ")[0]
			value := strings.Split(v, ": ")[1]
			//fmt.Println(`******`, name, value)
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
	*hs = append(*hs, myheader)
}

func newHeadersRequest(test bool) headersRequest {
	hr := headersRequest{
		headers: []header{},
		domain:  "",
	}
	return hr
}
