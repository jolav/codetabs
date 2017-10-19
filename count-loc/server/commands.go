package main

import (
	"fmt"
	"os/exec"
)

func genericCommand(args []string) (err error) {
	_, err = exec.Command(args[0], args[1:len(args)]...).CombinedOutput()
	if err != nil {
		fmt.Println("ERROR CMD= ", err)
		e.Error = err.Error()
		return err
	}
	return err
}

func countLines(repoPath string) (info []byte, err error) {
	languages = make([]language, 0)
	var e = myError{}
	info, err = exec.Command(loc, repoPath).CombinedOutput()
	if err != nil {
		fmt.Println("ERROR CMD= ", err)
		e.Error = err.Error()
		return nil, err
	}
	return info, err
}
