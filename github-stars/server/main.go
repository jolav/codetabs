package main

// fresh -c tmp/fresh.conf
// GOOS=linux GOARCH=amd64 go build

import (
	"fmt"
	"lib"
	"net/http"
	"strings"
	"time"
)

func init() {
	// 1. change serverIP tool.go
	lib.LoadJSONfromFileMarshall(configJSON, &c)
}

//const serverIP = "localhost:3000" // Go local
const serverIP = "localhost:3501" // Go deploy

const configJSON = "config.json"

func main() {
	http.DefaultClient.Timeout = 10 * time.Second

	mux := http.NewServeMux()

	starsHandler := http.HandlerFunc(routerGitHubStars)

	mux.Handle("/", starsHandler)

	server := http.Server{
		Addr:           serverIP,
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	server.ListenAndServe()
}

var c conf

type conf struct {
	GitHub struct {
		API   string   `json:"api"`
		Token []string `json:"token"`
	} `json:"gitHub"`
}

var e myError

type myError struct {
	Error string `json:"Error,omitempty"`
}

func routerGitHubStars(w http.ResponseWriter, r *http.Request) {
	e = myError{}
	params := strings.Split(r.URL.Path, "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	fmt.Println("Going ....", path, r.Method, len(path))
	if len(path) == 0 || len(path) > 1 {
		e.Error = "Bad Request"
		lib.SendErrorToClient(w, e)
		return
	}
	r.ParseForm()
	repo := r.Form.Get("repo")
	if len(strings.Split(repo, "/")) != 2 {
		e.Error = "Incorrect user/repo"
		lib.SendErrorToClient(w, e)
		return
	}
	switch path[0] {
	case "get":
		getRepo(w, r, repo)
	default:
		e.Error = "Bad Request"
		lib.SendErrorToClient(w, e)
	}
}

func notFound(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://codetabs.com/pageNotFound", 301)
}
