/* */

package random

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	h "github.com/jolav/codetabs/_utils"
)

var surnameList []string

const (
	namesListPath = "_data/surnames.txt"
)

func init() {
	fmt.Println("init Random")
	var err error
	surnameList, err = h.ReadFileLineByLine(namesListPath)
	if err != nil {
		log.Print("Surnames files not found")
		surnameList = []string{}
	}
	fmt.Sprintln(surnameList)
}

func Router(w http.ResponseWriter, r *http.Request) {
	rd := newRandom()
	action := strings.ToLower(r.PathValue("action"))
	switch action {
	case "integer":
		err := rd.randomInteger(r)
		if err != nil {
			log.Printf("ERROR Random 1 - Bad Parameters => %v", err)
			h.SendResponse(w, nil, http.StatusBadRequest)
			return
		}
		h.SendResponse(w, rd, http.StatusOK)
	case "list":
		err := rd.randomList(r)
		if err != nil {
			log.Printf("ERROR Random 2 - Bad Parameters => %v", err)
			h.SendResponse(w, nil, http.StatusBadRequest)
			return
		}
		h.SendResponse(w, rd, http.StatusOK)
	case "name":
		err := rd.randomName()
		if err != nil {
			log.Printf("ERROR Random 3 => %v", err)
			h.SendResponse(w, nil, http.StatusBadRequest)
			return
		}
		h.SendResponse(w, rd, http.StatusOK)
	default:
		h.SendResponse(w, nil, http.StatusBadRequest)
		return
	}
}

type random struct {
	Quest  string `json:"quest"`
	Result []int  `json:"data,omitempty"`
	Name   string `json:"name,omitempty"`
}

func (rd *random) randomInteger(r *http.Request) error {
	r.ParseForm()
	min, err := strconv.Atoi(r.Form.Get("min"))
	if err != nil {
		err := fmt.Sprintf("min => %v", err)
		return errors.New(err)
	}
	max, err := strconv.Atoi(r.Form.Get("max"))
	if err != nil {
		err := fmt.Sprintf("max => %v", err)
		return errors.New(err)
	}
	times := 1
	timeStr := r.Form.Get("times")
	if timeStr != "" {
		times, err = strconv.Atoi(r.Form.Get("times"))
		if err != nil {
			err := fmt.Sprintf("times => %v", err)
			return errors.New(err)
		}
	}
	if times > 10000 || times < 1 {
		return errors.New("times out of range 1-10000")
	}
	if min > max || min < 0 || max > 10_000_000_000 {
		return errors.New("min-max out of range")
	}

	if times == 1 {
		rd.Quest = fmt.Sprintf("Random Integer between %d-%d", min, max)
	} else {
		rd.Quest = fmt.Sprintf("%d Random Integers between %d-%d", times, min, max)
	}
	for time := 1; time <= times; time++ {
		rd.Result = append(rd.Result, h.RandomInt(min, max))
	}
	return nil
}

func (rd *random) randomList(r *http.Request) error {
	r.ParseForm()
	elements, err := strconv.Atoi(r.Form.Get("len"))
	if err != nil || elements < 2 || elements > 10000 {
		err := fmt.Sprintf("len out of range 1-10000 => %v", err)
		return errors.New(err)
	}

	rd.Quest = fmt.Sprintf("Randomized order list with %d elements", elements)
	element := 0
	for element < elements {
		number := h.RandomInt(1, elements)
		if !h.IncludesInt(rd.Result, number) {
			rd.Result = append(rd.Result, number)
			element++
		}
	}
	return nil
}

func (rd *random) randomName() error {
	pos := h.RandomInt(0, len(surnameList)-1)
	rd.Quest = "Random Name"
	rd.Name = surnameList[pos]
	return nil
}

func newRandom() *random {
	rd := &random{
		Quest:  "",
		Result: []int{},
		Name:   "",
	}
	return rd
}
