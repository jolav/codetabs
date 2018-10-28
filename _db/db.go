package stats

import (
	"database/sql"
	"fmt"
	"log"

	lib "../_lib"

	// mysql driver
	_ "github.com/go-sql-driver/mysql"
)

type configuration struct {
	Mysql struct {
		Host     string `json:"host"`
		Port     int    `json:"port"`
		Db       string `json:"db"`
		Table    string `json:"table"`
		User     string `json:"user"`
		Password string `json:"password"`
	} `json:"mysql"`
}

type myDB struct{}

var db *sql.DB
var c configuration

// MYDB ...
var MYDB myDB

func (MYDB *myDB) InitDB() {
	lib.LoadConfig(mysqljson, &c)
	connPath := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", c.Mysql.User, c.Mysql.Password, c.Mysql.Host, c.Mysql.Port, c.Mysql.Db)
	//fmt.Println(connPath)
	var err error
	db, err = sql.Open("mysql", connPath)
	if err != nil {
		log.Printf("ERROR 1 DB %s\n", err)
	} else {
		log.Printf("INFO DB %s sql.Open() => OK\n", c.Mysql.Db)
	}
}

func (MYDB *myDB) InsertHit(service string, datenow string) {
	sql := fmt.Sprintf("INSERT INTO `%s` (time, alexa, loc, stars, proxy, headers, weather, geoip) VALUES ('%s', 0, 0, 0, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE %s = %s + 1;", c.Mysql.Table, datenow, service, service)
	stmt, err := db.Prepare(sql)
	if err != nil {
		log.Printf("ERROR 2 DB %s\n", err)
		return
	}
	defer stmt.Close()
	_, err = stmt.Exec()
	if err != nil {
		log.Printf("ERROR 3 DB %s\n", err)
	}
}
