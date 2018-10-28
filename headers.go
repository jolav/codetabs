package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	lib "./_lib"
)

func doHeadersRequest(w http.ResponseWriter, domain string) {
	hs := []header{}
	notMoreRedirections := false
	count := 0
	const curl = "curl -fsSI "
	var curlStatus = map[string]string{
		"exit status 6": "Couldn't resolve host",
		"exit status 7": "Failed to connect to host",
		//"exit status ": "",
	}

	for !notMoreRedirections && count < 10 {
		rawData, err := lib.GenericCommandSH(curl + domain)
		if err != nil {
			e.Error = fmt.Sprintf("ERROR %s %s", curlStatus[err.Error()], domain)
			if c.App.Mode != "test" {
				log.Printf(e.Error + "\n" + err.Error())
			}
			lib.SendErrorToClient(w, e)
			return
		}
		parseHeadString(string(rawData), &hs)
		if hs[count].Header["Location"] == "" {
			notMoreRedirections = true
			//fmt.Println(`No more redirections`)
		} else {
			domain = hs[count].Header["Location"]
			//fmt.Println(`Redirecting to ... `, domain)
		}
		count++
	}

	lib.SendJSONToClient(w, hs)
	return
}

func parseHeadString(rawData string, hs *[]header) {
	last := ""
	h := header{}
	h.Header = make(map[string]string)
	//fmt.Println("PARSE => \n", rawData)
	lines := strings.Split(rawData, "\r\n")
	// protocol and status code is the first line
	name := strings.Split(lines[0], " ")[0]
	value := lines[0][len(name)+1 : len(lines[0])]
	h.Header[name] = value
	for k, v := range lines {
		if len(v) > 0 && k > 0 {
			//fmt.Println(k, len(v))
			name := strings.Split(v, ": ")[0]
			value := strings.Split(v, ": ")[1]
			//fmt.Println(`******`, name, value)
			if name == "Location" {
				last = value
			} else {
				h.Header[name] = value
			}
			// last line is location if exist
			if last != "" {
				h.Header["Location"] = last
			}
		}
	}
	*hs = append(*hs, h)
}
