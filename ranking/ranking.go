/* */

package ranking

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	h "github.com/jolav/codetabs/_utils"
)

const (
	ALEXA_FILE_PATH = "./_data/alexa.txt"
)

var alexaRank map[string]int

func init() {
	fmt.Println("init Alexa")
	alexaRank = map[string]int{}
	var err error
	domains, err := h.ReadFileLineByLine(ALEXA_FILE_PATH)
	if err != nil {
		log.Print("INIT ERROR => Alexa Rank file not found")
	}
	for k, v := range domains {
		alexaRank[v] = k + 1
	}
}

type result struct {
	Web  string `json:"web"`
	Rank int    `json:"rank"`
}

func Router(w http.ResponseWriter, r *http.Request) {
	res := newResult()
	res.Web = r.URL.Query().Get("alexa")
	if res.Web == "" {
		h.SendResponse(w, nil, http.StatusBadRequest)
		return
	}
	res.alexaPosition()
	h.SendResponse(w, res, http.StatusOK)
}

func (res *result) alexaPosition() {
	res.Web = strings.ToLower(res.Web)
	res.Rank = alexaRank[res.Web]
	if res.Rank != 0 {
		return
	}
	if strings.HasPrefix(res.Web, "www.") {
		res.Rank = alexaRank[res.Web[4:len(res.Web)]]
		if res.Rank != 0 {
			return
		}
	}
	if !strings.HasPrefix(res.Web, "www.") {
		res.Rank = alexaRank["www."+res.Web]
		if res.Rank != 0 {
			return
		}
	}
}

func newResult() *result {
	res := &result{
		Web:  "",
		Rank: 0,
	}
	return res
}
