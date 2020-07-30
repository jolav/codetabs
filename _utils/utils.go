/* */

package _utils

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
	"strings"
)

// PrettyPrintStruct ...
func PrettyPrintStruct(s interface{}) {
	result, _ := json.MarshalIndent(s, "", "    ") //"\t")
	log.Print(string(result), "\n")
}

// SliceContainsString ... returns true/false
func SliceContainsString(str string, slice []string) bool {
	for _, v := range slice {
		if v == str {
			return true
		}
	}
	return false
}

// GenericCommandSH ...
func GenericCommandSH(comm string) (chunk []byte, err error) {
	chunk, err = exec.Command("sh", "-c", comm).CombinedOutput()
	if err != nil {
		return nil, err
	}
	return chunk, err
}

// GenericCommand ...
func GenericCommand(args []string) (err error) {
	_, err = exec.Command(args[0], args[1:len(args)]...).CombinedOutput()
	if err != nil {
		//fmt.Println("ERROR CMD= ", err)
		return err
	}
	return err
}

// CreateCustomErrorLogFile ...
func CreateCustomErrorLogFile(f string) *os.File {
	mylog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Error log file %s\n", err)
	}
	log.SetOutput(mylog)
	return mylog
}

// RemoveProtocolFromURL ...
func RemoveProtocolFromURL(url string) string {
	if strings.HasPrefix(url, "https://") {
		return url[8:]
	}
	if strings.HasPrefix(url, "https:/") {
		return url[7:]
	}
	if strings.HasPrefix(url, "http://") {
		return url[7:]
	}
	if strings.HasPrefix(url, "http:/") {
		return url[6:]
	}
	return url
}

// WriteFile ...
func WriteFile(filePath string, content string) {
	file, err := os.Create(filePath)
	if err != nil {
		log.Printf("Error WriteFile %v\n", err)
	}
	defer file.Close()
	file.WriteString(content)
}
