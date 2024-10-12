/* */

package loc

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

type github struct{}

func (gh github) existRepo(repo string) bool {
	url := "https://github.com/" + repo
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("ERROR exists repo %s\n", err)
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode == 200 {
		return true
	}
	return false
}

func (gh github) exceedsSize(w http.ResponseWriter, l *loc) bool {
	url := "https://api.github.com/repos/" + l.repo
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Accept", "application/vnd.github.v3.star+json")
	req.Header.Add("User-Agent", "github stars repos")
	rndToken := u.GetRandomInt(0, 9)
	req.Header.Add("Authorization", "token "+u.GITHUB_TOKEN[rndToken])
	var netClient = &http.Client{
		Timeout: time.Second * 3,
	}
	resp, err := netClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		msg := fmt.Sprintf("Error getting repo size %s\n", err)
		u.ErrorResponse(w, msg)
		return true
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR LOC 1 %s\n", err)
		return true
	}
	var aux struct {
		Size int `json:"size"`
	}
	err = json.Unmarshal(body, &aux)
	if err != nil {
		log.Printf("ERROR LOC 2 %s\n", err)
		return true
	}
	l.size = aux.Size / 1000
	if l.size > MAX_SIZE {
		return true
	}
	return false
}
