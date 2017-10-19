package main

import (
	"bufio"
	"fmt"
	"io"
	"lib"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

var languages []language

type language struct {
	Name     string `json:"language"`
	Files    int    `json:"files"`
	Lines    int    `json:"lines"`
	Blanks   int    `json:"blanks"`
	Comments int    `json:"comments"`
	Code     int    `json:"linesOfCode"`
}

func countUpload(w http.ResponseWriter, r *http.Request, folder string) {
	destroyTemporalDir := []string{"rm", "-r", folder}

	createTemporalDir := []string{"mkdir", folder}
	err := genericCommand(createTemporalDir)
	if err != nil {
		fmt.Println("ERROR = ", err)
		e.Error = "Cant create temporal dir for uploaded file" // + upload
		lib.SendErrorToClient(w, e)
		return
	}

	// create file
	file, handler, err := r.FormFile("inputFile")
	if err != nil {
		e.Error = fmt.Sprintf("%s ", err)
		lib.SendErrorToClient(w, e)
		genericCommand(destroyTemporalDir)
		return
	}
	upload := handler.Filename
	filePath := "./" + folder + "/" + upload
	defer file.Close()
	f, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println(err)
		genericCommand(destroyTemporalDir)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	dest := "./" + folder
	//unzipFile := []string{"unzip", filePath, "-d", dest + "/src"}
	unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
	err = genericCommand(unzipFile)
	if err != nil {
		fmt.Println("ERROR 7z= ", err)
		e.Error = "Error unziping " + upload
		lib.SendErrorToClient(w, e)
		genericCommand(destroyTemporalDir)
		return
	}

	repoPath := dest + "/src"
	info, err := countLines(repoPath)
	if err != nil {
		fmt.Println("ERROR = ", err)
		e.Error = "Error counting LOC in " + upload
		lib.SendErrorToClient(w, e)
		genericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folder + ".txt"
	lib.WriteFile(resultPath, string(info))
	readFileLineByLine(resultPath)
	//fmt.Println(languages)
	lib.SendJSONToClient(w, languages)
	genericCommand(destroyTemporalDir)
}

func countRepo(w http.ResponseWriter, r *http.Request, repo string, folder string) {
	//repouser := strings.Split(repo, "/")[0]
	reponame := strings.Split(repo, "/")[1]

	if !existRepo(repo) {
		e.Error = repo + " doesn't exist"
		lib.SendErrorToClient(w, e)
		return
	}
	destroyTemporalDir := []string{"rm", "-r", folder}

	createTemporalDir := []string{"mkdir", folder}
	err := genericCommand(createTemporalDir)
	if err != nil {
		fmt.Println("ERROR = ", err)
		e.Error = "Cant create temporal dir for " + repo
		lib.SendErrorToClient(w, e)
		return
	}

	url := "https://github.com/" + repo + "/archive/master.zip"
	filePath := "./" + folder + "/" + reponame + ".zip"
	err = downloadFile(filePath, url)
	if err != nil {
		fmt.Println(err)
		e.Error = "Can't download repo " + repo
		lib.SendErrorToClient(w, e)
		genericCommand(destroyTemporalDir)
		return
	}

	dest := "./" + folder
	//unzipFile := []string{"unzip", filePath, "-d", dest + "/src"}
	unzipFile := []string{"7z", "x", filePath, "-o" + dest + "/src"}
	err = genericCommand(unzipFile)
	if err != nil {
		// some repos like rethinkdb/rethinkdb uses -next instead of -master
		url = "https://github.com/" + repo + "/archive/next.zip"
		err = downloadFile(filePath, url)
		if err != nil {
			fmt.Println(err)
			e.Error = "Can't download repo " + repo
			lib.SendErrorToClient(w, e)
			genericCommand(destroyTemporalDir)
			return
		}
		unzipFile = []string{"7z", "x", filePath, "-o" + dest + "/src"}
		err = genericCommand(unzipFile)
		if err != nil {
			fmt.Println("ERROR 7z= ", err)
			e.Error = "Error unziping " + repo
			lib.SendErrorToClient(w, e)
			genericCommand(destroyTemporalDir)
			return
		}
	}

	repoPath := dest + "/src"
	info, err := countLines(repoPath)
	if err != nil {
		fmt.Println("ERROR = ", err)
		e.Error = "Error counting LOC in " + repo
		lib.SendErrorToClient(w, e)
		genericCommand(destroyTemporalDir)
		return
	}

	resultPath := "./" + folder + "/" + folder + ".txt"
	lib.WriteFile(resultPath, string(info))
	readFileLineByLine(resultPath)
	//fmt.Println(languages)
	lib.SendJSONToClient(w, languages)
	genericCommand(destroyTemporalDir)
}

func readFileLineByLine(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatal(err)
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
		log.Fatal(err)
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
		log.Fatal(err)
	}
	return num
}

func existRepo(repo string) bool {
	url := "https://github.com/" + repo
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
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
