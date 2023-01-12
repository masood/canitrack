//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class indexedDB {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return new Promise((resolve, reject) => {
            // //prefixes of implementation that we want to test
            // window.indexedDB = window.indexedDB || window.mozIndexedDB || 
            // window.webkitIndexedDB || window.msIndexedDB;
            
            // //prefixes of window.IDB objects
            // window.IDBTransaction = window.IDBTransaction || 
            // window.webkitIDBTransaction || window.msIDBTransaction;
            // window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
            // window.msIDBKeyRange

            let request = window.indexedDB.open("supercookieDB", 1);

            request.onsuccess = function(event) {
                let db = request.result;
                
                console.log("indexedDB found/created: "+ db);
             };

            request.onupgradeneeded = async function(event) {
                let db = event.target.result;
                let objectStore = db.createObjectStore("supercookieObjectStore", {keyPath: "secret"});
                objectStore.add({"secret": secret});
                console.log("Added Object Store");
             }
            
            request.onerror = function(event) {
            // If an error occurs with the request, log what it is
                console.log(`There has been an error with retrieving your data: ${event}`);
            };
              
            
            resolve();
            
        });
    }


    async read () {


        return new Promise((resolve, reject) => {

            let request = window.indexedDB.open("supercookieDB", 1);
            request.onsuccess = function(event) {
                let db = request.result;
                console.log("indexedDB found/created: "+ db);

                try{
                    let transaction = db.transaction(["supercookieObjectStore"]);
                    let objectStore = transaction.objectStore("supercookieObjectStore");
                    //let secretIndex = objectStore.index("secret");
                    
                    objectStore.openCursor().onsuccess = function(event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            console.log(cursor.value.secret);
                            resolve(cursor.value.secret);
                        }
                    }
                    // return 'Error reading indexedDB';
                } catch(error) {
                    resolve(null);
                }

            };

            request.onerror = function(event) {
                // If an error occurs with the request, log what it is
                console.log(`There has been an error with retrieving your data: ${event}`);
            };
        });

    }     

}

let client = indexedDB;
