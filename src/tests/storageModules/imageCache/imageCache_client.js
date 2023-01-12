//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement the image Cache Read and Write.
 */
 class imageCache {


    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if(secret[i] == '1') {
                await new Promise(async (resolve, reject) => {

                    // Create image element
                    let image = document.createElement("img");

                    image.addEventListener('load', async (event) => {
                        await new Promise(resolve => setTimeout(resolve, 400));
                        resolve();
                    }, {once: true});

                    image.src = `https://${domainList[i]}/storage/server/imageCache/resources/image`;

                    document.body.appendChild(image);

                });
            }
        }
    }


    async read (domainList, clear = false) {
        let secret = "";
        await fetch(`/storage/server/imageCache/resources/clear`);
        for (let i = 0; i < domainList.length; i++) {
            await new Promise(async (resolve, reject) => {
                    // Create image element
                    let image = document.createElement("img");
        
                    image.addEventListener('load', async (event) => {
                        await new Promise(resolve => setTimeout(resolve, 400));
                        resolve();
                    }, {once: true});
        
                    image.src = `https://${domainList[i]}/storage/server/imageCache/resources/image`;

                    document.body.appendChild(image);
            });
            let response = await fetch(`https://${domainList[i]}/storage/server/imageCache/resources/numAccess`);
            secret += (await response.text()).trim();
        }

        return secret; 
    }

}

var client = imageCache;
