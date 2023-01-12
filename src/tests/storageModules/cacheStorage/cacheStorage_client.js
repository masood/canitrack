//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cache Storage Read and Write.
 */
class CacheStorage {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return new Promise(async (resolve, reject) => {
            let cache = await caches.open("supercookies");
            await cache.addAll([`https://${sites[4]}/storage/server/cacheStorage/resources?secret=${secret}`]);
            resolve();
        });
    }


    async read () {
        let cache = await caches.open("supercookies");
        let cacheKeys = await cache.keys();
        console.log(cacheKeys);
        let url;
        try {
            url = cacheKeys[0].url;
        } catch(error) {
            return null;
        }
        return (new URL(url)).searchParams.get("secret")
    }  

}

var client = CacheStorage;
