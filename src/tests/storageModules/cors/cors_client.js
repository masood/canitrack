
class Cors {
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
    setBitMap(num) {
         let bitArr = [];
         let maxBits = 32;
         let i = 0;
         while(i < maxBits) {
             bitArr.push(num % 2);
             num = Math.floor(num/2);
             i++;
         }
         return bitArr.reverse();
    }    

    userIdFetched(resolve) {
        let hostname = '/storage/server/cors/getuser';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', hostname);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            let resp = JSON.parse(xhr.responseText);
            console.log(resp);
            if (resp.err === false) {
                // let time = (new Date()).getTime() - now;
                // document.timeTaken = time;
                // document.getElementById('cookie_id').innerHTML = resp.id;
                resolve(resp.id.toString(2));
            }
        }
        xhr.send();
    }
            
    generateUserID(id, resolve, domainList, start) {
        let hostname = 'https://' + domainList[1] + '/storage/server/cors/resources/';
        let done = [];
        let rint = id || parseInt(document.getElementById('user_id').value);
        console.log(rint);
        let bitMap = rint.split("").map(item => parseInt(item));
        console.log(bitMap);
        let lastReq;
        let marker = new XMLHttpRequest();
        marker.open('POST', hostname + 0);
        marker.send();
        for(let i = 0; i < bitMap.length; i++) {
            if (bitMap[i] === 1) {
                let xhrInner = new XMLHttpRequest();
                xhrInner.open('POST', hostname + (i+1) + "/");
                xhrInner.setRequestHeader('X-PINGOTHER2', 'pong');
                xhrInner.send(`something`);
                lastReq = xhrInner;
            }
        }
        lastReq.onreadystatechange = function() {
            if (lastReq.readyState !== XMLHttpRequest.DONE) return;
            resolve();
        }
    }

    getTrimmedHostName() {
        return window.location.hostname;
    }

    read(domainList) {

        return new Promise(async (resolve, reject) => {
            await fetch(`/storage/server/cors/resources/clear`);
            let hostname = 'https://' + domainList[1] + '/storage/server/cors/resources/';
            //let hostname = 'http://dummy1.com:8080/resources/
            let now = (new Date()).getTime();
            let xhr = new XMLHttpRequest();
            xhr.open('POST', hostname + '0');
            let start = new Date().getTime();
            let fetchUserId = this.userIdFetched;
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== XMLHttpRequest.DONE) return;
                let resp = JSON.parse(xhr.responseText);
                console.log(resp['preflight_triggered']);
                if (resp['preflight_triggered']) {
                    resolve(null);
                } else {
                    window.bitMap = [-1, -1, -1];
                    window.count = 0;
                    let st = (new Date()).getTime();
                    let xhrLast;
                    for(let i = 0; i < 32; i++) {
                        let xhrInner = new XMLHttpRequest();
                        let off = i;
                        xhrInner.open('POST', hostname + (i+1) + "/");
                        xhrInner.setRequestHeader('X-PINGOTHER2', 'pong');
                        xhrInner.onreadystatechange = function() {
                            if (xhrInner.readyState !== XMLHttpRequest.DONE) return;
                            if ((new Date()).getTime() - st > 5000) {
                                window.bitMap[off] = 0;
                            } else {
                                window.bitMap[off] = 1;
                            }
                            window.count++;
                            if (count === 32) {
                                fetchUserId(resolve);
                            }
                            console.log(count);
                        }
                        xhrInner.send(`something`);
                        xhrLast = xhrInner;
                    }
                }
            };
            xhr.send();
        });
    }

    write(id, domainList) {
        return new Promise((resolve, reject) => {
            this.generateUserID(id, resolve, domainList);
        });
    }
}

let client = Cors