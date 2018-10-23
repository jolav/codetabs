package stats

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// AddHit ...
func AddHit(service, mode, ip, quest string) {
	layout := "2006-01-02 15:04:05"
	now := time.Now().Format(layout)
	text := fmt.Sprintf("INFO %s %s %s\n", now, ip, quest)
	var filename = fmt.Sprintf("./logs/%s-hits.log", service)
	hits, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatal(err)
	}
	_, err = hits.WriteString(text)
	if err != nil {
		hits.Close()
		log.Fatal(err)
	}
	defer hits.Close()
	// save hit to DB
	if mode == "production" {
		MYDB.insertHit(service, strings.Split(now, " ")[0])
	} else {
		// fmt.Println(`TESTING ... DO NOT DB SAVE`)
	}
}
