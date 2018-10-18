package main

// fresh -c tmp/fresh.conf
// GOOS=linux GOARCH=amd64 go build

import (
	"fmt"
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
	lib.LoadConfig(weatherjson, &g)
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
	mux.HandleFunc("/", RouterWeather)

	server := http.Server{
		Addr:           fmt.Sprintf("localhost:%d", c.App.Port),
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	server.ListenAndServe()
}

// RouterWeather ...
func RouterWeather(w http.ResponseWriter, r *http.Request) {
	e = myError{}
	params := strings.Split(r.URL.Path, "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//fmt.Println("Going ....", path, r.Method, len(path))
	if len(path) == 0 || len(path) > 1 {
		log.Println(fmt.Sprintf("ERROR %s", "Bad Request"))
		e.Error = "Bad Request"
		lib.SendErrorToClient(w, e)
		return
	}
	r.ParseForm()
	format := strings.ToLower(r.Form.Get("format"))
	city := strings.ToLower(r.Form.Get("city"))
	switch strings.ToLower(path[0]) {
	case "temp":
		if format == "xml" || format == "json" || format == "" {
			stats.AddHit(c.App.Service, c.App.Mode, lib.GetIP(r), city)
			getTemp(w, r, format, city)
		} else {
			e.Error = fmt.Sprintf("Format %s not recognized", format)
			log.Println(fmt.Sprintf("ERROR %s", e.Error))
			lib.SendErrorToClient(w, e)
		}
	default:
		e.Error = "Bad Request"
		log.Println(fmt.Sprintf("ERROR %s", "Bad Request"))
		lib.SendErrorToClient(w, e)
	}
}

func notFound(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://codetabs.com/pageNotFound", 301)
}
