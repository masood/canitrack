//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement the font Cache Read and Write.
 */
 class fontCache {

    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i = 0; i < domainList.length; i++) {
            if(secret[i] == '1') {
                await new Promise(async (resolve, reject) => {
                    // Create CSS
                    let newSS=document.createElement('style');
                    let fontLink =`https://${domainList[i]}/storage/server/fontCache/resources/font`;
                    newSS.innerHTML = `@font-face { font-family: "myCustomFont${i}"; src: url("${fontLink}") format("truetype"); } p.customfontWrite${i} { font-family: "myCustomFont${i}", Verdana, Tahoma; }`;
                    document.getElementsByTagName("head")[0].appendChild(newSS);

                    // Create paragraph element
                    const para = document.createElement("p");
                    const node = document.createTextNode("This is a paragraph.");
                    para.appendChild(node);
                    para.classList.add(`customfontWrite${i}`);
                    document.body.appendChild(para);

                    await new Promise(resolve => setTimeout(resolve, 400));

                    resolve();

                });
            }
        }
    }


    async read (domainList, clear = false) {
        let secret = "";
        await fetch(`/storage/server/fontCache/resources/clear`);

        for (let i = 0; i < domainList.length; i++) {
            await new Promise(async (resolve, reject) => {
                // Create SS
                let newSS=document.createElement('style');
                let fontLink =`https://${domainList[i]}/storage/server/fontCache/resources/font`;
                newSS.innerHTML = `@font-face { font-family: "myCustomFont${i}"; src: url("${fontLink}") format("truetype"); } p.customfontRead${i} { font-family: "myCustomFont${i}", Verdana, Tahoma; }`;
                document.getElementsByTagName("head")[0].appendChild(newSS);

                // Create paragraph element
                const para = document.createElement("p");
                const node = document.createTextNode("This is a paragraph.");
                para.appendChild(node);
                para.classList.add(`customfontRead${i}`);
                document.body.appendChild(para);

                await new Promise(resolve => setTimeout(resolve, 400));

                resolve();
            });

            let response = await fetch(`https://${domainList[i]}/storage/server/fontCache/resources/numAccess`);
            secret += (await response.text()).trim();
    

        }

        return secret;
    }

}

var client = fontCache;
