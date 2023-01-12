//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cache Storage Read and Write.
 */
class FileSystemStorage {
    
    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    write (secret) {
        return new Promise(async (resolve, reject) => {
            window.webkitRequestFileSystem(Window.TEMPORARY, 1024, (fs) => {
                fs.root.getDirectory("tmp", {create:true}, (dir) => {
                    dir.getFile(secret, {create: true}, (file) => {
                        resolve();
                    })
                });
                
            });
        });
    }


    read () {
        return new Promise((resolve, reject) => {
            window.webkitRequestFileSystem(Window.TEMPORARY, 1024, (fs) => {
                fs.root.getDirectory("tmp", {create:true}, (dir) => {
                    dir.createReader().readEntries(function(results) {
                        if (results.length > 0) {
                            resolve(results[0].name);
                        } else {
                            resolve(null);
                        }
                    });
                    
                });
                
            });
        });
    }   

}

var client = FileSystemStorage;
