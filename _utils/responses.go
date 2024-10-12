/* */

package _utils

import (
	"encoding/json"
	"encoding/xml"
	"log"
	"net/http"
)

type requestError struct {
	Message    string `json:"Error"`
	StatusCode int    `json:"-"`
}

// BadRequest ...
func BadRequest(w http.ResponseWriter, r *http.Request) {
	validFormat := "Bad request, valid format is 'api.codetabs.com/v1/{service}?{param}=value' .Please read our docs at https://codetabs.com"
	re := &requestError{
		Message:    validFormat,
		StatusCode: 400,
	}
	SendJSONToClient(w, re, re.StatusCode)
}

// ErrorResponse ...
func ErrorResponse(w http.ResponseWriter, msg string) {
	re := &requestError{
		Message:    msg,
		StatusCode: 400,
	}
	SendJSONToClient(w, re, re.StatusCode)
}

// SendJSONToClient ...
func SendJSONToClient(w http.ResponseWriter, d interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	var dataJSON = []byte(`{}`)
	dataJSON, err := json.MarshalIndent(d, "", " ")
	if err != nil {
		log.Printf("ERROR Marshaling %s\n", err)
		w.Write([]byte(`{}`))
	}
	w.Write(dataJSON)
}

// SendXMLToClient ...
func SendXMLToClient(w http.ResponseWriter, d interface{}, status int) {
	w.Header().Set("Content-Type", "application/xml")
	w.WriteHeader(status)
	var dataXML = []byte(`<output></output>`)
	dataXML, err := xml.Marshal(&d)
	if err != nil {
		log.Printf("ERROR Parsing into XML %s\n", err)
		w.Write([]byte(`{}`))
	}
	w.Write(dataXML)
}
