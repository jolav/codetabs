/* */

package store

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type dataLoc struct {
	Repo   string `json:"repo"`
	Source string `json:"source"`
	Date   string `json:"date"`
	Data   string `json:"data"`
}

func (d dataLoc) SaveDataLoc() {
	d.replaceLoc()
	//LoadDataLoc(d)
}

func (d dataLoc) replaceLoc() {
	sql := fmt.Sprintf("REPLACE INTO %s (repo, source, date, data) VALUES (?, ?, ?, ?)",
		locTable)
	stmt, err := MyDB.Prepare(sql)
	if err != nil {
		log.Printf("Error DB 1 replaceLoc => %s\n", err)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(d.Repo, d.Source, d.Date, d.Data)
	if err != nil {
		log.Printf("Error DB 2 replaceLoc => %s\n", err)
		return
	}
}

func (d dataLoc) LoadDataLoc() {
	type languageOUT struct {
		Name     string `json:"language"`
		Files    int    `json:"files"`
		Lines    int    `json:"lines"`
		Blanks   int    `json:"blanks"`
		Comments int    `json:"comments"`
		Code     int    `json:"linesOfCode"`
	}
	var languagesOUT []languageOUT
	err := json.Unmarshal([]byte(d.Data), &languagesOUT)
	if err != nil {
		log.Printf("ERROR LoadConfig %s\n", err)
	}
	//u.PrettyPrintStruct(languagesOUT)
}

func NewDataLoc() dataLoc {
	d := dataLoc{
		Repo:   "",
		Source: "",
		Date:   time.Now().Format("2006-01-02 15:04:05.000"),
		Data:   "{}",
	}
	return d
}
