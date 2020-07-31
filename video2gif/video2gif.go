/* */

package video2gif

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
	"strings"
	"time"

	u "github.com/jolav/codetabs/_utils"
)

type video2gif struct {
	order    string
	orderInt int
	in       in
	out      out
}

type out struct {
	fps   int
	start int
	dur   int
	scale string
}

type in struct {
	fps   string
	start string
	dur   string
	scale string
}

func (vg *video2gif) Router(w http.ResponseWriter, r *http.Request) {
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
	if r.Method == "POST" {
		vg.orderInt++
		vg.order = strconv.Itoa(vg.orderInt)
		vg.doVideo2GifRequest(w, r, vg.order)
		return
	}
	u.BadRequest(w, r)
}

func NewVideo2Gif(test bool) video2gif {
	vg := video2gif{
		order:    "0",
		orderInt: 0,
		in:       in{},
		out:      out{},
	}
	return vg
}

func (vg *video2gif) doVideo2GifRequest(w http.ResponseWriter, r *http.Request, folder string) {

	counter := folder
	tempPath := fmt.Sprintf("./_tmp/videos/%s/", counter)
	//fmt.Println(`DO SOMETHING... with `, tempPath)

	destroyTemporalDir := []string{"rm", "-r", tempPath}
	createTemporalDir := []string{"mkdir", tempPath}
	err := u.GenericCommand(createTemporalDir)
	if err != nil {
		log.Printf("ERROR 1 creating folder %s\n", err)
		msg := "Error creating folder " + tempPath
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

	inputFile := handler.Filename
	inputPath := fmt.Sprintf("%s%s", tempPath, inputFile)

	defer file.Close()
	f, err := os.OpenFile(inputPath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		log.Printf("ERROR opening uploaded file %s\n", err)
		msg := "Error opening " + inputFile
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	outputPath := fmt.Sprintf("%s%s.gif", tempPath, counter)

	// convert
	vg.getParameters(r)
	comm := vg.createCommand(inputPath, outputPath)
	//fmt.Println(`Convert Command ->`, comm)
	_, err = u.GenericCommandSH(comm)
	if err != nil {
		log.Printf("ERROR converting file %s\n", err)
		msg := "Error converting file " + inputFile
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}

	// open gif to grab data
	gifFileData, err := os.Open(outputPath)
	if err != nil {
		log.Printf("ERROR opening gif %s\n", err)
		msg := "Error opening file " + outputPath
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	defer gifFileData.Close()
	reader := bufio.NewReader(gifFileData)
	content, err := ioutil.ReadAll(reader)
	if err != nil {
		log.Printf("ERROR reading gif %s\n", err)
		msg := "Error reading file " + outputPath
		u.ErrorResponse(w, msg)
		u.GenericCommand(destroyTemporalDir)
		return
	}
	encodedString := base64.StdEncoding.EncodeToString(content)

	// send gif data
	now := time.Now()
	data := bytes.NewReader([]byte(encodedString))
	http.ServeContent(w, r, outputPath, now, data)

	u.GenericCommand(destroyTemporalDir)
}

func (vg *video2gif) createCommand(inputPath, outputPath string) string {
	comm := ""
	// ffmpeg -i video.mp4 -r 10 -ss 15 -t 20 -vf scale=160:90 out.gif -hide_banner
	comm += fmt.Sprintf("ffmpeg -i %s", inputPath)
	if vg.out.fps != -1 {
		comm += fmt.Sprintf(" -r %d", vg.out.fps)
	}
	if vg.out.start != -1 {
		comm += fmt.Sprintf(" -ss %d", vg.out.start)
	}
	if vg.out.dur != -1 {
		comm += fmt.Sprintf(" -t %d", vg.out.dur)
	}
	if vg.out.scale != "" {
		comm += fmt.Sprintf(" -vf scale=%s", vg.out.scale)
	}
	comm += fmt.Sprintf(" %s -hide_banner", outputPath)
	return comm
}

func (vg *video2gif) getParameters(r *http.Request) {
	r.ParseForm()
	vg.in.fps = r.Form.Get("fps")
	vg.in.start = r.Form.Get("start")
	vg.in.dur = r.Form.Get("duration")
	vg.in.scale = r.Form.Get("scale")
	if vg.in.fps == "" {
		vg.out.fps = 5
	} else {
		fps, err := strconv.Atoi(vg.in.fps)
		if err != nil {
			vg.out.fps = 5
		} else {
			if fps < 1 || fps > 10 {
				vg.out.fps = 5
			} else {
				vg.out.fps, _ = strconv.Atoi(vg.in.fps)
			}
		}
	}
	if vg.in.start == "" {
		vg.out.start = -1
	} else {
		vg.out.start, _ = strconv.Atoi(vg.in.start)
	}
	if vg.in.dur == "" {
		vg.out.dur = -1
	} else {
		vg.out.dur, _ = strconv.Atoi(vg.in.dur)
	}
	if vg.in.scale == "" {
		vg.out.scale = "320:160"
	} else {
		vg.out.scale = getScale(vg.in.scale)
	}
}

func getScale(old string) string {
	values := strings.Split(old, ":")
	if len(values) != 2 {
		return "320:160"
	}

	a, err1 := strconv.Atoi(values[0])
	b, err2 := strconv.Atoi(values[1])
	if err1 != nil || err2 != nil {
		return "320:160"
	}
	if a >= b && a > 480 {
		if b == -1 {
			return fmt.Sprintf("480:-1")
		}
		a, b = rescale(a, b)
	}
	if b > a && b > 480 {
		if a == -1 {
			return fmt.Sprintf("-1:480")
		}
		b, a = rescale(b, a)
	}
	return fmt.Sprintf("%d:%d", a, b)
}

func rescale(big, small int) (big2, small2 int) {
	big2 = 480
	small2 = 480 * small / big
	return big2, small2
}

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
