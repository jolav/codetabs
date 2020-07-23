/* */

package alexa

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

const (
	DATA_FILE_PATH      = "./_data/alexa/top-1m.csv"
	DATA_FILE_PATH_TEST = "../_data/alexa/top-1m.csv"
	ZIP_FILE            = "./_data/alexa/top-1m.csv.zip"
	DATA_DIR            = "./_data/alexa"
	DATA_FILE_URL       = "https://s3.amazonaws.com/alexa-static/top-1m.csv.zip"
)

type alexa struct {
	config    config
	alexaList map[string]int
	output    output
}

type config struct {
	DataFilePath string
	ZipFilePath  string `json:"zipFile"`
	DataDir      string
	DataFileURL  string
}

type output struct {
	Web  string `json:"web"`
	Rank int    `json:"rank"`
}

func (a *alexa) Router(w http.ResponseWriter, r *http.Request) {
	params := strings.Split(strings.ToLower(r.URL.Path), "/")
	path := params[1:len(params)]
	if path[len(path)-1] == "" { // remove last empty slot after /
		path = path[:len(path)-1]
	}
	//log.Printf("Going ....%s %s %d", path, r.Method, len(path))
	if len(path) < 2 || path[0] != "v1" {
		u.BadRequest(w, r)
		return
	}
	r.ParseForm()
	web := r.Form.Get("web")
	if web == "" {
		u.BadRequest(w, r)
		return
	}
	a.doAlexaRequest(w, web)
}

func (a *alexa) doAlexaRequest(w http.ResponseWriter, web string) {
	a.output.Web = web
	a.output.Rank = a.alexaList[a.output.Web]
	if a.output.Rank != 0 {
		u.SendJSONToClient(w, a.output, 200)
		return
	}
	if strings.HasPrefix(a.output.Web, "www.") {
		a.output.Web = a.output.Web[4:len(a.output.Web)]
		a.output.Rank = a.alexaList[a.output.Web]
		if a.output.Rank != 0 {
			u.SendJSONToClient(w, a.output, 200)
			return
		}
	}
	if !strings.HasPrefix(a.output.Web, "www.") {
		a.output.Rank = a.alexaList["www."+a.output.Web]
		if a.output.Rank != 0 {
			u.SendJSONToClient(w, a.output, 200)
			return
		}
	}
	msg := fmt.Sprintf("%s not in alexa top 1 million", a.output.Web)
	u.ErrorResponse(w, msg)
	return
}

func (a *alexa) loadDataInMemory() {
	file, err := os.Open(a.config.DataFilePath)
	if err != nil {
		log.Printf("ERROR 1 loading Alexa data in memory %s\n", err)
		return
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		domain := strings.Split(line, ",")[1]
		rank, _ := strconv.Atoi(strings.Split(line, ",")[0])
		a.alexaList[domain] = rank
	}
	err = scanner.Err()
	if err != nil {
		log.Printf("ERROR 2 loading Alexa data in memory %s\n", err)
	}
}

func (a *alexa) OnceADayTask() {
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
		a.downloadDataFile()
	}
}

func (a *alexa) downloadDataFile() {
	a.deleteZip()
	err := u.DownloadFile(a.config.ZipFilePath, a.config.DataFileURL)
	if err != nil {
		log.Printf("ERROR downloading Zip %s\n", err)
		return
	}
	a.deleteCsv()
	a.unzipCsv()
	a.loadDataInMemory()
}

func (a *alexa) deleteZip() {
	_, err := u.GenericCommandSH("rm " + a.config.ZipFilePath)
	if err != nil {
		log.Printf("ERROR deleting Zip %s\n", err)
	}
}

func (a *alexa) deleteCsv() {
	_, err := u.GenericCommandSH("rm " + a.config.DataFilePath)
	if err != nil {
		log.Printf("ERROR deleting CSV %s\n", err)
	}
}

func (a *alexa) unzipCsv() {
	com := fmt.Sprintf("unzip %s -d %s", a.config.ZipFilePath, a.config.DataDir)
	_, err := u.GenericCommandSH(com)
	if err != nil {
		log.Printf("ERROR unzipping data %s\n", err)
	}
}

func NewAlexa(test bool) alexa {
	a := alexa{
		config: config{
			DataFilePath: DATA_FILE_PATH,
			ZipFilePath:  ZIP_FILE,
			DataDir:      DATA_DIR,
			DataFileURL:  DATA_FILE_URL,
		},
		alexaList: make(map[string]int),
		output: output{
			Web:  "",
			Rank: 0,
		},
	}
	if test {
		a.config.DataFilePath = DATA_FILE_PATH_TEST
	}
	a.loadDataInMemory()
	return a
}
