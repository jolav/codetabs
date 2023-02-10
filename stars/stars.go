/* */

package stars

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
	"github.com/jolav/codetabs/store"
)

type star struct {
	StarredAt    *time.Time `json:"starred_at"`
	StarredSince *time.Time `json:"starred_since"`
}

type point struct {
	When     string `json:"x"`
	Quantity int    `json:"y"`
}

type httpResponse struct {
	link     string
	response *http.Response
	err      error
	id       int
}

type stars struct {
	stars      []*star
	headerLink string
	data       []point
	responses  []*httpResponse
	repo       string
	x          graphqlGHStars
	y          getGLsimpleProject
	source     string
	date       string
}

func (s *stars) Router(w http.ResponseWriter, r *http.Request) {
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
	if len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	s.cleanStarsStruct()
	r.ParseForm()
	data := r.Form.Get("repo")
	s.source = data[0:2]
	s.repo = data[2:len(data)]
	aux := strings.Split(s.repo, "/")
	if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
		msg := fmt.Sprintf("Incorrect user/repo")
		u.ErrorResponse(w, msg)
		return
	}
	if s.source == "01" { // github
		s.source = "github"
		s.doGHStarsRequest(w, r)
	} else if s.source == "02" { // gitlab
		s.source = "gitlab"
		s.doGLStarsRequest(w, r)
	} else {
		msg := fmt.Sprintf("Incorrect repos source")
		u.ErrorResponse(w, msg)
		return
	}
}

func (s *stars) storeData() {
	d := store.NewDataStars()

	dataJSON, err := json.Marshal(s.data)
	if err != nil {
		log.Printf("ERROR Marshaling %s\n", err)
		d.Data = string(`{}`)
	} else {
		d.Data = string(dataJSON)
	}
	d.Date = time.Now().Format("2006-01-02 15:04:05.000")
	d.Repo = s.source + "/" + s.repo
	d.Source = s.source
	d.Total = len(s.stars)
	//u.PrettyPrintStruct(d)
	go d.SaveDataStars()
}

func (s *stars) cleanStarsStruct() {
	s.stars = []*star{}
	s.headerLink = ""
	s.data = []point{}
	s.responses = []*httpResponse{}
	s.repo = ""
	s.x = graphqlGHStars{}
	s.y = getGLsimpleProject{}
	s.source = ""
	s.date = time.Now().Format(time.RFC1123)
}

func NewStars(test bool) stars {
	s := stars{
		stars:      []*star{},
		headerLink: "",
		data:       []point{},
		responses:  []*httpResponse{},
		repo:       "",
		x:          graphqlGHStars{},
		y:          getGLsimpleProject{},
		source:     "",
		date:       "",
	}
	return s
}
