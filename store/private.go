package store

const locTable = "loc"
const starsTable = "stars"

func getDBConfigJSON() []byte {
	return []byte(`{
        "databaseType": "sqlite3",
        "db": "/tmp/codetabs.db"
    }`)
}
