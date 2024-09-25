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

	u "github.com/jolav/codetabs/_utils"
)

func (s *stars) doGHStarsRequest(w http.ResponseWriter, r *http.Request) {
	totalStars := s.getGHTotalStars()
	//fmt.Printf("%s has %d stars \n", repo, totalStars)
	if totalStars == 0 && len(s.x.Errors) > 0 { // repo || user doesn't exist
		if s.x.Errors[0].Message != "" {
			msg := s.x.Errors[0].Message
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
	url := "https://api.github.com/repos/" + s.repo + "/stargazers?per_page=100"
	s.doGHFirstRequest(w, r, url, true)
	if s.headerLink != "" {
		links := s.parseGHHeaderLink()
		s.doGHLinksRequests(links)
		s.takeOutGHData()
	}

	if len(s.stars) > 0 {
		s.convertGHStarsToData()
	}
	if totalStars > 40000 { // draw points unreachable through api limit
		var last = point{}
		last.When = time.Now().String()[:10]
		last.Quantity = totalStars
		s.data = append(s.data, last)
	}
	s.storeData()
	u.SendJSONToClient(w, s.data, 200)
}

func (s *stars) takeOutGHData() {
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
		help[v.id-2] = aux
	}
	for _, v := range help {
		s.stars = append(s.stars, v...)
	}
	//fmt.Printf(`We have %d stars`, len(stars))
}

func (s *stars) convertGHStarsToData() {
	s.data = make([]point, 0) //len(stars))
	var aux point
	total := 0
	aux.When = s.stars[0].StarredAt.String()[0:10]
	aux.Quantity = 0
	for _, v := range s.stars {
		if v.StarredAt.String()[0:10] != aux.When {
			aux.Quantity = total
			s.data = append(s.data, aux)
			aux.When = v.StarredAt.String()[0:10]
			aux.Quantity = 0
		}
		total++
	}
	// Now count the last day
	aux.Quantity = total
	s.data = append(s.data, aux)
}

func (s *stars) doGHFirstRequest(w http.ResponseWriter, r *http.Request,
	url string, flag bool,
) {
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Accept", "application/vnd.github.v3.star+json")
	req.Header.Add("User-Agent", "github stars repos")
	rndToken := u.GetRandomInt(0, 9)
	req.Header.Add("Authorization", "token "+u.GITHUB_TOKEN[rndToken])
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		msg := fmt.Sprintf("%s is not a valid resource\n", url)
		log.Printf("ERROR 5 %s -> %s\n", msg, r.URL.RequestURI())
		u.ErrorResponse(w, msg)
		return
	}
	if resp.StatusCode != 200 {
		msg := fmt.Sprintf("Error : Status %d \n", resp.StatusCode)
		log.Printf("ERROR 6 %s -> %s\n", msg, r.URL.RequestURI())
		w.Write([]byte(msg))
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR 7 %s -> %s\n", err, r.URL.RequestURI())
		return
	}
	var aux []*star
	err = json.Unmarshal(body, &aux)
	if err != nil {
		log.Printf("ERROR 8 %s -> %s\n", err, r.URL.RequestURI())
		return
	}
	if flag {
		s.headerLink = resp.Header.Get("Link")
	}
	s.stars = append(s.stars, aux...)
}

func (s *stars) doGHLinksRequests(links []string) {
	ch := make(chan *httpResponse)
	for _, link := range links {
		go func(link string) {
			req, err := http.NewRequest("GET", link, nil)
			req.Header.Add("Accept", "application/vnd.github.v3.star+json")
			req.Header.Add("User-Agent", "github stars repos")
			rndToken := u.GetRandomInt(0, 9)
			req.Header.Add("Authorization", "token "+u.GITHUB_TOKEN[rndToken])
			client := &http.Client{
				Transport: &http.Transport{
					TLSHandshakeTimeout: 60 * time.Second,
				},
				Timeout: 30 * time.Second,
			}
			resp, err := client.Do(req)
			id, _ := strconv.Atoi(strings.Split(link, "page=")[2])
			ch <- &httpResponse{link, resp, err, id}
		}(link)
	}
	for {
		select {
		case r := <-ch:
			if r.err != nil {
				//fmt.Printf("%d Error \n", r.err)
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

func (s *stars) parseGHHeaderLink() []string {
	//fmt.Println(`HEADER LINK =`, s)
	links := make([]string, 0)
	var first1 int
	var first2 int
	var last1 int
	var last2 int
	var searching = true
	for i, letter := range s.headerLink {
		if string(letter) == "<" {
			last1 = i
			if searching {
				first1 = i
			}
		}
		if string(letter) == ">" {
			last2 = i
			if searching {
				first2 = i
				searching = false
			}
		}
	}
	firstLink := s.headerLink[first1+1 : first2]
	lastLink := s.headerLink[last1+1 : last2]
	pieces := strings.Split(lastLink, "page=")
	many, err := strconv.Atoi(pieces[len(pieces)-1])
	if err != nil {
		log.Printf("ERROR parseHeaderLinks %s\n", err)
		return []string{}
	}
	link := firstLink[0 : strings.Index(firstLink, "&page=")+6]
	for i := 2; i <= many; i++ {
		links = append(links, link+strconv.Itoa(i))
	}
	return links
}

type graphqlGHStars struct {
	Data struct {
		Repository struct {
			Stargazers struct {
				TotalCount int `json:"totalCount"`
			} `json:"stargazers"`
		} `json:"repository"`
	} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"errors"`
}

func (s *stars) getGHTotalStars() int {
	repo := strings.Split(s.repo, "/")
	graphql := fmt.Sprintf(`
{
	"query": "query { repository(owner:\"%s\",name:\"%s\"){stargazers{totalCount}}}"
}
`, repo[0], repo[1])
	query := strings.NewReader(graphql)
	req, err := http.NewRequest("POST", "https://api.github.com/graphql", query)
	if err != nil {
		log.Printf("Error 1 getTotalStars %s\n", err)
		return 0
	}
	rndToken := u.GetRandomInt(0, 9)
	req.Header.Set("Authorization", "bearer "+u.GITHUB_TOKEN[rndToken])
	req.Header.Set("Content-Type", "x-www-form-urlencoded")
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
	err = json.Unmarshal(body, &s.x)
	if err != nil {
		log.Printf("Error 4 getTotalStars %s\n", err)
		return 0
	}
	return s.x.Data.Repository.Stargazers.TotalCount
}
