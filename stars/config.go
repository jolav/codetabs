package main

var configjson = []byte(`
{
	"app": {
		"version":"0.5.0",
		"mode":"production",
		"port": 3702,
		"service":"stars"
  }
}
`)

var g configuration2

type configuration2 struct {
	GitHub struct {
		API   string   `json:"api"`
		Token []string `json:"token"`
	} `json:"gitHub"`
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
