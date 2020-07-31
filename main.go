/*
go build -ldflags="-X 'main.when=$(date -u +%F_%T)'"
*/

package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
	ax "github.com/jolav/codetabs/alexa"
	gl "github.com/jolav/codetabs/geolocation"
	he "github.com/jolav/codetabs/headers"
	lo "github.com/jolav/codetabs/loc"
	px "github.com/jolav/codetabs/proxy"
	st "github.com/jolav/codetabs/stars"
	vg "github.com/jolav/codetabs/video2gif"
	we "github.com/jolav/codetabs/weather"
)

var version = "0.7.8"
var when = "undefined"

type Conf struct {
	Mode          string
	Port          int
	ErrorsLogFile string
	HitsLogFile   string
	DevHosts      []string
	Services      []string
	hitsLog       *log.Logger
}

func main() {
	checkFlags()

	var c Conf
	u.LoadJSONConfig(getGlobalConfigJSON(), &c)
	checkMode(&c)
	//u.PrettyPrintStruct(c)

	// Custom Error Log File + Custom Hits Log File
	var mylog *os.File
	if c.Mode == "production" {
		mylog = u.CreateCustomErrorLogFile(c.ErrorsLogFile)
	}
	defer mylog.Close()

	c.hitsLog = u.NewHitsFile(c.HitsLogFile)
	//////////

	cleanTmpFolder()

	alexa := ax.NewAlexa(false)
	go alexa.OnceADayTask()
	geoip := gl.NewGeoLocation(false)
	headers := he.NewHeaders(false)
	weather := we.NewWeather(false)
	video2gif := vg.NewVideo2Gif(false)
	stars := st.NewStars(false)
	proxy := px.NewProxy(false)
	loc := lo.NewLoc(false)

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/alexa/", mw(alexa.Router, "alexa", c))
	mux.HandleFunc("/v1/geolocation/", mw(geoip.Router, "geoip", c))
	mux.HandleFunc("/v1/headers/", mw(headers.Router, "headers", c))
	mux.HandleFunc("/v1/weather/", mw(weather.Router, "weather", c))
	mux.HandleFunc("/v1/video2gif/", mw(video2gif.Router, "video2gif", c))
	mux.HandleFunc("/v1/stars/", mw(stars.Router, "stars", c))
	mux.HandleFunc("/v1/proxy/", mw(proxy.Router, "proxy", c))
	mux.HandleFunc("/v1/loc/", mw(loc.Router, "loc", c))

	mux.HandleFunc("/", u.BadRequest)

	server := http.Server{
		Addr:           fmt.Sprintf("localhost:%d", c.Port),
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   30 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Printf("Server up listening %s in mode %s", server.Addr, c.Mode)
	server.ListenAndServe()
}

func mw(next http.HandlerFunc, service string, c Conf) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		go u.AddHit(w, r, service, c.Mode, c.hitsLog)
		next.ServeHTTP(w, r)
	})
}

func checkFlags() {
	versionFlag := flag.Bool("v", false, "Show current version and exit")
	flag.Parse()
	switch {
	case *versionFlag:
		fmt.Printf("Version:\t: %s\n", version)
		fmt.Printf("Date   :\t: %s\n", when)
		os.Exit(0)
	}
}

func checkMode(c *Conf) {
	serverName, _ := os.Hostname()
	serverName = strings.ToLower(serverName)
	if u.SliceContainsString(serverName, c.DevHosts) {
		c.Mode = "dev"
		c.Port = 3000
	}
}

func cleanTmpFolder() {
	u.GenericCommand([]string{"rm", "-r", "./_tmp/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/loc/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/videos/"})
}

func FAKE__getGlobalConfigJSON() (configjson []byte) {
	// real getGlobalConfigJSON() in private.go file
	configjson = []byte(`
	{
		"mode": "production",
		"port": XXXXX,
		"errorsLogFile": "path/to/errors.log",
		"hitsLogFile":"path/to/hits.log",
		"devHosts" : [
			"list",
			"of",
			"dev",
			"hosts"
		],
		"services" : [
			"alexa",
			"geoip",
			"headers",
			"loc",
			"proxy",
			"stars",
			"video2gif",
			"weather"
		]
	}
	`)
	return
}
