package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	db "./_db"
)

var mu sync.Mutex

func saveHit(service, mode, ip, from, quest string) {
	mu.Lock()
	defer mu.Unlock()

	layout := "2006-01-02 15:04:05"
	now := time.Now().Format(layout)
	quest = strings.Trim(quest, fmt.Sprintf("/v1/%s", service))
	if from == "" {
		from = "undefined"
	}
	service = strings.ToUpper(service)
	text := fmt.Sprintf("INFO %s %s %s %s %s\n", now, ip, service, from, quest)

	// save hit to DB
	if mode == "production" {
		db.MYDB.InsertHit(service, strings.Split(now, " ")[0])
	} else {
		//fmt.Println(`TESTING ... DO NOT DB SAVE`)
	}

	var hitsLog = c.App.HitsLog
	hits, err := os.OpenFile(hitsLog, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("ERROR opening hits file %s\n", err)
		hits.Close()
		return
	}
	_, err = hits.WriteString(text)
	if err != nil {
		log.Printf("ERROR logging new hit %s\n", err)
		hits.Close()
		return
	}
	defer hits.Close()
}
