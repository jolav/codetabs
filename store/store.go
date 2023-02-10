/* */

package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type configDB struct {
	DatabaseType string `json:"databaseType"`
	Host         string `json:"host"`
	Port         int    `json:"port"`
	DB           string `json:"db"`
	User         string `json:"user"`
	Password     string `json:"password"`
}

var MyDB *DB

// DB ...
type DB struct {
	*sql.DB
}

// NewDB ...
func NewDB() (*DB, error) {
	var c configDB
	err := json.Unmarshal(getDBConfigJSON(), &c)
	if err != nil {
		log.Fatal("Error parsing JSON config => \n", err)
	}
	var connPath string
	if c.DatabaseType == "mysql" {
		connPath = fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true",
			c.User,
			c.Password,
			c.Host,
			c.Port,
			c.DB,
		)
	}
	if c.DatabaseType == "sqlite3" {
		connPath = c.DB
	}
	//fmt.Println("CONNPATH => ", connPath)
	db, err := sql.Open(c.DatabaseType, connPath)
	if err != nil {
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	createLocTable(&DB{db})
	createStarsTable(&DB{db})

	return &DB{db}, nil
}

func createLocTable(MyDB *DB) {
	sql := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS %s (
		"repo" varchar(100) UNIQUE PRIMARY KEY,
		"source" varchar(20) NOT NULL,
		"date" text NOT NULL, 
		"data" json NOT NULL
		) 
		`,
		locTable,
	)
	stmt, err := MyDB.Prepare(sql)
	if err != nil {
		log.Printf("Error DB 1 Create Table %s => %s\n", locTable, err)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	if err != nil {
		log.Printf("Error DB 2 Create Table %s => %s\n", locTable, err)
		return
	}
}

func createStarsTable(MyDB *DB) {
	sql := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS %s (
		"repo" varchar(100) UNIQUE PRIMARY KEY,
		"source" varchar(20) NOT NULL,
		"date" text NOT NULL, 
		"total" INTEGER DEFAULT '0' NOT NULL, 
		"data" json NOT NULL
		)
		`,
		starsTable,
	)
	stmt, err := MyDB.Prepare(sql)
	if err != nil {
		log.Printf("Error DB 1 Create Table %s => %s\n", starsTable, err)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	if err != nil {
		log.Printf("Error DB 2 Create Table %s => %s\n", starsTable, err)
		return
	}
}
