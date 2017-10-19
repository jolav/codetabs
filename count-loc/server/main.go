package main

// fresh -c tmp/fresh.conf
// GOOS=linux GOARCH=amd64 go build

import (
	"fmt"
	"lib"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var loc = "./loc"

//var loc = "./locMac"

//const serverIP = "localhost:3000" // Go local
const serverIP = "localhost:3502" // Go deploy

func init() {
	// 1 uncomment mux Not FOUND api.go
	// 2 change serverIP api.go
	// 3 uncomment aux.AddAPI
}

func main() {
	http.DefaultClient.Timeout = 10 * time.Second

	mux := http.NewServeMux()

	weblocHandler := http.HandlerFunc(routerWebLoc)

	mux.Handle("/", weblocHandler)
	//mux.HandleFunc("/", notFound)

	server := http.Server{
		Addr:           serverIP,
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   20 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	server.ListenAndServe()
}

var order = "1"
var orderInt = 1

var e myError

type myError struct {
	Error string `json:"Error,omitempty"`
}

func routerWebLoc(w http.ResponseWriter, r *http.Request) {
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
	if path[0] == "get" && len(strings.Split(repo, "/")) != 2 {
		e.Error = "Incorrect user/repo"
		lib.SendErrorToClient(w, e)
		return
	}
	switch path[0] {
	case "get":
		orderInt++
		order = strconv.Itoa(orderInt)
		countRepo(w, r, repo, order)
	case "upload":
		if r.Method == "POST" {
			orderInt++
			order = strconv.Itoa(orderInt)
			countUpload(w, r, order)
		}
	default:
		e.Error = "Bad Request"
		lib.SendErrorToClient(w, e)
	}
}

func notFound(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://codetabs.com/pageNotFound", 301)
}
