//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cookie Read and Write.
 */
class httpAuth {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if (secret[i] == '1') {
                await new Promise((resolve, reject) => {
                    let myHeaders = new Headers({
                        "Authorization": 'Basic ' + btoa('yourlogin:yourpassword'),
                        "mode": "cors",
                        "credentials": "include"
                    });
        
                    fetch(`https://${domainList[i]}/storage/server/httpAuth/`, {
                        method: 'GET',
                        headers: myHeaders
                        }).then(async function (response) {
                            console.log(response.status);
                            await new Promise(resolve => setTimeout(resolve, 100));
                            resolve();
                    });
                });
            }
        }
        console.log("Looped through domain list");
        return;
    }


    async read (domainList) {
        console.log("In read");
        let secret = "";
        for (let i = 1; i < domainList.length; i++) {
            console.log(`In read For Loop: ${domainList[i]}`);
            await new Promise((resolve, reject) => {
                fetch(`https://${domainList[i]}/storage/server/httpAuth/`, {
                    method: 'GET'
                    }).then(async function (response) {
                        if (response.status == 200) {
                            secret += '1';
                        } else {
                            secret += '0';
                        }
                        await new Promise(resolve => setTimeout(resolve, 100));
                        resolve();
                }).catch(async function (error) {
                    secret += '0';
                    await new Promise(resolve => setTimeout(resolve, 100));
                    resolve();
                })
            });
        }
        return secret;
    }


}

let client = httpAuth;
