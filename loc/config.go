package main

var configjson = []byte(`
{
	"app": {
		"version":"0.6.0",
		"mode":"production",
		"port": 3701,
		"service":"loc"
  }
}
`)

var order = "1"
var orderInt = 1
var loc = "./locLinux"

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
