/* */

package _utils

import (
	"encoding/json"
	"log"
	"os"
	"os/exec"
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

// CreateCustomErrorLogFile ...
func CreateCustomErrorLogFile(f string) *os.File {
	mylog, err := os.OpenFile(f, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("ERROR opening Error log file %s\n", err)
	}
	log.SetOutput(mylog)
	return mylog
}
