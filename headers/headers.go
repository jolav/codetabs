/* */

package headers

import (
	"fmt"
	"net/http"
	"strings"

	u "github.com/jolav/codetabs/_utils"
)

type headers []header

type header map[string]string

func (h *headers) Router(w http.ResponseWriter, r *http.Request) {
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
	r.ParseForm()
	domain := r.Form.Get("domain")
	if domain == "" || len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	doHeadersRequest(w, r, domain)
}

func doHeadersRequest(w http.ResponseWriter, r *http.Request, domain string) {
	hs := headers{}
	notMoreRedirections := false
	count := 0
	const curl = "curl -fsSI "
	var curlStatus = map[string]string{
		"exit status 6": "Couldn't resolve host",
		"exit status 7": "Failed to connect to host",
		//"exit status ": "",
	}

	for !notMoreRedirections && count < 10 {
		rawData, err := u.GenericCommandSH(curl + domain)
		if err != nil {
			msg := fmt.Sprintf("ERROR %s -> %s %s",
				r.URL.RequestURI(),
				curlStatus[err.Error()],
				domain,
			)
			u.ErrorResponse(w, msg)
			return
		}
		parseHeadString(string(rawData), &hs)
		if hs[count]["Location"] == "" {
			notMoreRedirections = true
			//fmt.Println(`No more redirections`)
		} else {
			domain = hs[count]["Location"]
			//fmt.Println(`Redirecting to ... `, domain)
		}
		count++
	}

	u.SendJSONToClient(w, hs, 200)
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

func NewHeaders(test bool) headers {
	h := headers{}
	return h
}
