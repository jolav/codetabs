/* */

package proxy

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

type proxy struct {
	quest string
}

func (p *proxy) Router(w http.ResponseWriter, r *http.Request) {
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
	r.ParseForm()
	p.quest = r.Form.Get("quest")
	if p.quest == "" || len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	p.quest = strings.Split(r.URL.RawQuery, "quest=")[1]
	p.doProxyRequest(w, r)
}

func (p *proxy) doProxyRequest(w http.ResponseWriter, r *http.Request) {
	p.quest = "http://" + u.RemoveProtocolFromURL(p.quest)
	var data interface{}
	var netClient = &http.Client{
		Timeout: time.Second * 10,
	}
	resp, err := netClient.Get(p.quest)
	if err != nil {
		log.Printf("Error PROXY => %s", err)
		msg := fmt.Sprintf("%s is not a valid resource", p.quest)
		u.ErrorResponse(w, msg)
		return
	}
	defer resp.Body.Close()

	contentType := ""
	if len(resp.Header["Content-Type"]) > 0 {
		contentType = resp.Header["Content-Type"][0]
	}

	if strings.Contains(contentType, "application/json") {
		json.NewDecoder(resp.Body).Decode(&data)
		if data != nil {
			w.Header().Set("Content-Type", "application/json")
			u.SendJSONToClient(w, data, 200)
			return
		}
	}

	if strings.Contains(contentType, "application/xml") {
		u.SendXMLToClient(w, data, 200)
	}

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			w.Write([]byte(fmt.Sprintf("%v", string(line))))
			return
		}
		w.Write([]byte(fmt.Sprintf("%v", string(line))))
	}
}

func NewProxy(test bool) proxy {
	p := proxy{}
	return p
}
