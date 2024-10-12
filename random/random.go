/* */

package random

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	u "github.com/jolav/codetabs/_utils"
)

var surnameList []string

const (
	SURNAMES_FILE_PATH = "_data/random/surnames.txt"
)

func init() {
	fmt.Println("init Random")
	var err error
	surnameList, err = u.ReadFileLineByLine(SURNAMES_FILE_PATH)
	if err != nil {
		log.Print("INIT ERROR => Surnames files not found")
		surnameList = []string{}
	}
	fmt.Sprintln(surnameList)
}

type randomOLD struct {
	Quest  string `json:"quest"`
	Result []int  `json:"data"`
}

type random struct {
	Quest  string `json:"quest"`
	Result []int  `json:"data,omitempty"`
	Name   string `json:"name,omitempty"`
}

func Router(w http.ResponseWriter, r *http.Request) {
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		u.BadRequest(w, r)
		return
	}
	if len(path) != 3 {
		u.BadRequest(w, r)
		return
	}

	if r.Method == "POST" {
		u.BadRequest(w, r)
		return
	}

	rd := newRandom()
	randomType := path[2]
	switch randomType {
	case "integer":
		rd.randomInteger(w, r)
	case "list":
		rd.randomList(w, r)
	case "name":
		rd.randomName(w, r)
	default:
		u.BadRequest(w, r)
		return
	}
}

func (rd random) randomInteger(w http.ResponseWriter, r *http.Request) {
	times := 1

	r.ParseForm()
	min, err := strconv.Atoi(r.Form.Get("min"))
	if err != nil {
		u.BadRequest(w, r)
		return
	}
	max, err := strconv.Atoi(r.Form.Get("max"))
	if err != nil || min > max || min < 0 || max > 10000000000 {
		u.BadRequest(w, r)
		return
	}
	if r.Form.Get("times") != "" {
		times, err = strconv.Atoi(r.Form.Get("times"))
		if err != nil || times > 10000 {
			u.BadRequest(w, r)
			return
		}
	}
	if times == 1 {
		rd.Quest = fmt.Sprintf("Random Integer between %d-%d", min, max)
	} else {
		rd.Quest = fmt.Sprintf("%d Random Integers between %d-%d", times, min, max)
	}

	for time := 1; time <= times; time++ {
		rd.Result = append(rd.Result, u.GetRandomInt(min, max))
	}

	u.SendJSONToClient(w, rd, 200)
}

func (rd random) randomList(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	elements, err := strconv.Atoi(r.Form.Get("len"))
	if err != nil || elements < 2 || elements > 10000 {
		u.BadRequest(w, r)
		return
	}

	rd.Quest = fmt.Sprintf("Randomized order list with %d elements", elements)
	element := 0
	for element < elements {
		number := u.GetRandomInt(1, elements)
		if !u.SliceContainsInteger(number, rd.Result) {
			rd.Result = append(rd.Result, number)
			element++
		}
	}
	u.SendJSONToClient(w, rd, 200)
}

func (rd random) randomName(w http.ResponseWriter, r *http.Request) {
	pos := u.GetRandomInt(0, len(surnameList)-1)
	rd.Quest = "Random Name"
	rd.Name = surnameList[pos]
	u.SendJSONToClient(w, rd, 200)
}

func newRandom() random {
	rd := random{
		Quest:  "",
		Result: []int{},
		Name:   "",
	}
	return rd
}
