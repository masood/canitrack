
async function sendResult(secret, path) {
    try {
        const response = await fetch(path, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
           },
           body: JSON.stringify({
            // your expected POST request payload goes here
             secret: secret,
            })
         });
         const data = await response.text();
        // enter you logic when the fetch is successful
         console.log(data);
         return;
       } catch(error) {
     // enter your logic for when there is an error (ex. error toast)

          console.log(error)
         } 
}

(async () => {
    let pathname = window.location.pathname.split('/');
    let currentDomainIndex = redirectionDomainList.indexOf(location.host);

    if (pathname[pathname.length-1] == 'write') {
      //for performance
      // top.postMessage("start test", "*");
      let storage = new client();
      let result;
      if (needsDomains == true) {
        await storage.write(uniqueID.slice(currentDomainIndex, currentDomainIndex + bitsPerVisit), domainList);
        // result = await storage.read(domainList);
      } else {
        await storage.write(uniqueID.slice(currentDomainIndex, currentDomainIndex + bitsPerVisit));
        // result = await storage.read();
      }
      
      // await sendResult(result, `/tests/server/${storageModule}/${browserName}/${testModule}/${subtestName}/writeResult`);

      if (!((parseInt(currentDomainIndex)+parseInt(bitsPerVisit)) > (redirectionDomainList.length - 1 ))) {
        // if (parseInt(bitsPerVisit) == 1) {
        nextOne = uniqueID.indexOf("1", currentDomainIndex+1);
        // await fetch(`/storage/server/faviconCache/resources/clear`);
        window.location.href = `${window.location.protocol}//${redirectionDomainList[nextOne]}${window.location.pathname}`;
        // window.location = `${window.location.protocol}//${redirectionDomainList[parseInt(currentDomainIndex)+parseInt(bitsPerVisit)]}${window.location.pathname}`;
      } else {
        // top.postMessage("end test", "*");
        top.postMessage("secret computed", "*");
      }

    }
    else if (pathname[pathname.length-1] == 'read') {

      // top.postMessage("start test", "*");
      let storage = new client();
      let result;
      if (needsDomains == true) {
        result = await storage.read(domainList);
      } else {
        result = await storage.read();
      }
      await sendResult(result, `/tests/server/${storageModule}/${browserName}/${testModule}/${subtestName}/readResult`);

      console.log(`Current Domain Index: ${currentDomainIndex}`);
      console.log(`Bits Per Visit: ${bitsPerVisit}`);

      if (!((parseInt(currentDomainIndex)+parseInt(bitsPerVisit)) > (redirectionDomainList.length - 1))) {
        window.location = `${window.location.protocol}//${redirectionDomainList[parseInt(currentDomainIndex)+parseInt(bitsPerVisit)]}${window.location.pathname}`;
      } else {
        // top.postMessage("end test", "*");
        top.postMessage("secret computed", "*");
      }
    }
})();