
class HttpCache {

    async write(id, domainList) {
        console.log("Writing", id);
        for(let i = 0; i < domainList.length; i++) {
            if (id[i] === '1') {
                let marker = new XMLHttpRequest();
                marker.open('GET', `https://${domainList[i]}/storage/server/httpCache/resources/js`);
                marker.send();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async read(domainList) {
        let secret = "";
        await fetch(`/storage/server/httpCache/resources/clear`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        for (let i = 0; i < domainList.length; i++) {
            let marker = new XMLHttpRequest();
            marker.open('GET', `https://${domainList[i]}/storage/server/httpCache/resources/js`);
            marker.send();
            await new Promise(resolve => setTimeout(resolve, 1000));
            let response = await fetch(`https://${domainList[i]}/storage/server/httpCache/resources/numAccess`);
            secret += (await response.text()).trim();
        }
        return secret;
    }
}

let client = HttpCache;