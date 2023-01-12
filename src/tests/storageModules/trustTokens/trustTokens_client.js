//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cache Storage Read and Write.
 */
 class trustTokens {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if(secret[i] == '1') {
                await new Promise((resolve, reject) => {
                    fetch(`https://${domainList[i]}/storage/server/trustTokens/issuance`, {
                        method: "POST",
                        trustToken: {
                        type: "token-request",
                        }
                    }).then(async function(response) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        resolve();
                    }).catch(async function(error) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        resolve();
                    });
                });
            }
        }
    }


    async read (domainList) {
        let secret = '';
        for (let i = 0; i < domainList.length; i++) {
            let ifExists = await document.hasTrustToken(`https://${domainList[i]}`);
            if (ifExists) {
                secret += '1';
            } else {
                secret += '0';
            }
        }
        return secret;
    }  

}

var client = trustTokens;
