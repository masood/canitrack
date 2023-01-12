
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
       } catch(error) {
     // enter your logic for when there is an error (ex. error toast)

          console.log(error)
         } 
}

(async () => {
    let pathname = window.location.pathname.split('/');
    console.log(pathname);
    console.log(domainList);

    window.name = Date.now();

    if (pathname[pathname.length-1] == 'write') {
      let storage = new client();
      let result;
      if (needsDomains == true) {
        await storage.write(uniqueID, domainList);
        result = await storage.read(domainList);
      } else {
        await storage.write(uniqueID);
        result = await storage.read();
      }
      console.log(result);
      
      await sendResult(result, `/tests/server/${storageModule}/${browserName}/${testModule}/${subtestName}/writeResult`);
      top.postMessage("secret computed", "*");
    }
    else if (pathname[pathname.length-1] == 'read') {
      let storage = new client();
      let result;
      if (needsDomains == true) {
        if (numAccessesBased == true) {
          result = await storage.read(domainList, clear=true);
        } else {
          result = await storage.read(domainList);
        }
      } else {
        if (numAccessesBased == true) {
          result = await storage.read(clear=true);
        } else {
          result = await storage.read();
        }
      }
      await sendResult(result, `/tests/server/${storageModule}/${browserName}/${testModule}/${subtestName}/readResult`);
      top.postMessage("secret computed", "*");
    }
})();