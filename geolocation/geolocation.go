/* */

package geolocation

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/ip2location/ip2location-go"
	u "github.com/jolav/codetabs/_utils"
)

const (
	DB_FILE_PATH      = "./_data/geolocation/geoDB.bin"
	DB_FILE_PATH_TEST = "../_data/geolocation/geoDB.bin"
)

type geoip struct {
	config  config
	geoData geoData
}

type config struct {
	dbFilePath string
}

type geoData struct {
	Ip           string  `json:"ip"`
	Country_code string  `json:"country_code"`
	Country_name string  `json:"country_name"`
	Region_name  string  `json:"region_name"`
	City         string  `json:"city"`
	Zip_code     string  `json:"zip_code"`
	Time_zone    string  `json:"time_zone"`
	Latitude     float32 `json:"latitude"`
	Longitude    float32 `json:"longitude"`
}

func (g *geoip) Router(w http.ResponseWriter, r *http.Request) {
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		u.BadRequest(w, r)
		return
	}
	format := strings.ToLower(path[2])
	if format != "json" && format != "xml" {
		u.BadRequest(w, r)
		return
	}
	r.ParseForm()
	target := strings.ToLower(r.Form.Get("q"))
	if target == "" {
		target = u.GetIP(r)
	}
	g.doGeoRequest(w, format, target)
}

func (g *geoip) doGeoRequest(w http.ResponseWriter, format, target string) {
	g.cleanGeoData()
	addr, err := net.LookupIP(target)
	if err != nil {
		msg := fmt.Sprintf("%s is a unknown host, not a valid IP or hostname", target)
		u.ErrorResponse(w, msg)
		return
	}
	g.geoData.Ip = addr[0].String()
	g.getGeoDataFromDB()
	if format == "xml" {
		u.SendXMLToClient(w, g.geoData, 200)
		return
	}
	u.SendJSONToClient(w, g.geoData, 200)
}

func (g *geoip) getGeoDataFromDB() {
	db, err := ip2location.OpenDB(g.config.dbFilePath)
	if err != nil {
		log.Println("ERROR GEOIP 1 =", err)
		g.cleanGeoData()
		return
	}
	results, err := db.Get_all(g.geoData.Ip)
	if err != nil {
		log.Println("ERROR GEOIP 2 =", err)
		g.cleanGeoData()
		return
	}
	g.geoData.Country_code = results.Country_short
	g.geoData.Country_name = results.Country_long
	g.geoData.Region_name = results.Region
	g.geoData.City = results.City
	g.geoData.Zip_code = results.Zipcode
	g.geoData.Time_zone = results.Timezone
	g.geoData.Latitude = results.Latitude
	g.geoData.Longitude = results.Longitude
	db.Close()
}

func (g *geoip) cleanGeoData() {
	g.geoData = geoData{}
}

func NewGeoLocation(test bool) geoip {
	g := geoip{
		config: config{
			dbFilePath: DB_FILE_PATH,
		},
		geoData: geoData{},
	}
	if test {
		g.config.dbFilePath = DB_FILE_PATH_TEST
	}
	return g
}
