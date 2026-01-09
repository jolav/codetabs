/*
go build -ldflags="-X 'main.when=$(date -u +%F_%T)'"
*/

package main

import (
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/user"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
	"github.com/jolav/codetabs/alexa"
	"github.com/jolav/codetabs/geolocation"
	"github.com/jolav/codetabs/headers"
	"github.com/jolav/codetabs/loc"
	"github.com/jolav/codetabs/proxy"
	"github.com/jolav/codetabs/random"
	"github.com/jolav/codetabs/stars"
	"github.com/jolav/codetabs/store"
	"github.com/jolav/codetabs/weather"
)

var version = "0.9.4a"
var when = "undefined"

type Conf struct {
	Mode          string
	Port          int
	ErrorsLogFile string
	HitsLogFile   string
	BannedLogFile string
	DevHosts      []string
	Services      []string
	hitsLog       *log.Logger
	bannedLog     *log.Logger
}

func main() {

	rand.Seed(time.Now().UnixNano())

	checkFlags()

	var c Conf
	u.LoadJSONConfig(getGlobalConfigJSON(), &c)
	checkMode(&c)
	//u.PrettyPrintStruct(c)

	// Database
	db, err := store.NewDB()
	if err != nil {
		log.Fatal("Error connecting DataBase => ", err)
	}
	store.MyDB = db

	//
	_, err = user.Current()
	if err != nil {
		log.Fatal(err)
	}

	// Custom Error Log File
	var mylog *os.File
	// c.ErrorsLogFile = usernow.HomeDir + c.ErrorsLogFile
	if c.Mode == "production" {
		mylog = u.CreateCustomErrorLogFile(c.ErrorsLogFile)
	}
	defer mylog.Close()

	// Custom Ban Log File
	// c.BannedLogFile = usernow.HomeDir + c.BannedLogFile
	c.bannedLog = u.NewBanFile(c.BannedLogFile)

	// Custom Hits Log File
	// c.HitsLogFile = usernow.HomeDir + c.HitsLogFile
	c.hitsLog = u.NewHitsFile(c.HitsLogFile)
	//////////

	cleanTmpFolder()

	go alexa.OnceADayTask()
	index := loc.NewIndex(false)

	mux := http.NewServeMux()

	mux.HandleFunc("/v1/alexa/", mw(alexa.Router, "alexa", c))
	mux.HandleFunc("/v1/geolocation/", mw(geolocation.Router, "geoip", c))
	mux.HandleFunc("/v1/headers/", mw(headers.Router, "headers", c))
	mux.HandleFunc("/v1/weather/", mw(weather.Router, "weather", c))
	mux.HandleFunc("/v1/random/", mw(random.Router, "random", c))
	mux.HandleFunc("/v1/stars/", mw(stars.Router, "stars", c))
	mux.HandleFunc("/v1/proxy/", mw(proxy.Router, "proxy", c))
	//mux.HandleFunc("/v1/tmp/", mw(proxy.Router, "proxy", c))
	mux.HandleFunc("/v1/loc/", mw(index.Router, "loc", c))

	mux.HandleFunc("/", u.BadRequest)

	// Get port from Zeabur environment variable, default to 8080 if not set
	port := os.Getenv("PORT")
	if port == "" {
		port = fmt.Sprintf("%d", c.Port) // Fallback to config port
	}

	server := http.Server{
		// CHANGE THIS: Bind to 0.0.0.0 instead of localhost
		Addr:           ":" + port,
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
		if service == "proxy" {
			/*
				if isBanned(r) {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					go u.AddBanned(w, r, service, c.Mode, c.bannedLog)
					return
				}
			*/
		}
		go u.AddHit(w, r, service, c.Mode, c.hitsLog)
		next.ServeHTTP(w, r)
	})
}

/*
mux.HandleFunc("/vnstats/v1/", checkValid(
	func(w http.ResponseWriter, r *http.Request) {
		vnstatsRouter(w, r, a)
	}, a.c.APIKey),
)

func checkValid(next http.HandlerFunc, test string) http.HandlerFunc {
return func(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	valid := r.Form.Get("test")
	if valid != test {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	next.ServeHTTP(w, r)
}
}
*/

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
	u.GenericCommand([]string{"rm", "-rf", "./_tmp/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/loc/"})
	u.GenericCommand([]string{"mkdir", "./_tmp/videos/"})
}

func getGlobalConfigJSON() (configjson []byte) {
	// Return a JSON string that works for production
	return []byte(`
    {
        "mode": "production",
        "port": 8080,
        "errorsLogFile": "/tmp/errors.log",
        "hitsLogFile": "/tmp/hits.log",
        "bannedLogFile": "/tmp/banned.log",
        "devHosts": [],
        "services": ["alexa", "geoip", "headers", "loc", "proxy", "stars", "weather"]
    }
    `)
}
