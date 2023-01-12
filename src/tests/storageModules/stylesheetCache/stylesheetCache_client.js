//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement the Stylesheet Cache Read and Write.
 */
 class stylesheetCache {


    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if(secret[i] == '1') {
                await new Promise(async (resolve, reject) => {
                    let newSS=document.createElement('link');
                    newSS.rel='stylesheet';
                    newSS.href=`https://${domainList[i]}/storage/server/stylesheetCache/resources/styleSheet`;
                    newSS.onload = async function () {
                        //once the express server sends the file and the browser has received it (and triggered the onload), the server takes a tad bit time to perform a few updates to the numAccesses JSON object. it needs just a little more time before it is ready to correctly serve future requests correctly.
                        await new Promise(resolve => setTimeout(resolve, 400));
                        resolve();
                    }
                    document.getElementsByTagName("head")[0].appendChild(newSS);
                });
            }
        }
        return;
    }


    async read (domainList, clear = false) {
        let secret = "";
        await fetch(`/storage/server/stylesheetCache/resources/clear`);
        for (let i = 0; i < domainList.length; i++) {
            await new Promise(async (resolve, reject) => {
                let newSS=document.createElement('link');
                newSS.rel='stylesheet';
                newSS.href=`https://${domainList[i]}/storage/server/stylesheetCache/resources/styleSheet`;
                newSS.onload = async function () {
                    //once the express server sends the file and the browser has received it (and triggered the onload), the server takes a tad bit time to perform a few updates to the numAccesses JSON object. it needs just a little more time before it is ready to correctly serve future requests correctly.
                    await new Promise(resolve => setTimeout(resolve, 400));
                    resolve();
                }
                document.getElementsByTagName("head")[0].appendChild(newSS);
            });
            let response = await fetch(`https://${domainList[i]}/storage/server/stylesheetCache/resources/numAccess`);
            secret += (await response.text()).trim();
        }
        

        // if (clear == true) {
        //     await fetch(`/storage/server/stylesheetCache/resources/clear`);
        // }

        return secret;
    }

}

var client = stylesheetCache;
