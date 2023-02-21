/* */

package _utils

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// AddHit ...
func AddHit(w http.ResponseWriter, r *http.Request, service, mode string,
	hLog *log.Logger) {
	ip := GetIP(r)
	sv := strings.ToUpper(service)
	host := r.Header.Get("Host")
	if host == "" {
		host = r.Header.Get("Origin")
		if host == "" {
			host = r.Header.Get("Referer")
			if host == "" {
				host = "???"
			}
		}
	}
	askingFor := strings.Trim(fmt.Sprint(r.URL), string(r.URL.Path))

	if mode == "production" {
		hLog.Println(ip, sv, host, askingFor)
		hitUrl := "http://localhost:3970/addHit/" + service
		saveHit(w, hitUrl)
	} else {
		log.Println(ip, sv, host, askingFor)
	}
}

// AddBanned ...
func AddBanned(w http.ResponseWriter, r *http.Request, service, mode string,
	hLog *log.Logger) {
	ip := GetIP(r)
	sv := strings.ToUpper(service)
	host := r.Header.Get("Host")
	if host == "" {
		host = r.Header.Get("Origin")
		if host == "" {
			host = r.Header.Get("Referer")
			if host == "" {
				host = "???"
			}
		}
	}
	askingFor := strings.Trim(fmt.Sprint(r.URL), string(r.URL.Path))

	if mode == "production" {
		hLog.Println(ip, sv, host, askingFor)
	} else {
		log.Println(ip, sv, host, askingFor)
	}
}

// CreateCustomBansLogFile ...
func NewBanFile(f string) *log.Logger {
	infoLog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Ban log file %s\n", err)
	}
	bannedLog := log.New(infoLog, "BANNED: ", log.Ldate|log.Ltime)
	//hitsLog := log.New(infoLog, "HIT :\t", log.Ldate|log.Ltime)
	return bannedLog
}

// CreateCustomHitsLogFile ...
func NewHitsFile(f string) *log.Logger {
	infoLog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Info log file %s\n", err)
	}
	hitsLog := log.New(infoLog, "HIT: ", log.Ldate|log.Ltime)
	//hitsLog := log.New(infoLog, "HIT :\t", log.Ldate|log.Ltime)
	return hitsLog
}

func saveHit(w http.ResponseWriter, url string) {
	var netClient = &http.Client{
		Timeout: time.Second * 2,
	}
	resp, err := netClient.Get(url)
	if err != nil {
		log.Println("Error 1 saving Hit,", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		log.Println("Error 2 saving Hit,", resp.StatusCode)
		return
	}
}
