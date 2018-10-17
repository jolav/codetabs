package main

import (
	"fmt"
	"log"
	"net"

	lib "../_lib"
	geoip2 "github.com/oschwald/geoip2-golang"

	"net/http"
)

var geo *mygeoData

type mygeoData struct {
	IP          string  `json:"ip" xml:"ip,omitempty"`
	CountryCode string  `json:"country_code" xml:"country_code,omitempty"`
	CountryName string  `json:"country_name" xml:"country_name,omitempty"`
	RegionCode  string  `json:"region_code" xml:"region_code,omitempty"`
	RegionName  string  `json:"region_name" xml:"region_name,omitempty"`
	City        string  `json:"city" xml:"city,omitempty"`
	ZipCode     string  `json:"zip_code" xml:"zip_code,omitempty"`
	TimeZone    string  `json:"time_zone" xml:"time_zone,omitempty"`
	Latitude    float64 `json:"latitude" xml:"latitude,omitempty"`
	Longitude   float64 `json:"longitude" xml:"longitude,omitempty"`
}

func getGeoIP(w http.ResponseWriter, f string, q string) {
	geo = &mygeoData{}
	addr, err := net.LookupIP(q)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR %s", err))
		e.Error = fmt.Sprintf("%s is a unknown host, not a valid IP or hostname", q)
		lib.SendErrorToClient(w, e)
		return
	}
	getMaxMind(addr[0].String())

	if f == "xml" {
		lib.SendXMLToClient(w, geo)
		return
	}
	lib.SendJSONToClient(w, geo)
}

func getMaxMind(newip string) {
	db, err := geoip2.Open("./db/GeoLite2-City.mmdb")
	if err != nil {
		log.Println(fmt.Sprintf("ERROR %s", err))
		log.Fatal(err)
	}
	defer db.Close()
	ip := net.ParseIP(newip)
	record, err := db.City(ip)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR %s", err))
		log.Fatal(err)
	}
	geo.IP = ip.String()
	geo.CountryCode = record.Country.IsoCode
	geo.CountryName = record.Country.Names["en"]
	if len(record.Subdivisions) > 0 {
		geo.RegionCode = record.Subdivisions[0].IsoCode
		geo.RegionName = record.Subdivisions[0].Names["en"]
	}
	geo.City = record.City.Names["en"]
	geo.ZipCode = record.Postal.Code
	geo.TimeZone = record.Location.TimeZone
	geo.Latitude = lib.ToFixedFloat64(record.Location.Latitude, 4)
	geo.Longitude = lib.ToFixedFloat64(record.Location.Longitude, 4)
}
