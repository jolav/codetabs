package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	lib "./_lib"
)

var languages []language

func doLocUploadRequest(w http.ResponseWriter, r *http.Request, folder string) {
	folderNum := folder
	folder = "temp/loc/" + folder
	destroyTemporalDir := []string{"rm", "-r", folder}
	createTemporalDir := []string{"mkdir", folder}
	err := lib.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR 1 creating folder %s\n", err)
		e.Error = "Error creating folder " + folder
		lib.SendErrorToClient(w, e)
		return
	}

	// create file
	file, handler, err := r.FormFile("inputFile")
	if err != nil {
		log.Printf("ERROR creating file %s\n", err)
		e.Error = "Error creating file "
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	upload := handler.Filename
	filePath := "./" + folder + "/" + upload
	defer file.Close()
	f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Printf("ERROR opening uploaded file %s\n", err)
		e.Error = "Error opening " + upload
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	dest := "./" + folder
	//unzipFile := []string{"unzip", filePath, "-d", dest + "/src"}
	unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
	err = lib.GenericCommand(unzipFile)
	if err != nil {
		log.Printf("ERROR 7z %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Error unziping " + upload
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	repoPath := dest + "/src"
	info, err := countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Error counting LOC in " + upload
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folderNum + ".txt"
	lib.WriteFile(resultPath, string(info))
	readFileLineByLine(resultPath)
	//fmt.Println(languages)
	lib.SendJSONToClient(w, languages)
	lib.GenericCommand(destroyTemporalDir)
}

func doLocRepoRequest(w http.ResponseWriter, r *http.Request, repo, folder string) {
	//repouser := strings.Split(repo, "/")[0]
	folderNum := folder
	folder = "temp/loc/" + folder
	//reponame := strings.Split(repo, "/")[1]

	if !existRepo(repo) {
		e.Error = repo + " doesn't exist"
		lib.SendErrorToClient(w, e)
		return
	}
	destroyTemporalDir := []string{"rm", "-r", folder}

	createTemporalDir := []string{"mkdir", folder}
	err := lib.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR cant create temporal dir %s\n", err)
		e.Error = "Cant create temporal dir for " + repo
		lib.SendErrorToClient(w, e)
		return
	}

	url := "https://github.com/" + repo
	dest := "./" + folder
	cloneRepo := []string{"git", "clone", url, dest}
	err = lib.GenericCommand(cloneRepo)
	if err != nil {
		log.Printf("ERROR Cant clone repo %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Can't clone repo " + repo
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	repoPath := "./" + folder
	info, err := countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Error counting LOC in " + repo
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folderNum + ".txt"
	lib.WriteFile(resultPath, string(info))
	readFileLineByLine(resultPath)
	//fmt.Println(languages)
	lib.SendJSONToClient(w, languages)
	lib.GenericCommand(destroyTemporalDir)
}

func doLocRepoRequest2(w http.ResponseWriter, r *http.Request, repo string, folder string) {
	//repouser := strings.Split(repo, "/")[0]
	folderNum := folder
	folder = "temp/loc/" + folder
	reponame := strings.Split(repo, "/")[1]

	if !existRepo(repo) {
		e.Error = repo + " doesn't exist"
		lib.SendErrorToClient(w, e)
		return
	}
	destroyTemporalDir := []string{"rm", "-r", folder}

	createTemporalDir := []string{"mkdir", folder}
	err := lib.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR cant create temporal dir %s\n", err)
		e.Error = "Cant create temporal dir for " + repo
		lib.SendErrorToClient(w, e)
		return
	}

	url := "https://github.com/" + repo + "/archive/master.zip"
	filePath := "./" + folder + "/" + reponame + ".zip"
	err = downloadFile(filePath, url)
	if err != nil {
		log.Printf("ERROR Cant download repo %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Can't download repo " + repo
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	dest := "./" + folder
	//unzipFile := []string{"unzip", filePath, "-d", dest + "/src"}
	unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
	err = lib.GenericCommand(unzipFile)
	if err != nil {
		// some repos like rethinkdb/rethinkdb uses -next instead of -master
		url = "https://github.com/" + repo + "/archive/next.zip"
		err = downloadFile(filePath, url)
		if err != nil {
			log.Printf("Cant download repo %s\n", err)
			e.Error = "Can't download repo " + repo
			lib.SendErrorToClient(w, e)
			lib.GenericCommand(destroyTemporalDir)
			return
		}
		unzipFile = []string{"7z", "x", filePath, "-o" + dest + "/src"}
		err = lib.GenericCommand(unzipFile)
		if err != nil {
			log.Printf("ERROR 7z %s -> %s\n", err, r.URL.RequestURI())
			e.Error = "Error unziping " + repo
			lib.SendErrorToClient(w, e)
			lib.GenericCommand(destroyTemporalDir)
			return
		}
	}

	repoPath := dest + "/src"
	info, err := countLines(repoPath)
	if err != nil {
		log.Printf("ERROR counting loc %s -> %s\n", err, r.URL.RequestURI())
		e.Error = "Error counting LOC in " + repo
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folderNum + ".txt"
	lib.WriteFile(resultPath, string(info))
	readFileLineByLine(resultPath)
	//fmt.Println(languages)
	lib.SendJSONToClient(w, languages)
	lib.GenericCommand(destroyTemporalDir)
}

func readFileLineByLine(filePath string) {
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
			processLine(line)
		}
		number++
	}
	if err := scanner.Err(); err != nil {
		log.Printf("ERROR scan file %s\n", err)
	}
}

func processLine(line string) {
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
	languages = append(languages, lang)
}

func stringToInt(s string) int {
	num, err := strconv.Atoi(s)
	if err != nil {
		log.Printf("ERROR string to Int %s\n", err)
		return 0
	}
	return num
}

func existRepo(repo string) bool {
	url := "https://github.com/" + repo
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("ERROR exists repo %s\n", err)
		return false
	}
	if resp.StatusCode == 200 {
		return true
	}
	return false
}

func downloadFile(filePath string, url string) (err error) {
	client := http.Client{
		Timeout: 30 * time.Second,
	}
	// Create the file
	out, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer out.Close()
	// Get the data
	resp, err := client.Get(url)
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

func countLines(repoPath string) (info []byte, err error) {
	languages = make([]language, 0)
	var e = myError{}
	info, err = exec.Command(c.Loc.LocLinux, repoPath).CombinedOutput()
	//info, err = exec.Command(c.Loc.LocMac, repoPath).CombinedOutput()
	if err != nil {
		log.Println(fmt.Sprintf("ERROR in countLines %s\n", err))
		e.Error = err.Error()
		return nil, err
	}
	return info, err
}
