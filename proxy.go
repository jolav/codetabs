package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"

	lib "./_lib"
)

func doProxyRequest(w http.ResponseWriter, r *http.Request, quest string) {
	e = myError{}
	quest = "http://" + lib.RemoveProtocolFromURL(quest)
	resp, err := http.Get(quest)
	if err != nil {
		if c.App.Mode != "test" {
			log.Printf("WARN %s -> %s\n", quest, r.URL.RequestURI())
		}
		e.Error = fmt.Sprintf("%s is not a valid resource", quest)
		lib.SendErrorToClient(w, e)
		return
	}
	defer resp.Body.Close()
	limitReader := &io.LimitedReader{R: resp.Body, N: 5e6} // (5mb)
	body, err := ioutil.ReadAll(limitReader)
	if err != nil {
		log.Printf("ERROR %s -> %s\n", err, r.URL.RequestURI())
		e.Error = fmt.Sprintf("ERROR 1 %s ", quest)
		lib.SendErrorToClient(w, e)
		return
	}
	if lib.IsJSON(string(body)) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(body))
	} else {
		w.Write(body)
	}
}
