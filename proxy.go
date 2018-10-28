package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	lib "./_lib"
)

func doProxyRequest(w http.ResponseWriter, quest string) {
	e = myError{}
	var p []string
	if strings.HasPrefix(quest, "https:") || strings.HasPrefix(quest, "http:") {
		p = strings.SplitN(quest, "/", 2)
	} else {
		p = append(p, "http:")
		p = append(p, quest)
	}
	quest = p[0] + "//" + p[1]
	resp, err := http.Get(quest)
	if err != nil {
		if c.App.Mode != "test" {
			log.Printf("WARN %s", quest)
		}
		e.Error = fmt.Sprintf("%s is not a valid resource", quest)
		lib.SendErrorToClient(w, e)
		return
	}
	defer resp.Body.Close()
	limitReader := &io.LimitedReader{R: resp.Body, N: 5e6} // (5mb)
	body, err := ioutil.ReadAll(limitReader)
	if err != nil {
		log.Printf("ERROR 1 %s", err)
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
