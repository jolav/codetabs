/* */

package stats

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	h "github.com/jolav/codetabs/internal"
)

var list []string

func init() {
	list = loadList()
}

func loadList() []string {
	list, err := h.ReadFileLineByLine("stats/banned.list")
	if err != nil {
		log.Println("ERROR loading Banned.list => ", err)
		return []string{}
	}
	return list
}

func IsBanned(r *http.Request, service, clave string) bool {
	if service != "proxy" {
		return false
	}
	r.ParseForm()
	quest := r.Form.Get("quest")
	//fmt.Println("QUEST => ", quest)
	if quest == clave {
		list = loadList()
		//fmt.Println("RELOAD")
		return true
	}
	for _, v := range list {
		if strings.Contains(quest, v) {
			return true
		}
	}
	return false
}

func LogBanned(r *http.Request, service, mode string, bLog *log.Logger) {
	ip := h.GetIP(r)
	sv := strings.ToUpper(service)
	host := h.GetRequestOrigin(r)
	quest := strings.Trim(fmt.Sprint(r.URL), string(r.URL.Path))

	if mode == "production" {
		bLog.Println(ip, sv, host, quest)
	} else {
		log.Println(ip, sv, host, quest)
	}
	// ????
	sendToHitCounter(strings.ToLower(service))
}
