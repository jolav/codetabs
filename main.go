package main

// GOOS=linux GOARCH=amd64 go build

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	db "./_db"
	lib "./_lib"
)

func init() {
	lib.LoadConfig(configjson, &c)
	lib.LoadConfig(weatherjson, &g)
	lib.LoadConfig(githubjson, &g)
	if c.App.Mode != "production" {
		c.App.Port = 3000
	}
	loadDataInMemory()
	go onceADayTask()
}

func main() {
	////////////// SEND LOGS TO FILE //////////////////
	if c.App.Mode == "production" {
		var f = c.App.ErrLog
		mylog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
		if err != nil {
			log.Printf("ERROR opening log file %s\n", err)
		}
		defer mylog.Close() // defer must be in main
		log.SetOutput(mylog)
	}
	///////////////////////////////////////////////////
	db.MYDB.InitDB()

	http.DefaultClient.Timeout = 10 * time.Second
	mux := http.NewServeMux()
	mux.HandleFunc("/", router)

	server := http.Server{
		Addr:           fmt.Sprintf("localhost:%d", c.App.Port),
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	log.Printf("Server listening ...%s", server.Addr)
	server.ListenAndServe()
}

func router(w http.ResponseWriter, r *http.Request) {
	e = myError{}
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		msg := fmt.Sprintf("%s", c.Test.ValidFormat)
		badRequest(w, r, msg)
		return
	}
	if !lib.SliceContainsString(path[1], c.App.Services) {
		msg := fmt.Sprintf("Bad Request, service '%s' unknown", path[1])
		badRequest(w, r, msg)
		return
	}

	c.App.Service = path[1]
	saveHit(c.App.Service, c.App.Mode, lib.GetIP(r), r.URL.RequestURI())

	switch c.App.Service {

	// ALEXA
	case "alexa":
		r.ParseForm()
		web := r.Form.Get("web")
		if web == "" || len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		doAlexaRequest(w, web)

	// HEADERS
	case "headers":
		r.ParseForm()
		domain := r.Form.Get("domain")
		if domain == "" || len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		doHeadersRequest(w, r, domain)

	// LOC
	case "loc":
		if r.Method == "POST" {
			c.Loc.OrderInt++
			c.Loc.Order = strconv.Itoa(c.Loc.OrderInt)
			doLocUploadRequest(w, r, c.Loc.Order)
			return
		}
		r.ParseForm()
		repo := r.Form.Get("github")
		aux := strings.Split(repo, "/")
		if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
			msg := fmt.Sprintf("Incorrect user/repo")
			badRequest(w, r, msg)
			return
		}
		if len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		c.Loc.OrderInt++
		c.Loc.Order = strconv.Itoa(c.Loc.OrderInt)
		doLocRepoRequest(w, r, repo, c.Loc.Order)

	// PROXY
	case "proxy":
		r.ParseForm()
		quest := r.Form.Get("quest")
		if quest == "" || len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		doProxyRequest(w, r, quest)

	// STARS
	case "stars":
		if len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		r.ParseForm()
		repo := r.Form.Get("repo")
		aux := strings.Split(repo, "/")
		if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
			msg := fmt.Sprintf("Incorrect user/repo")
			badRequest(w, r, msg)
			return
		}
		doStarsRequest(w, r, repo)

		// VIDEO2GIF
	case "video2gif":
		if r.Method == "POST" {
			c.Video2Gif.orderInt++
			c.Video2Gif.order = strconv.Itoa(c.Video2Gif.orderInt)
			doVideo2GifRequest(w, r, c.Video2Gif.order)
			return
		}
		badRequest(w, r, c.Test.ValidFormat)

	// WEATHER
	case "weather":
		if len(path) != 2 {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		r.ParseForm()
		format := strings.ToLower(r.Form.Get("format"))
		city := strings.ToLower(r.Form.Get("city"))
		if format == "" {
			format = "json"
		}
		if format != "xml" && format != "json" {
			badRequest(w, r, c.Test.ValidFormat)
			return
		}
		doWeatherRequest(w, r, format, city)

	default:
		badRequest(w, r, c.Test.ValidFormat)
	}

}

func badRequest(w http.ResponseWriter, r *http.Request, msg string) {
	e.Error = msg
	if c.App.Mode != "test" {
		log.Printf("ERROR Bad Request -> %s\n", r.URL.RequestURI())
	}
	lib.SendErrorToClient(w, e)
}
