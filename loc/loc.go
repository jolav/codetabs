/* */

package loc

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

const (
	LOC_LINUX = "./_data/loc/locLinux"
	MAX_SIZE  = 500
)

type loc struct {
	order     string
	orderInt  int
	repo      string
	size      int
	languages []language
}

type language struct {
	Name     string `json:"language"`
	Files    int    `json:"files"`
	Lines    int    `json:"lines"`
	Blanks   int    `json:"blanks"`
	Comments int    `json:"comments"`
	Code     int    `json:"linesOfCode"`
}

func (l *loc) Router(w http.ResponseWriter, r *http.Request) {
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
	l.languages = []language{}
	if r.Method == "POST" {
		l.orderInt++
		l.order = strconv.Itoa(l.orderInt)
		l.doLocUploadRequest(w, r)
		return
	}
	r.ParseForm()
	l.repo = r.Form.Get("github")
	aux := strings.Split(l.repo, "/")
	if len(aux) != 2 || aux[0] == "" || aux[1] == "" {
		msg := fmt.Sprintf("Incorrect user/repo")
		u.ErrorResponse(w, msg)
		return
	}
	if len(path) != 2 {
		u.BadRequest(w, r)
		return
	}
	l.orderInt++
	l.order = strconv.Itoa(l.orderInt)
	l.doLocRepoRequest(w, r)

}

func (l *loc) doLocRepoRequest(w http.ResponseWriter, r *http.Request) {
	folder := l.order
	repo := l.repo
	//repouser := strings.Split(repo, "/")[0]
	folderNum := folder
	folder = "_tmp/loc/" + folder
	//reponame := strings.Split(repo, "/")[1]

	if !l.existRepo(repo) {
		msg := repo + " doesn't exist"
		u.ErrorResponse(w, msg)
		return
	}

	if l.exceedsSize(w) {
		msg := fmt.Sprintf(`repo %s too big (>%dMB) = %d MB`,
			l.repo,
			MAX_SIZE,
			l.size,
		)
		u.ErrorResponse(w, msg)
		return
	}

	destroyTemporalDir := []string{"rm", "-r", folder}
	createTemporalDir := []string{"mkdir", folder}
	err := u.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR cant create temporal dir %s\n", err)
		msg := "Cant create temporal dir for " + repo
		u.ErrorResponse(w, msg)
		return
	}

	url := "https://github.com/" + repo
	dest := "./" + folder
	cloneRepo := []string{"git", "clone", url, dest}
	err = u.GenericCommand(cloneRepo)
	if err != nil {
		log.Printf("ERROR Cant clone repo %s -> %s\n", err, r.URL.RequestURI())
		msg := "Can't clone repo " + repo
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	repoPath := "./" + folder
	info, err := l.countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		msg := "Error counting LOC in " + repo
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folderNum + ".txt"
	u.WriteFile(resultPath, string(info))
	l.readFileLineByLine(resultPath)
	//fmt.Println(languages)
	u.SendJSONToClient(w, l.languages, 200)
	u.GenericCommand(destroyTemporalDir)
}

func (l *loc) doLocUploadRequest(w http.ResponseWriter, r *http.Request) {
	folder := l.order
	folderNum := folder
	folder = "_tmp/loc/" + folder
	destroyTemporalDir := []string{"rm", "-r", folder}
	createTemporalDir := []string{"mkdir", folder}
	err := u.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR 1 creating folder %s\n", err)
		msg := "Error creating folder " + folder
		u.ErrorResponse(w, msg)
		return
	}

	// create file
	file, handler, err := r.FormFile("inputFile")
	if err != nil {
		log.Printf("ERROR creating file %s\n", err)
		msg := "Error creating file "
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	upload := handler.Filename
	filePath := "./" + folder + "/" + upload
	defer file.Close()
	f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Printf("ERROR opening uploaded file %s\n", err)
		msg := "Error opening " + upload
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	dest := "./" + folder
	//unzipFile := []string{"unzip", filePath, "-d", dest + "/src"}
	unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
	err = u.GenericCommand(unzipFile)
	if err != nil {
		log.Printf("ERROR 7z %s -> %s\n", err, r.URL.RequestURI())
		msg := "Error unziping " + upload
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}

	repoPath := dest + "/src"
	info, err := l.countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		msg := "Error counting LOC in " + upload
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folderNum + ".txt"
	u.WriteFile(resultPath, string(info))
	l.readFileLineByLine(resultPath)
	//fmt.Println(languages)
	u.SendJSONToClient(w, l.languages, 200)
	u.GenericCommand(destroyTemporalDir)
}

func (l *loc) readFileLineByLine(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("ERROR opening file line by line %s\n", err)
		return
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	number := 1
	for scanner.Scan() {
		line := scanner.Text() // string
		if number > 3 && string(line[0]) != "-" {
			l.processLine(line)
		}
		number++
	}
	if err := scanner.Err(); err != nil {
		log.Printf("ERROR scan file %s\n", err)
	}
}

func (l *loc) processLine(line string) {
	parts := strings.Split(strings.Join(strings.Fields(line), " "), " ")
	var lang language
	var index = 0
	if len(parts) > 6 { // two word language name
		lang.Name = parts[0] + " " + parts[1]
		index++
	} else {
		lang.Name = parts[0]
	}
	lang.Files = stringToInt(parts[index+1])
	lang.Lines = stringToInt(parts[index+2])
	lang.Blanks = stringToInt(parts[index+3])
	lang.Comments = stringToInt(parts[index+4])
	lang.Code = stringToInt(parts[index+5])
	l.languages = append(l.languages, lang)
}

func (l *loc) existRepo(repo string) bool {
	url := "https://github.com/" + repo
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("ERROR exists repo %s\n", err)
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode == 200 {
		return true
	}
	return false
}

func (l *loc) exceedsSize(w http.ResponseWriter) bool {
	url := "https://api.github.com/repos/" + l.repo
	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Accept", "application/vnd.github.v3.star+json")
	req.Header.Add("User-Agent", "github stars repos")
	rndToken := u.GetRandomInt(0, 9)
	req.Header.Add("Authorization", "token "+u.GITHUB_TOKEN[rndToken])
	var netClient = &http.Client{
		Timeout: time.Second * 3,
	}
	resp, err := netClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		msg := fmt.Sprintf("Error getting repo size %s\n", err)
		u.ErrorResponse(w, msg)
		return true
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR lOC 7 %s\n", err)
		return true
	}
	var aux struct {
		Size int `json:"size"`
	}
	err = json.Unmarshal(body, &aux)
	if err != nil {
		log.Printf("ERROR LOC 8 %s\n", err)
		return true
	}
	l.size = aux.Size / 1000
	if l.size > MAX_SIZE {
		return true
	}
	return false
}

func (l *loc) countLines(repoPath string) (info []byte, err error) {
	l.languages = make([]language, 0)
	info, err = exec.Command(LOC_LINUX, repoPath).CombinedOutput()
	if err != nil {
		log.Println(fmt.Sprintf("ERROR in countLines %s\n", err))
		return nil, err
	}
	return info, err
}

func stringToInt(s string) int {
	num, err := strconv.Atoi(s)
	if err != nil {
		log.Printf("ERROR string to Int %s\n", err)
		return 0
	}
	return num
}

func NewLoc(test bool) loc {
	l := loc{
		order:     "0",
		orderInt:  0,
		repo:      "",
		size:      0,
		languages: []language{},
	}
	return l
}
