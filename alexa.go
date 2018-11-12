package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	lib "./_lib" 
)

func doAlexaRequest(w http.ResponseWriter, web string) {
	o := &alexaOutput{}
	o.Web = web
	o.Rank = alexaList[o.Web]
	if o.Rank != 0 {
		lib.SendJSONToClient(w, o)
		return
	}
	if strings.HasPrefix(o.Web, "www.") {
		o.Web = o.Web[4:len(o.Web)]
		o.Rank = alexaList[o.Web]
		if o.Rank != 0 {
			lib.SendJSONToClient(w, o)
			return
		}
	}
	if !strings.HasPrefix(o.Web, "www.") {
		o.Rank = alexaList["www."+o.Web]
		if o.Rank != 0 {
			lib.SendJSONToClient(w, o)
			return
		}
	}
	e.Error = fmt.Sprintf("%s not in alexa top 1 million", o.Web)
	lib.SendErrorToClient(w, e)
	return
}

func loadDataInMemory() {
	alexaList = make(map[string]int) //, 1000000)
	file, err := os.Open(c.Alexa.DataFilePath)
	if err != nil {
		log.Printf("ERROR 1 loading Alexa data in memory %s\n", err)
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		domain := strings.Split(line, ",")[1]
		rank, _ := strconv.Atoi(strings.Split(line, ",")[0])
		alexaList[domain] = rank
	}
	err = scanner.Err()
	if err != nil {
		log.Printf("ERROR 2 loading Alexa data in memory %s\n", err)
	}
}

func onceADayTask() {
	t := time.Now()
	n := time.Date(t.Year(), t.Month(), t.Day(), 3, 10, 10, 0, t.Location())
	d := n.Sub(t)
	if d < 0 {
		n = n.Add(24 * time.Hour)
		d = n.Sub(t)
	}
	for {
		time.Sleep(d)
		d = 24 * time.Hour
		downloadDataFile()
	}
}

func downloadDataFile() {
	deleteZip()
	err := lib.DownloadFile(c.Alexa.ZipFilePath, c.Alexa.DataFileURL)
	if err != nil {
		log.Printf("ERROR downloading Zip %s\n", err)
		return
	}
	deleteCsv()
	unzipCsv()
	loadDataInMemory()
}

func deleteZip() {
	_, err := lib.GenericCommandSH("rm " + c.Alexa.ZipFilePath)
	if err != nil {
		log.Printf("ERROR deleting Zip %s\n", err)
	}
}

func deleteCsv() {
	_, err := lib.GenericCommandSH("rm " + c.Alexa.DataFilePath)
	if err != nil {
		log.Printf("ERROR deleting CSV %s\n", err)
	}
}

func unzipCsv() {
	com := fmt.Sprintf("unzip %s -d %s", c.Alexa.ZipFilePath, c.Alexa.DataDir)
	_, err := lib.GenericCommandSH(com)
	if err != nil {
		log.Printf("ERROR unzipping data %s\n", err)
	}
}
