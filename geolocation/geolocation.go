/* */

package geolocation

import (
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/ip2location/ip2location-go/v9"
	h "github.com/jolav/codetabs/_utils"
)

const (
	DB_FILE_PATH = "./_data/geoDB.bin"
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

func Router(w http.ResponseWriter, r *http.Request) {
	gd := geoData{}
	format := strings.ToLower(r.PathValue("format"))
	switch format {
	case "json":
		err := gd.doGeoRequest(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotAcceptable)
			return
		}
		h.SendResponse(w, gd, http.StatusOK)
		return
	}
	h.SendResponse(w, nil, http.StatusBadRequest)
}

func (gd *geoData) doGeoRequest(r *http.Request) error {
	hostname := r.URL.Query().Get("q")
	if hostname == "" {
		hostname = h.GetIP(r)
	}
	addr, err := net.LookupIP(hostname)
	if err != nil {
		msg := fmt.Sprintf("%s is a unknown/not_valid hostname/IP", hostname)
		log.Println(err)
		return errors.New(msg)
	}
	gd.Ip = addr[0].String()
	err = gd.readDB()
	if err != nil {
		log.Println(err)
		msg := fmt.Sprintln("Geolocation DB Error")
		return errors.New(msg)
	}
	return nil
}

func (gd *geoData) readDB() error {
	db, err := ip2location.OpenDB(DB_FILE_PATH)
	if err != nil {
		log.Println(err)
		return err
	}
	results, err := db.Get_all(gd.Ip)
	if err != nil {
		log.Println(err)
		return err
	}
	db.Close()
	gd.Country_code = results.Country_short
	gd.Country_name = results.Country_long
	gd.Region_name = results.Region
	gd.City = results.City
	gd.Zip_code = results.Zipcode
	gd.Time_zone = results.Timezone
	gd.Latitude = results.Latitude
	gd.Longitude = results.Longitude
	return nil
}
