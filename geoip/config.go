package main

var configjson = []byte(`
{
	"app": {
		"version":"0.1.0",
		"mode":"production",
		"port": 3750,
		"service":"geoip"
  }
}
`)

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
