/*
go build -o codetabs -ldflags="-X 'main.when=$(date -u +%F_%T)'"
*/

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jolav/codetabs/random"
	"github.com/jolav/codetabs/stats"
	"github.com/jolav/codetabs/weather"

	h "github.com/jolav/codetabs/_utils"
)

var version = "0.11.2"
var when = "undefined"

type config struct {
	mode           string
	port           int
	storePath      string
	errorsFilePath string
	hitsFilePath   string
	bannedFilePath string
	hitLog         *log.Logger
	banLog         *log.Logger
	reloadKey      string
}

func main() {
	h.CheckFlags(version, when)
	c := loadPrivateConfig()

	// Custom Error Log File
	var mylog *os.File
	if c.mode == "production" {
		mylog = h.CreateCustomErrorLogFile(c.errorsFilePath)
		c.banLog = h.NewBanFile(c.bannedFilePath) // Custom Ban Log File
		c.hitLog = h.NewHitsFile(c.hitsFilePath)  // Custom Hits Log File
	}
	defer mylog.Close()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /v1/random/{action}", mw(random.Router, "random", c))
	mux.HandleFunc("GET /v1/weather", mw(weather.Router, "weather", c))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		go stats.LogHit(r, "?????", c.mode, c.hitLog)
		h.SendResponse(w, nil, http.StatusBadRequest)
	})
	server := http.Server{
		Addr:           fmt.Sprintf("localhost:%d", c.port),
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Printf("Server up v%s listening %s in mode %s",
		version, server.Addr, c.mode)
	server.ListenAndServe()
}

func mw(next http.HandlerFunc, service string, c config) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if stats.IsBanned(r, service, c.reloadKey) {
			go stats.LogBanned(r, service, c.mode, c.banLog)
			h.SendResponse(w, nil, http.StatusUnauthorized)
			return
		}
		go stats.LogHit(r, service, c.mode, c.hitLog)
		next.ServeHTTP(w, r)
	})
}
