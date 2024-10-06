/* */

package stars

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	u "github.com/jolav/codetabs.0.9.2/_utils"
)

func (s *stars) doGLStarsRequest(w http.ResponseWriter, r *http.Request) {
	totalStars := s.getGLTotalStars()
	//fmt.Printf("%s has %d stars \n", s.repo, totalStars)
	if totalStars == 0 && len(s.y.Message) > 0 { // repo || user doesn't exist
		if s.y.Message != "" {
			msg := s.y.Message
			log.Printf("ERROR 1 %s\n", msg)
			u.ErrorResponse(w, msg)
			return
		}
	}
	if totalStars == 0 { // repo exists but has no stars
		s.storeData()
		u.SendJSONToClient(w, s.data, 200)
		return
	}
	links := s.prepareGLLinks()
	s.doGLLinksRequests(links)
	s.takeOutGLData()
	if len(s.stars) > 0 {
		s.convertGLStarsToData()
	}
	s.storeData()
	u.SendJSONToClient(w, s.data, 200)
}

func (s *stars) convertGLStarsToData() {
	s.data = make([]point, 0) //len(stars))
	var aux point
	total := 0
	aux.When = s.stars[0].StarredSince.String()[0:10]
	aux.Quantity = 0
	for _, v := range s.stars {
		if v.StarredSince.String()[0:10] != aux.When {
			aux.Quantity = total
			s.data = append(s.data, aux)
			aux.When = v.StarredSince.String()[0:10]
			aux.Quantity = 0
		}
		total++
	}
	// Now count the last day
	aux.Quantity = total
	s.data = append(s.data, aux)
}

func (s *stars) prepareGLLinks() []string {
	links := []string{}
	//links := make([]string, 0)
	var url string
	repo := strings.Split(s.repo, "/")
	url = "https://gitlab.com/api/v4/projects/"
	url += fmt.Sprintf("%s%s%s", repo[0], "%2F", repo[1])
	url += "/starrers?per_page=100&page="
	aux := url + fmt.Sprintf("%d", 1)
	links = append(links, aux)
	for i := 1; i*100 < s.y.TotalStars; i++ {
		aux = url + fmt.Sprintf("%d", i)
		links = append(links, aux)

	}
	return links
}

func (s *stars) doGLLinksRequests(links []string) {
	ch := make(chan *httpResponse)
	for _, link := range links {
		go func(link string) {
			req, err := http.NewRequest("GET", link, nil)
			if err != nil {
				log.Printf("Error 1 doGLLinksRequests %s\n", err)
			}
			req.Header.Set("PRIVATE-TOKEN", u.GITLAB_TOKEN)
			client := &http.Client{
				Transport: &http.Transport{
					TLSHandshakeTimeout: 60 * time.Second,
				},
				Timeout: 30 * time.Second,
			}
			resp, err := client.Do(req)
			if err != nil {
				log.Printf("Error 2 doGLLinksRequests %s\n", err)
			}
			id, _ := strconv.Atoi(strings.Split(link, "page=")[2])
			ch <- &httpResponse{link, resp, err, id}
		}(link)
	}
	for {
		select {
		case r := <-ch:
			if r.err != nil {
				log.Printf("ERROR 4 %s\n", r.err.Error())
				return
			}
			s.responses = append(s.responses, r)
			if len(s.responses) == len(links) {
				return
			}
		}
	}
}

func (s *stars) takeOutGLData() {
	//fmt.Println(`We got all needed data`)
	help := make([][]*star, len(s.responses))
	//fmt.Printf("%d groups are coming \n", len(help))
	for _, v := range s.responses { // sort responses
		var aux []*star
		if v.response.Status == "200 OK" {
			body, err := ioutil.ReadAll(v.response.Body)
			if err != nil {
				log.Printf("ERROR 1 takeoutdata %s\n", err)
				return
			}
			err = json.Unmarshal(body, &aux)
			if err != nil {
				log.Printf("ERROR 2 takeoutdata %s\n", err)
				return
			}
		} else {
			//fmt.Println("Working on ", i, v.response.Status)
		}
		help[v.id-1 /*-2*/] = aux
	}
	for _, v := range help {
		s.stars = append(s.stars, v...)
	}
	//fmt.Printf(`We have %d stars`, len(s.stars))
}

type getGLsimpleProject struct {
	TotalStars int    `json:"star_count"`
	Message    string `json:"message"`
}

func (s *stars) getGLTotalStars() int {
	repo := strings.Split(s.repo, "/")
	url := fmt.Sprintf("https://gitlab.com/api/v4/projects/%s%s%s",
		repo[0], "%2F", repo[1])
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("Error 1 getTotalStars %s\n", err)
		return 0
	}
	req.Header.Set("PRIVATE-TOKEN", u.GITLAB_TOKEN)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Error 2 getTotalStars %s\n", err)
		return 0
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error 3 getTotalStars %s\n", err)
		return 0
	}
	err = json.Unmarshal(body, &s.y)
	if err != nil {
		log.Printf("Error 4 getTotalStars %s\n", err)
		return 0
	}
	return s.y.TotalStars
}
