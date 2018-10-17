package lib

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"time"
)

// SendJSONToClient ...
func SendJSONToClient(w http.ResponseWriter, d interface{}) {
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(dataJSON)
}

// SendXMLToClient ...
func SendXMLToClient(w http.ResponseWriter, d interface{}) {
	dataXML, err := xml.Marshal(&d)
	if err != nil {
		log.Fatal(err)
	}
	w.Header().Set("Content-Type", "application/xml")
	w.Write(dataXML)
}

// SendErrorToClient ...
func SendErrorToClient(w http.ResponseWriter, d interface{}) {
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Fatal(err)
	}
	w.WriteHeader(http.StatusBadRequest)
	w.Header().Set("Content-Type", "application/json")
	w.Write(dataJSON)
}

// WriteFile ...
func WriteFile(filePath string, content string) {
	file, err := os.Create(filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	file.WriteString(content)
}

// LoadJSONfromFileMarshall ...
func LoadJSONfromFileMarshall(filePath string, data interface{}) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatalln("Cannot open config file", err)
	}
	defer file.Close()
	body, err := ioutil.ReadAll(file) //	get file content
	if err != nil {
		log.Fatalln(err)
	}
	err = json.Unmarshal(body, &data)
	if err != nil {
		log.Fatalln(err)
	}
}

// GetRandomInt [min, max] both included
func GetRandomInt(min, max int) int {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	//rand.Seed(time.Now().UnixNano())
	//	return rand.Intn(max-min+1) + min
	return r.Intn(max-min+1) + min
}

// ToFixedFloat64 (untruncated, num) -> untruncated.toFixed(num)
func ToFixedFloat64(untruncated float64, precision int) float64 {
	coef := math.Pow10(precision)
	truncated := float64(int(untruncated*coef)) / coef
	return truncated
}

// IsJSON ...
func IsJSON(str string) bool {
	var js json.RawMessage
	return json.Unmarshal([]byte(str), &js) == nil
}

// IsValidURL ...
func IsValidURL(rawurl string) bool {
	_, err := url.ParseRequestURI(rawurl)
	if err != nil {
		return false
	}
	return true
}

// GetIP ...
func GetIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if len(ip) > 0 {
		return ip
	}
	ip, _, _ = net.SplitHostPort(r.RemoteAddr)
	return ip
}

// LoadConfig ...
func LoadConfig(configjson []byte, c interface{}) {
	err := json.Unmarshal(configjson, &c)
	if err != nil {
		fmt.Println(err)
	}
}

// GenericCommand ...
func GenericCommand(args []string) (err error) {
	_, err = exec.Command(args[0], args[1:len(args)]...).CombinedOutput()
	if err != nil {
		fmt.Println("ERROR CMD= ", err)
		return err
	}
	return err
}
