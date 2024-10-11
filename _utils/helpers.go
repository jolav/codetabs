/* */

package utils

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"

	"golang.org/x/exp/rand"
)

func Includes(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func IncludesInt(slice []int, num int) bool {
	for _, v := range slice {
		if v == num {
			return true
		}
	}
	return false
}

func RandomInt(min, max int) int {
	r := rand.New(rand.NewSource(uint64(time.Now().UnixNano())))
	return r.Intn(max-min+1) + min
}

func PrettyPrintStruct(s interface{}) {
	result, _ := json.MarshalIndent(s, "", "    ") //"\t")
	fmt.Print(string(result), "\n")
}

func CheckFlags(version, when string) {
	versionFlag := flag.Bool("v", false, "Show current version and exit")
	flag.Parse()
	switch {
	case *versionFlag:
		fmt.Printf("Version:\t: %s\n", version)
		fmt.Printf("Date   :\t: %s\n", when)
		os.Exit(0)
	}
}
