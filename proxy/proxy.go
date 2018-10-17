package main

// fresh -c tmp/fresh.conf
// GOOS=linux GOARCH=amd64 go build

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	lib "../_lib"
	stats "../_stats"
)

func init() {
	lib.LoadConfig(configjson, &c)
	if c.App.Mode != "production" {
		c.App.Port = 3000
	}
}

func main() {
	////////////// SEND LOGS TO FILE //////////////////
	if c.App.Mode == "production" {
		var name = fmt.Sprintf("./logs/%s.log", c.App.Service)
		mylog, err := os.OpenFile(name, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
		if err != nil {
			log.Fatal(err)
		}
		defer mylog.Close() // defer must be in main
		log.SetOutput(mylog)
	}

	///////////////////////////////////////////////////
	stats.MYDB.InitDB()

	http.DefaultClient.Timeout = 10 * time.Second
	mux := http.NewServeMux()
	mux.HandleFunc("/", proxyURL)

	server := http.Server{
		Addr:           fmt.Sprintf("localhost:%d", c.App.Port),
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	server.ListenAndServe()
}

func proxyURL(w http.ResponseWriter, r *http.Request) {
	e = myError{}
	quest := r.URL.Path[1:len(r.URL.Path)]
	myurl := quest
	var p []string
	if strings.HasPrefix(myurl, "https:") || strings.HasPrefix(myurl, "http:") {
		p = strings.SplitN(myurl, "/", 2)
	} else {
		p = append(p, "http:")
		p = append(p, myurl)
	}
	myurl = p[0] + "//" + p[1]
	resp, err := http.Get(myurl)
	if err != nil {
		log.Println(fmt.Sprintf("WARN %s", quest))
		e.Error = fmt.Sprintf("%s is not a valid resource", quest)
		lib.SendErrorToClient(w, e)
		return
	}
	stats.AddHit(c.App.Service, c.App.Mode, lib.GetIP(r), quest)
	defer resp.Body.Close()
	limitReader := &io.LimitedReader{R: resp.Body, N: 5e6} // (5mb)
	body, err := ioutil.ReadAll(limitReader)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR %s", err))
		return
	}
	if lib.IsJSON(string(body)) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(body))
	} else {
		w.Write(body)
	}
}
