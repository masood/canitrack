//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class AltSvc {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if (secret[i] == '1') {
                await new Promise((resolve, reject) => {
                    fetch(`https://${domainList[i]}/storage/server/altsvc/theresource/`)
                    .then(async function(response) {
                        response.text().then(async function(text) {
                            console.log('Request successful', text);
                            await new Promise(resolve => setTimeout(resolve, 100));
                            resolve();
                        })
                    })
                    .catch(error => async function() {
                        console.error('There has been a problem with your fetch operation:', error);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        resolve();
                    });
                });
            }
        }
        return;
    }


    async read (domainList) {
        let altSvcID = "";
        await fetch(`/storage/server/altsvc/resources/clear`);
        await new Promise(resolve => setTimeout(resolve, 100));
        for (let i = 0; i < domainList.length; i++) {
            await new Promise((resolve, reject) => {
                fetch(`https://${domainList[i]}/storage/server/altsvc/theresource/`)
                .then(async function(response) {
                    response.text().then(async function(text) {
                        if (text == 'Response from Port 943' || text == 'Response from Port 941') {
                            altSvcID += '1';
                        } else {
                            altSvcID += '0';
                        }
                        console.log('Response Received: ', text);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        resolve();
                    })
                })
                .catch(error => async function() {
                    console.error('There has been a problem with your fetch operation:', error);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    resolve();
                });
            });
        }
        return altSvcID;
    }


}

let client = AltSvc;
