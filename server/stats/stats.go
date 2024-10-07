/* */

package stats

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	h "github.com/jolav/codetabs/internal"
)

var netClient = &http.Client{ //reuse, instead creating new client
	Timeout: time.Second * 2,
}

func LogHit(r *http.Request, service, mode string, hLog *log.Logger) {
	ip := h.GetIP(r)
	sv := strings.ToUpper(service)
	host := h.GetRequestOrigin(r)
	quest := strings.Trim(fmt.Sprint(r.URL), string(r.URL.Path))

	if mode == "production" {
		hLog.Println(ip, host, sv, quest)
	} else {
		log.Println(ip, host, sv, quest)
	}

	sendToHitCounter(strings.ToLower(service))
}

func sendToHitCounter(service string) {
	hitUrl := "http://localhost:3970/addHit/" + service

	resp, err := netClient.Get(hitUrl)
	if err != nil {
		log.Println("ERROR 1 sending Hit => ", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Println("ERROR 2 sending Hit =>", resp.StatusCode)
		return
	}
}
