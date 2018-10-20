package main

var configjson = []byte(`
{
	"app": {
		"version":"0.4.0",
		"mode":"production",
		"port": 3705,
		"service":"headers"
  }
}
`)

var hs []header

var h header

type header struct {
	Header map[string]string `json:"header"`
}

var count = 0 // avoid infinite redirection loop
var notMoreRedirections = false

var curlStatus = map[string]string{
	"exit status 6": "Couldn't resolve host",
	"exit status 7": "Failed to connect to host",
	//"exit status ": "",
}

const curl = "curl -fsSI "

var c configuration

type configuration struct {
	App struct {
		Mode    string `json:"mode"`
		Port    int    `json:"port"`
		Service string `json:"service"`
		Version string `json:"version"`
	} `json:"app"`
}

var e myError

type myError struct {
	Error string `json:"error,omitempty"`
}
