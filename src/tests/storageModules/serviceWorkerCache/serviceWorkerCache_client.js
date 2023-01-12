//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cache Storage Read and Write.
 */
class ServiceWorker {
    
    sleepMs = (timeMs) => new Promise(
    (resolve, reject) => setTimeout(resolve, timeMs)
    );

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return new Promise(async (resolve, reject) => {
            if (!navigator.serviceWorker) {
                throw new Error("Unsupported");
            }
            let registration = await navigator.serviceWorker.register(
            '/storage/server/serviceWorkerCache/resources/serviceWorker.js', { scope: '/'});
            console.log(registration);
            // await navigator.serviceWorker.ready;
            console.log("service worker ready");
            await this.sleepMs(100);
            resolve();
        });
    }


    async read () {
        return new Promise(async (resolve, reject) => {
            let response = await fetch("/storage/server/serviceWorkerCache/resources/sw-secret");
            resolve(await response.text());
        });
    }   

}

var client = ServiceWorker;
