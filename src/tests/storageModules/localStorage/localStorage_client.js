//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class LocalStorage {
    /**
     * Writes a new local storage entry with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return new Promise((resolve, reject) => {
            localStorage.setItem('secret', secret);
            resolve();
        });
    }


    async read () {
        return localStorage.getItem('secret');
    }

}

let client = LocalStorage;
