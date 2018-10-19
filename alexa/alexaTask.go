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

	lib "../_lib"
)

func getRankByDomain(w http.ResponseWriter, r *http.Request) {

	o.Rank = list[o.Domain]
	if o.Rank != 0 {
		lib.SendJSONToClient(w, o)
		return
	}
	if strings.HasPrefix(o.Domain, "www.") {
		o.Domain = o.Domain[4:len(o.Domain)]
		o.Rank = list[o.Domain]
		if o.Rank != 0 {
			lib.SendJSONToClient(w, o)
			return
		}
	}
	if !strings.HasPrefix(o.Domain, "www.") {
		o.Rank = list["www."+o.Domain]
		if o.Rank != 0 {
			lib.SendJSONToClient(w, o)
			return
		}
	}
	e.Error = fmt.Sprintf("%s not in alexa top 1 million", o.Domain)
	lib.SendErrorToClient(w, e)
	return
}

func loadDataInMemory() {
	list = make(map[string]int) //, 1000000)
	file, err := os.Open(dataFile)
	if err != nil {
		log.Fatal(fmt.Sprintf("ERROR LOADING DATA IN MEMORY %s", err))
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		domain := strings.Split(line, ",")[1]
		rank, _ := strconv.Atoi(strings.Split(line, ",")[0])
		list[domain] = rank
	}
	if err := scanner.Err(); err != nil {
		log.Fatal(fmt.Sprintf("ERROR LOADING DATA IN MEMORY %s", err))
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
	err := lib.DownloadFile(zipFile, dataFileURL)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR downloading Zip %s", err))
		return
	}
	deleteCsv()
	unzipCsv()
	loadDataInMemory()
}

func deleteZip() {
	_, err := lib.GenericCommandSH("rm " + zipFile)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR deleting Zip %s", err))
	}
}

func deleteCsv() {
	_, err := lib.GenericCommandSH("rm " + dataFile)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR deleting CSV %s", err))
	}
}

func unzipCsv() {
	com := "unzip ./data/top-1m.csv.zip -d ./data"
	_, err := lib.GenericCommandSH(com)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR unzipping data %s", err))
	}
}
