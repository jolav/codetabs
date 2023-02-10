/* */

package store

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

type dataStars struct {
	Repo   string `json:"repo"`
	Source string `json:"source"`
	Date   string `json:"date"`
	Total  int    `json:"total"`
	Data   string `json:"data"`
}

func (d dataStars) SaveDataStars() {
	d.replaceStars()
	//LoadDataStars(d)

}

func (d dataStars) replaceStars() {
	sql := fmt.Sprintf("REPLACE INTO %s (repo, source, date, total, data) VALUES (?, ?, ?, ?, ?)",
		starsTable)
	stmt, err := MyDB.Prepare(sql)
	if err != nil {
		log.Printf("Error DB 1 replaceStars => %s\n", err)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(d.Repo, d.Source, d.Date, d.Total, d.Data)
	if err != nil {
		log.Printf("Error DB 2 replaceStars => %s\n", err)
		return
	}
}

func (d dataStars) LoadDataStars() {
	type point struct {
		When     string `json:"x"`
		Quantity int    `json:"y"`
	}
	var data []point
	err := json.Unmarshal([]byte(d.Data), &data)
	if err != nil {
		log.Printf("ERROR LoadConfig %s\n", err)
	}
	u.PrettyPrintStruct(data)
}

func NewDataStars() dataStars {
	d := dataStars{
		Repo:   "",
		Source: "",
		Date:   time.Now().Format("2006-01-02 15:04:05.000"),
		Total:  0,
		Data:   "{}",
	}
	return d
}
