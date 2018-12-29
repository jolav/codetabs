package lib

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strings"
	"time"
)

// SendJSONToClient ...
func SendJSONToClient(w http.ResponseWriter, d interface{}) {
	w.Header().Set("Content-Type", "application/json")
	var dataJSON = []byte(`{}`)
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Printf("ERROR Marshaling %s\n", err)
		w.Write([]byte(`{}`))
	}
	w.Write(dataJSON)
}

// SendXMLToClient ...
func SendXMLToClient(w http.ResponseWriter, d interface{}) {
	w.Header().Set("Content-Type", "application/xml")
	var dataXML = []byte(`<output></output>`)
	dataXML, err := xml.Marshal(&d)
	if err != nil {
		log.Printf("ERROR Parsing into XML %s\n", err)
		w.Write([]byte(`{}`))
	}
	w.Write(dataXML)
}

// SendErrorToClient ...
func SendErrorToClient(w http.ResponseWriter, d interface{}) {
	w.WriteHeader(http.StatusBadRequest)
	w.Header().Set("Content-Type", "application/json")
	var dataJSON = []byte(`{}`)
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Printf("ERROR Marshaling %s\n", err)
		w.Write([]byte(`{}`))
	}
	w.Write(dataJSON)
}

// WriteFile ...
func WriteFile(filePath string, content string) {
	file, err := os.Create(filePath)
	if err != nil {
		log.Printf("Error WriteFile \n", err)
	}
	defer file.Close()
	file.WriteString(content)
}

// LoadJSONfromFileMarshall ...
func LoadJSONfromFileMarshall(filePath string, data interface{}) {
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
		return strings.Split(ip, ",")[0]
	}
	ip, _, _ = net.SplitHostPort(r.RemoteAddr)
	return strings.Split(ip, ",")[0]
}

// LoadConfig ...
func LoadConfig(configjson []byte, c interface{}) {
	err := json.Unmarshal(configjson, &c)
	if err != nil {
		log.Printf("ERROR LoadConfig %s\n", err)
	}
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

// GenericCommandSH ...
func GenericCommandSH(comm string) (chunk []byte, err error) {
	chunk, err = exec.Command("sh", "-c", comm).CombinedOutput()
	if err != nil {
		return nil, err
	}
	return chunk, err
}

// DownloadFile ...
func DownloadFile(filePath string, url string) (err error) {
	// Create the file
	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()
	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	// Writer the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return err
	}
	return nil
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

// RemoveProtocolAndWWWFromURL ...
func RemoveProtocolAndWWWFromURL(url string) string {
	if strings.HasPrefix(url, "https://www.") {
		return url[12:]
	}
	if strings.HasPrefix(url, "https:/www.") {
		return url[11:]
	}
	if strings.HasPrefix(url, "http://www.") {
		return url[11:]
	}
	if strings.HasPrefix(url, "http:/www.") {
		return url[10:]
	}
	return RemoveProtocolFromURL(url)
}
