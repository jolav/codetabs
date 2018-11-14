package main

import (
	"fmt"
	"log"
	"net"

	lib "./_lib"
	geoip2 "github.com/oschwald/geoip2-golang"

	"net/http"
)

func doGeoipRequest(w http.ResponseWriter, f string, q string) {
	o := geoipOutput{}
	addr, err := net.LookupIP(q)
	if err != nil {
		msg := fmt.Sprintf("%s is a unknown host, not a valid IP or hostname", q)
		if c.App.Mode != "test" {
			log.Printf(msg + "\n")
		}
		e.Error = msg
		lib.SendErrorToClient(w, e)
		return
	}
	getMaxMind(addr[0].String(), &o)

	if f == "xml" {
		lib.SendXMLToClient(w, o)
		return
	}
	lib.SendJSONToClient(w, o)
}

func getMaxMind(newip string, o *geoipOutput) {
	db, err := geoip2.Open(c.Geoip.GeoDataBaseFile)
	if err != nil {
		log.Printf("ERROR reading geoip database %s", err)
		return
	}
	defer db.Close()
	ip := net.ParseIP(newip)
	record, err := db.City(ip)
	if err != nil {
		log.Printf("ERROR reading geoip database city %s", err)
		return
	}
	o.IP = ip.String()
	o.CountryCode = record.Country.IsoCode
	o.CountryName = record.Country.Names["en"]
	if len(record.Subdivisions) > 0 {
		o.RegionCode = record.Subdivisions[0].IsoCode
		o.RegionName = record.Subdivisions[0].Names["en"]
	}
	o.City = record.City.Names["en"]
	o.ZipCode = record.Postal.Code
	o.TimeZone = record.Location.TimeZone
	o.Latitude = lib.ToFixedFloat64(record.Location.Latitude, 4)
	o.Longitude = lib.ToFixedFloat64(record.Location.Longitude, 4)
}
