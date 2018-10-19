package main

var configjson = []byte(`
{
	"app": {
		"version":"0.4.0",
		"mode":"production",
		"port": 3704,
		"service":"alexa"
  }
}
`)

const dataFile = "./data/top-1m.csv"
const zipFile = "./data/top-1m.csv.zip"
const dataFileURL = "https://s3.amazonaws.com/alexa-static/top-1m.csv.zip"

var list map[string](int)

var o output

type output struct {
	Domain string `json:"domain"`
	Rank   int    `json:"rank"`
}

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
	Error string `json:"Error,omitempty"`
}
