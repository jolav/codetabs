package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	lib "./_lib"
)

var stars []*star

var headerLink string

var data []point

var responses []*httpResponse

func doStarsRequest(w http.ResponseWriter, r *http.Request, repo string) {
	e = myError{}
	stars = []*star{}
	data = []point{}
	x = graphqlStars{}
	totalStars := getTotalStars(repo)
	//fmt.Printf("%s has %d stars \n", repo, totalStars)
	if totalStars == 0 && len(x.Errors) > 0 { // repo || user doesn't exist
		if x.Errors[0].Message != "" {
			log.Printf("ERROR %s\n", x.Errors[0].Message)
			e.Error = x.Errors[0].Message
			lib.SendErrorToClient(w, e)
			return
		}
	}
	if totalStars == 0 { // repo exists but has no stars
		lib.SendJSONToClient(w, data)
		return
	}
	url := "https://api.github.com/repos/" + repo + "/stargazers?per_page=100"
	doFirstRequest(w, r, url, true)
	if e.Error != "" { // api limit errors go here
		log.Printf("ERROR %s\n", e.Error)
		lib.SendErrorToClient(w, e)
		return
	}
	if headerLink != "" {
		links := parseHeaderLink(headerLink)
		doLinksRequests(links)
		takeOutData()
	}
	if e.Error != "" { // fetching errors go here
		log.Printf("ERROR %s\n", e.Error)
		lib.SendErrorToClient(w, e)
		return
	}
	if len(stars) > 0 {
		convertStarsToData()
	}
	if totalStars > 40000 { // draw points unreachable through api limit
		var last = point{}
		last.When = time.Now().String()[:10]
		last.Quantity = totalStars
		data = append(data, last)
	}
	lib.SendJSONToClient(w, data)
	//fmt.Printf("REQUEST END, from %d STARS to %d POINTS\n", len(stars), len(data))
}

func takeOutData() {
	//fmt.Println(`We got all needed data`)
	help := make([][]*star, len(responses))
	//fmt.Printf("%d groups are coming \n", len(help))
	for _, v := range responses { // sort responses
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
		stars = append(stars, v...)
	}
	//fmt.Printf(`We have %d stars`, len(stars))
}

func doLinksRequests(links []string) {
	ch := make(chan *httpResponse)
	responses = []*httpResponse{}
	for _, link := range links {
		go func(link string) {
			req, err := http.NewRequest("GET", link, nil)
			req.Header.Add("Accept", "application/vnd.github.v3.star+json")
			req.Header.Add("User-Agent", "github stars repos")
			rndToken := lib.GetRandomInt(0, 9)
			req.Header.Add("Authorization", "token "+g.GitHub.Token[rndToken])
			client := &http.Client{
				Transport: &http.Transport{
					TLSHandshakeTimeout: 120 * time.Second,
				},
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
				log.Printf("ERROR %s\n", r.err.Error())
				e.Error = r.err.Error()
				return
			}
			responses = append(responses, r)
			if len(responses) == len(links) {
				return
			}
		}
	}
}

func convertStarsToData() {
	data = make([]point, 0) //len(stars))
	var aux point
	total := 0
	aux.When = stars[0].StarredAt.String()[0:10]
	aux.Quantity = 0
	for _, v := range stars {
		if v.StarredAt.String()[0:10] != aux.When {
			aux.Quantity = total
			data = append(data, aux)
			aux.When = v.StarredAt.String()[0:10]
			aux.Quantity = 0
		}
		total++
	}
	// Now count the last day
	aux.Quantity = total
	data = append(data, aux)
}

func doFirstRequest(w http.ResponseWriter, r *http.Request, url string, flag bool) {
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Accept", "application/vnd.github.v3.star+json")
	req.Header.Add("User-Agent", "github stars repos")
	rndToken := lib.GetRandomInt(0, 9)
	req.Header.Add("Authorization", "token "+g.GitHub.Token[rndToken])
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		e.Error = fmt.Sprintf("%s is not a valid resource\n", url)
		log.Printf("ERROR %s -> %s\n", e.Error, r.URL.RequestURI())
		lib.SendErrorToClient(w, e)
		return
	}
	if resp.StatusCode != 200 {
		e.Error = fmt.Sprintf("Error : Status %d \n", resp.StatusCode)
		log.Printf("ERROR %s -> %s\n", e.Error, r.URL.RequestURI())
		w.Write([]byte(e.Error))
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR %s -> %s\n", err, r.URL.RequestURI())
		return
	}
	var aux []*star
	err = json.Unmarshal(body, &aux)
	if err != nil {
		log.Printf("ERROR %s -> %s\n", err, r.URL.RequestURI())
		return
	}
	if flag {
		headerLink = resp.Header.Get("Link")
	}
	stars = append(stars, aux...)
}

func parseHeaderLink(s string) []string {
	//fmt.Println(`HEADER LINK =`, s)
	links := make([]string, 0)
	var first1 int
	var first2 int
	var last1 int
	var last2 int
	var searching = true
	for i, letter := range s {
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
	firstLink := s[first1+1 : first2]
	lastLink := s[last1+1 : last2]
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

var x graphqlStars

type graphqlStars struct {
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

func getTotalStars(target string) int {
	x = graphqlStars{}
	repo := strings.Split(target, "/")
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
	rndToken := lib.GetRandomInt(0, 9)
	req.Header.Set("Authorization", "bearer "+g.GitHub.Token[rndToken])
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
	err = json.Unmarshal(body, &x)
	if err != nil {
		log.Printf("Error 4 getTotalStars %s\n", err)
		return 0
	}
	return x.Data.Repository.Stargazers.TotalCount
}
