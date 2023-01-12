//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement the font Cache Read and Write.
 */
 class faviconCache {


    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret) {
        console.log(`Secret: ${secret}`);
        console.log(`Check: ${secret == '1'}`)
        if (secret == '1') {
            return new Promise(async (resolve, reject) => {

                // Assign a constant variable and get them by the favicon Id
                let favicon = document.createElement("link");
                
                favicon.setAttribute("rel", "icon");
    
                favicon.setAttribute("type", "image/x-icon");
    
                // favicon.setAttribute("href", `https://${sites[4]}/storage/server/faviconCache/resources/favicon`);
                favicon.setAttribute("href", `/storage/server/faviconCache/resources/favicon`);
                
                document.getElementsByTagName('head')[0].appendChild(favicon);
    
                await new Promise(resolve => setTimeout(resolve, 1000));
    
                resolve();
            });
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            return;
        }
    }


    async read () {
        await fetch(`/storage/server/faviconCache/resources/clear`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await new Promise(async (resolve, reject) => {

            // Assign a constant variable and get them by the favicon Id
            let favicon = document.createElement("link");
            
            favicon.setAttribute("rel", "icon");

            favicon.setAttribute("type", "image/x-icon");

            // favicon.setAttribute("href", `https://${sites[4]}/storage/server/faviconCache/resources/favicon`);
            favicon.setAttribute("href", `/storage/server/faviconCache/resources/favicon`);
            
            document.getElementsByTagName('head')[0].appendChild(favicon);

            await new Promise(resolve => setTimeout(resolve, 1000));

            resolve();
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        let response = await fetch(`/storage/server/faviconCache/resources/numAccess`);
        return (await response.text()).trim(); 
    }

}

var client = faviconCache;
