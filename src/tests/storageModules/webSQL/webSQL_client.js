//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class webSQL {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        if (!window.openDatabase) {
            throw new Error("Unsupported");
        }
        let database = window.openDatabase("sqlite_supercookie", "", "supercookie", 1024 * 1024);
        let tx = new Promise((resolve) => database.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS cache(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                value TEXT NOT NULL,
                UNIQUE (name)
            )`,
            [], (tx, rs) => {}, (tx, err) => {});
        tx.executeSql(
            `INSERT OR REPLACE INTO cache(name, value)
            VALUES(?, ?)`,
            ["secret", secret], (tx, rs) => {}, (tx, rs) => {});
        }));
    }


    async read () {

        try {
            let database = window.openDatabase("sqlite_supercookie", "", "supercookie", 1024 * 1024);
            let result = await new Promise((resolve, reject) => database.transaction(tx => {
            tx.executeSql(
                "SELECT value FROM cache WHERE name=?",
                ["secret"],
                (tx, rs) => resolve(rs),
                (tx, err) => reject(err));
            }));
            return result.rows.item(0).value;
        } catch (error) {
            return null;
        }

    }     

}

let client = webSQL;
