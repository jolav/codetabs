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
			log.Printf("ERROR opening log file %s", err)
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
	server.ListenAndServe()
}

func router(w http.ResponseWriter, r *http.Request) {
	e = myError{}
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//fmt.Println("Going ....", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		msg := fmt.Sprintf("ERROR %s", "Bad Request")
		badRequest(w, msg)
		return
	}
	if !lib.SliceContainsString(path[1], c.App.Services) {
		msg := fmt.Sprintf("ERROR Bad Request, endpoint '%s' unknown", path[1])
		badRequest(w, msg)
		return
	}
	c.App.Service = path[1]
	params = path[2:len(path)]
	quest := strings.Join(params, "/")
	if quest == "" {
		msg := fmt.Sprintf("ERROR %s", "Bad Request, not enough parameters")
		badRequest(w, msg)
		return
	}

	switch c.App.Service {

	// ALEXA
	case "alexa":
		if len(params) != 2 {
			msg := fmt.Sprintf("ERROR %s", "Bad Request, incorrect parameters")
			badRequest(w, msg)
			return
		}
		doAlexaRequest(w, params)

	// HEADERS
	case "headers":
		if len(params) != 1 {
			msg := fmt.Sprintf("ERROR %s", "Bad Request, incorrect parameters")
			badRequest(w, msg)
			return
		}
		doHeadersRequest(w, params[0])

	// LOC
	case "loc":
		if params[0] == "upload" {
			if r.Method == "POST" {
				c.Loc.orderInt++
				c.Loc.order = strconv.Itoa(c.Loc.orderInt)
				doLocUploadRequest(w, r, c.Loc.order)
			}
		} else {
			if len(params) != 1 || params[0] != "get" {
				msg := fmt.Sprintf("ERROR %s", "Bad Request, incorrect parameters")
				badRequest(w, msg)
				return
			}
			r.ParseForm()
			repo := r.Form.Get("repo")
			aux := strings.Split(repo, "/")
			if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
				msg := fmt.Sprintf("Incorrect user/repo")
				badRequest(w, msg)
				return
			}
			c.Loc.orderInt++
			c.Loc.order = strconv.Itoa(c.Loc.orderInt)
			doLocRepoRequest(w, r, repo, c.Loc.order)
		}
	// PROXY
	case "proxy":
		doProxyRequest(w, quest)

	// STARS
	case "stars":
		if len(params) != 1 || params[0] != "get" {
			msg := fmt.Sprintf("ERROR %s", "Bad Request, incorrect parameters")
			badRequest(w, msg)
			return
		}
		r.ParseForm()
		repo := r.Form.Get("repo")
		aux := strings.Split(repo, "/")
		if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
			msg := fmt.Sprintf("Incorrect user/repo")
			badRequest(w, msg)
			return
		}
		doStarsRequest(w, r, repo)

	// WEATHER
	case "weather":
		r.ParseForm()
		format := strings.ToLower(r.Form.Get("format"))
		city := strings.ToLower(r.Form.Get("city"))
		if params[0] != "temp" {
			msg := fmt.Sprintf("ERROR %s", "Bad Request")
			badRequest(w, msg)
			return
		}
		if format == "xml" || format == "json" || format == "" {
			doWeatherRequest(w, r, format, city)
		} else {
			msg := fmt.Sprintf("Format %s not recognized", path[0])
			badRequest(w, msg)
			return
		}
	default:
		msg := fmt.Sprintf("ERROR %s is not a valid service", c.App.Service)
		badRequest(w, msg)
	}

	saveHit(r)

}

func badRequest(w http.ResponseWriter, msg string) {
	e.Error = msg
	if c.App.Mode != "test" {
		log.Println(e.Error)
	}
	lib.SendErrorToClient(w, e)
}

func saveHit(r *http.Request) {
	aux := fmt.Sprintf("/v1/%s/", c.App.Service)
	quest := strings.Split(r.URL.RequestURI(), aux)[1]
	addHit(c.App.Service, c.App.Mode, lib.GetIP(r), quest)
}
