/* */

package loc

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	u "github.com/jolav/codetabs.0.9.2/_utils"
)

type gitlab struct{}

func (gl gitlab) existRepo(repo string) bool {
	url := "https://gitlab.com/" + repo
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

func (gl gitlab) exceedsSize(w http.ResponseWriter, l *loc) bool {
	repo := strings.Split(l.repo, "/")
	url := "https://gitlab.com/api/v4/projects/"
	url += fmt.Sprintf(`%s%s%s?statistics=true`, repo[0], "%2F", repo[1])
	//fmt.Println(url)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("ERROR LOC 3 %s\n", err)
		return true
	}
	req.Header.Set("PRIVATE-TOKEN", u.GITLAB_TOKEN)
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		msg := fmt.Sprintf("Error getting repo size %s\n", err)
		u.ErrorResponse(w, msg)
		return true
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR lOC 4 %s\n", err)
		return true
	}
	type data struct {
		Statistics struct {
			StorageSize    int `json:"storage_size"`
			RepositorySize int `json:"repository_size"`
		} `json:"statistics"`
	}
	d := data{}
	err = json.Unmarshal(body, &d)
	if err != nil {
		log.Printf("ERROR LOC 5 %s\n", err)
		return true
	}
	l.size = d.Statistics.RepositorySize / 1000000
	if l.size > MAX_SIZE {
		return true
	}
	return false
}
