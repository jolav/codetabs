/* */

package loc

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	u "github.com/jolav/codetabs/_utils"
)

const (
	SCC      = "./_data/loc/scc"
	MAX_SIZE = 500
)

type loc struct {
	order        string
	orderInt     int
	repo         string
	branch       string
	source       string
	ignored      []string
	date         string
	size         int
	sr           sourceReader
	languagesIN  []languageIN
	languagesOUT []languageOUT
}

type languageIN struct {
	Name     string `json:"Name"`
	Files    int    `json:"count"`
	Lines    int    `json:"lines"`
	Blanks   int    `json:"blank"`
	Comments int    `json:"comment"`
	Code     int    `json:"code"`
}

type languageOUT struct {
	Name     string `json:"language"`
	Files    int    `json:"files"`
	Lines    int    `json:"lines"`
	Blanks   int    `json:"blanks"`
	Comments int    `json:"comments"`
	Code     int    `json:"linesOfCode"`
}

type sourceReader interface {
	existRepo(string) bool
	exceedsSize(http.ResponseWriter, *loc) bool
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
	// clean
	l = &loc{
		repo:         "",
		branch:       "",
		ignored:      []string{},
		source:       "",
		date:         "",
		size:         0,
		languagesIN:  []languageIN{},
		languagesOUT: []languageOUT{},
	}

	if r.Method == "POST" {
		l.orderInt++
		l.order = strconv.Itoa(l.orderInt)
		l.doLocUploadRequest(w, r)
		return
	}
	r.ParseForm()
	l.branch = r.Form.Get("branch")
	if r.Form.Get("ignored") != "" {
		l.ignored = strings.Split(r.Form.Get("ignored"), ",")
	}
	for k, v := range r.URL.Query() {
		if k == "github" || k == "gitlab" {
			l.repo = v[0] //r.URL.Query()[k][0]
			l.source = k
		}
	}
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

	switch l.source {
	case "github":
		l.sr = github{}
	case "gitlab":
		l.sr = gitlab{}
	}
	l.orderInt++
	l.order = strconv.Itoa(l.orderInt)
	l.doLocRepoRequest(w, r)
}

func (l *loc) doLocRepoRequest(w http.ResponseWriter, r *http.Request) {

	// MOCK
	/*
		_ = json.Unmarshal([]byte(data), &l.languagesIN)
		total2 := languageOUT{
			Name: "Total",
		}
		for _, v := range l.languagesIN {
			l.languagesOUT = append(l.languagesOUT, languageOUT(v))
			total2.Blanks += v.Blanks
			total2.Code += v.Code
			total2.Comments += v.Comments
			total2.Files += v.Files
			total2.Lines += v.Lines
		}
		l.languagesOUT = append(l.languagesOUT, total2)
		u.SendJSONToClient(w, l.languagesOUT, 200)
		return
	*/
	//

	if !l.sr.existRepo(l.repo) {
		msg := l.repo + " doesn't exist"
		u.ErrorResponse(w, msg)
		return
	}
	if l.sr.exceedsSize(w, l) {
		msg := fmt.Sprintf(`repo %s too big (>%dMB) = %d MB`,
			l.repo,
			MAX_SIZE,
			l.size,
		)
		u.ErrorResponse(w, msg)
		return
	}

	folder := "_tmp/loc/" + l.order
	destroyTemporalDir := []string{"rm", "-rf", folder}
	createTemporalDir := []string{"mkdir", folder}

	err := u.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR cant create temporal dir %s\n", err)
		msg := "Cant create temporal dir for " + l.repo
		u.ErrorResponse(w, msg)
		return
	}

	url := "https://" + l.source + ".com/" + l.repo
	dest := "./" + folder
	if l.branch == "" {
		cloneRepo := []string{"git", "clone", "--depth=1", url, dest}
		err = u.GenericCommand(cloneRepo)
		if err != nil {
			log.Printf("ERROR Cant clone repo %s -> %s\n", err, r.URL.RequestURI())
			msg := "Can't clone repo " + l.repo
			u.ErrorResponse(w, msg)
			u.GenericCommand(destroyTemporalDir)
			return
		}
	} else {
		cloneRepo :=
			[]string{"git", "clone", "--depth=1", "-b",
				l.branch, "--single-branch", url, dest}
		err = u.GenericCommand(cloneRepo)
		if err != nil {
			log.Printf("ERROR Cant clone repo branch %s ,%s -> %s\n", l.branch, err, r.URL.RequestURI())
			msg := "Can't clone repo " + l.repo + " branch=" + l.branch
			u.ErrorResponse(w, msg)
			u.GenericCommand(destroyTemporalDir)
			return
		}
	}
	repoPath := "./" + folder
	info, err := l.countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		msg := "Error counting LOC in " + l.repo
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}

	err = json.Unmarshal(info, &l.languagesIN)
	if err != nil {
		log.Printf("ERROR unmarshal LOC %s\n", err)
	}

	total := languageOUT{
		Name: "Total",
	}
	for _, v := range l.languagesIN {
		l.languagesOUT = append(l.languagesOUT, languageOUT(v))
		total.Blanks += v.Blanks
		total.Code += v.Code
		total.Comments += v.Comments
		total.Files += v.Files
		total.Lines += v.Lines
	}
	l.languagesOUT = append(l.languagesOUT, total)

	u.SendJSONToClient(w, l.languagesOUT, 200)
	u.GenericCommand(destroyTemporalDir)
}

func (l *loc) countLines(repoPath string) (info []byte, err error) {
	comm := SCC + " "
	if len(l.ignored) < 1 {
		comm += repoPath + " -f json "
	} else {
		var ignored string
		for _, v := range l.ignored {
			ignored += " -M " + v + " "
		}
		comm += ignored + repoPath + " -f json "
	}
	//fmt.Println("COMMAND => ", comm)
	info, err = u.GenericCommandSH(comm)
	if err != nil {
		log.Println(fmt.Sprintf("ERROR in countLines %s\n", err))
		return nil, err
	}
	return info, err
}

func (l *loc) doLocUploadRequest(w http.ResponseWriter, r *http.Request) {
	folder := "_tmp/loc/" + l.order
	destroyTemporalDir := []string{"rm", "-rf", folder}
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

	err = json.Unmarshal(info, &l.languagesIN)
	if err != nil {
		log.Printf("ERROR unmarshal LOC %s\n", err)
	}

	total := languageOUT{
		Name: "Total",
	}
	for _, v := range l.languagesIN {
		l.languagesOUT = append(l.languagesOUT, languageOUT(v))
		total.Blanks += v.Blanks
		total.Code += v.Code
		total.Comments += v.Comments
		total.Files += v.Files
		total.Lines += v.Lines
	}
	l.languagesOUT = append(l.languagesOUT, total)

	u.SendJSONToClient(w, l.languagesOUT, 200)
	u.GenericCommand(destroyTemporalDir)
}

func NewLoc(test bool) loc {
	l := loc{
		order:        "0",
		orderInt:     0,
		repo:         "",
		branch:       "",
		ignored:      []string{},
		source:       "",
		date:         "",
		size:         0,
		languagesIN:  []languageIN{},
		languagesOUT: []languageOUT{},
	}
	return l
}
