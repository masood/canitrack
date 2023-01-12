//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class Cookie {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return new Promise((resolve, reject) => {
            let cookieDomain = window.location.host.split('.').slice(-2).join('.');
            console.log(`Cookie Domain: ${cookieDomain}`);
            document.cookie = `secret=${secret}; Domain=${cookieDomain}; SameSite=None; Secure`;
            resolve();
        });
    }


    async read () {
        return document.cookie ? document.cookie.match(/secret=(\S+)/)[1] : null;
    }


}

let client = Cookie;
