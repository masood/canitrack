//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class NEL {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        return;
    }


    async read (domainList) {
        console.log("In read");
        await fetch("/storage/server/nel/clear-access/");
        await fetch("/storage/server/nel/handle-fetch/");
        let secret = "";
        for (let i = 0; i < 30; i++) {
            let response = await fetch("/storage/server/nel/check-secret/");
            secret = (await response.text()).trim();
            if (secret == "Not Yet") {
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                break;
            }
        }
        return secret;
    }


}

let client = NEL;
