package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	lib "./_lib"
)

/*

// complete OK
ffmpeg -i cat1.mp4 -filter_complex 'fps=10,scale=320:-1:flags=lanczos,split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse' out.gif

// complete ok
-r 10 frames/second
-ss 15 second in which the animation was started or min:seg
-ss 00:01:02.500 -t 00:01:03.250
-t 20 duration of the animation
you can use two different time unit formats: sexagesimal (HOURS:MM:SS.MILLISECONDS, as in 01:23:45.678), or in seconds
-vf scale=160:90 scale
ffmpeg -i video.mp4 -r 10 -ss 15 -t 20 -vf scale=160:90 out.gif -hide_banner

*/

func doVideo2GifRequest(w http.ResponseWriter, r *http.Request, folder string) {

	counter := folder
	tempPath := fmt.Sprintf("./temp/%s/", counter)
	fmt.Println(`DO SOMETHING... with `, tempPath)

	destroyTemporalDir := []string{"rm", "-r", tempPath}
	createTemporalDir := []string{"mkdir", tempPath}
	err := lib.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR 1 %s", err)
		e.Error = "Error creating folder " + tempPath
		lib.SendErrorToClient(w, e)
		return
	}

	// create file
	file, handler, err := r.FormFile("inputFile")
	if err != nil {
		log.Printf("ERROR creating file %s", err)
		e.Error = "Error creating file "
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	inputFile := handler.Filename
	inputPath := fmt.Sprintf("%s%s", tempPath, inputFile)

	defer file.Close()
	f, err := os.OpenFile(inputPath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Printf("ERROR opening uploaded file %s", err)
		e.Error = "Error opening " + inputFile
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	outputPath := fmt.Sprintf("%s%s.gif", tempPath, counter)

	// convert
	p := getParameters(r)
	comm := createCommand(p, inputPath, outputPath)
	//fmt.Println(`Convert Command ->`, comm)
	_, err = lib.GenericCommandSH(comm)
	if err != nil {
		log.Printf("ERROR converting file %s", err)
		e.Error = "Error converting file " + inputFile
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}

	// open gif to grab data
	gifFileData, err := os.Open(outputPath)
	if err != nil {
		log.Printf("ERROR opening gif %s", err)
		e.Error = "Error opening file " + outputPath
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	reader := bufio.NewReader(gifFileData)
	content, err := ioutil.ReadAll(reader)
	if err != nil {
		log.Printf("ERROR reading gif %s", err)
		e.Error = "Error reading file " + outputPath
		lib.SendErrorToClient(w, e)
		lib.GenericCommand(destroyTemporalDir)
		return
	}
	encodedString := base64.StdEncoding.EncodeToString(content)

	// send gif data
	now := time.Now()
	data := bytes.NewReader([]byte(encodedString))
	http.ServeContent(w, r, outputPath, now, data)

	lib.GenericCommand(destroyTemporalDir)
	fmt.Println(`End`)
}

func createCommand(p parameters2, inputPath, outputPath string) string {
	comm := ""
	// ffmpeg -i video.mp4 -r 10 -ss 15 -t 20 -vf scale=160:90 out.gif -hide_banner
	comm += fmt.Sprintf("ffmpeg -i %s", inputPath)
	if p.fps != -1 {
		comm += fmt.Sprintf(" -r %d", p.fps)
	}
	if p.start != -1 {
		comm += fmt.Sprintf(" -ss %d", p.start)
	}
	if p.dur != -1 {
		comm += fmt.Sprintf(" -t %d", p.dur)
	}
	if p.scale != "" {
		comm += fmt.Sprintf(" -vf scale=%s", p.scale)
	}
	comm += fmt.Sprintf(" %s -hide_banner", outputPath)
	return comm
}

func getParameters(r *http.Request) parameters2 {
	in := parameters{}
	out := parameters2{}
	r.ParseForm()
	in.fps = r.Form.Get("fps")
	in.start = r.Form.Get("start")
	in.dur = r.Form.Get("duration")
	in.scale = r.Form.Get("scale")
	if in.fps == "" {
		out.fps = 5
	} else {
		out.fps, _ = strconv.Atoi(in.fps)
	}
	if in.start == "" {
		out.start = -1
	} else {
		out.start, _ = strconv.Atoi(in.start)
	}
	if in.dur == "" {
		out.dur = -1
	} else {
		out.dur, _ = strconv.Atoi(in.dur)
	}
	if in.scale == "" {
		out.scale = "320:160"
	} else {
		out.scale = in.scale
	}
	return out
}
