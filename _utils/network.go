/* */

package utils

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

const (
	validFormat = "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value'. Please read our docs at https://codetabs.com"
)

func SendResponse(w http.ResponseWriter, d interface{}, s int) {
	if s == http.StatusBadRequest {
		d = struct {
			Message string `json:"Error"`
		}{
			Message: validFormat,
		}
	}
	if d == nil {
		w.WriteHeader(s)
		return
	}
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Printf("ERROR Marshaling %v\n", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(s)
	_, err = w.Write(dataJSON)
	if err != nil {
		log.Printf("ERROR writing JSON response: %v\n", err)
	}
}

func FetchGET(path string, d interface{}) error {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(path)
	if err != nil {
		log.Printf("ERROR: Request %s => %v", path, err)
		return err
	}
	defer resp.Body.Close()

	decoder := json.NewDecoder(resp.Body)
	err = decoder.Decode(&d)
	if err != nil {
		log.Printf("ERROR unnmarshalling => %v", err)
		return err
	}

	return nil
}

func GetIP(r *http.Request) string {
	headers := []string{
		"X-Forwarded-For",
		"X-Real-IP",
		"CF-Connecting-IP",
	}
	for _, header := range headers {
		ips := r.Header.Get(header)
		if ips != "" {
			return strings.TrimSpace(strings.Split(ips, ",")[0])
		}
	}
	ip := r.RemoteAddr
	colon := strings.LastIndex(ip, ":")
	if colon != -1 {
		ip = ip[:colon]
	}
	return strings.TrimSpace(ip)
}

func GetRequestOrigin(r *http.Request) string {
	switch {
	case r.Header.Get("Host") != "":
		return r.Header.Get("Host")
	case r.Header.Get("Origin") != "":
		return r.Header.Get("Origin")
	case r.Header.Get("Referer") != "":
		return r.Header.Get("Referer")
	default:
		return "-----"
	}
}
