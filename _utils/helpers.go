/* */

package utils

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
)

func Includes(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func PrettyPrintStruct(s interface{}) {
	result, _ := json.MarshalIndent(s, "", "    ") //"\t")
	fmt.Print(string(result), "\n")
}

func CheckFlags(version, when string) {
	versionFlag := flag.Bool("v", false, "Show current version and exit")
	flag.Parse()
	switch {
	case *versionFlag:
		fmt.Printf("Version:\t: %s\n", version)
		fmt.Printf("Date   :\t: %s\n", when)
		os.Exit(0)
	}
}

func CreateCustomErrorLogFile(f string) *os.File {
	mylog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening error log file %s\n", err)
	}
	log.SetOutput(mylog)
	return mylog
}

func NewBanFile(f string) *log.Logger {
	infoLog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Ban log file %s\n", err)
	}
	bannedLog := log.New(infoLog, "BANNED: ", log.Ldate|log.Ltime)
	//hitsLog := log.New(infoLog, "HIT :\t", log.Ldate|log.Ltime)
	return bannedLog
}

func NewHitsFile(f string) *log.Logger {
	infoLog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Info log file %s\n", err)
	}
	hitsLog := log.New(infoLog, "HIT: ", log.Ldate|log.Ltime)
	//hitsLog := log.New(infoLog, "HIT :\t", log.Ldate|log.Ltime)
	return hitsLog
}

func ReadFileLineByLine(filePath string) ([]string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return lines, nil
}
