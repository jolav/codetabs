/* */

package _utils

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// AddHit ...
func AddHit(w http.ResponseWriter, r *http.Request,
	service, mode string, hLog *log.Logger) {
	ip := GetIP(r)
	sv := strings.ToUpper(service)
	host := r.Header.Get("Origin")
	if host == "" {
		host = " ? "
	}
	quest := strings.Split(r.URL.String(), "v1/")[1]
	if mode == "production" {
		hLog.Println(ip, sv, host, quest)
		hitUrl := "http://localhost:3970/addHit/" + service
		saveHit(w, hitUrl)
	} else {
		log.Println(ip, sv, host, quest)
	}
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
