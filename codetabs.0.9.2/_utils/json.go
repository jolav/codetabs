/* */

package _utils

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
)

// LoadJSONFile ...
func LoadJSONFile(filePath string, data interface{}) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Cannot open config file %s\n", err)
	}
	defer file.Close()
	body, err := ioutil.ReadAll(file) //	get file content
	if err != nil {
		log.Printf("Error 1 LoadJSONfromFileMarshall %s\n", err)
	}
	err = json.Unmarshal(body, &data)
	if err != nil {
		log.Printf("Error 2 LoadJSONfromFileMarshall %s\n", err)
	}
}

// LoadJSONConfig ...
func LoadJSONConfig(configjson []byte, c interface{}) {
	err := json.Unmarshal(configjson, &c)
	if err != nil {
		log.Printf("ERROR LoadConfig %s\n", err)
	}
}

// WriteJSONtoFile ...
func WriteJSONtoFile(filePath string, d interface{}) {
	f, err := os.Create(filePath)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	e := json.NewEncoder(f)
	e.Encode(&d)
}
