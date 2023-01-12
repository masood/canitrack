class Hsts {
    
    getUserID (cb) {      
        let url = 'http://' + window.location.hostname + '/storage/server/hsts/getuser-hsts/';
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            let resp = JSON.parse(xhr.responseText);
            if (resp.err === false) {
                // convert integer user ID to binary string for callback receiver
                cb(resp.id.toString(2));
            }
        }
        xhr.send();
    }
    
    generateURL(seqNo, https, path, domainList) {
        let protocol = https ? 'https://' : 'http://';
        // return protocol + seqNo + "." + domainList[0] + path +  "/";
        return protocol + domainList[seqNo] + path + "/";
    }

    generateUserID(id, cb, domainList) {
        let bitMap = id.split("").map(item => parseInt(item));
        console.log(bitMap);
        window.count = 0;
        window.setBitCount = 0;
        // Only fire pixels over https for set bits 
        for(let i = 0; i < Math.min(bitMap.length - 1, 31); i++) {
            console.log(bitMap[i], window.setBitCount);
            window.setBitCount += bitMap[i];            
        }
        for(let i = 0; i < Math.min(bitMap.length - 1, 31); i++) {
            if (bitMap[i] === 1) {
                let img = (new Image());
                img.onload = () => {
                    window.count++;
                    if (window.count === window.setBitCount) {
                        // Fetch user id from server
                        cb();
                    }
                }
                img.src = this.generateURL(i+1, true, '/storage/server/hsts', domainList) + 'images/' + (i+1);
                
            }
        }
    }

    write(id, domainList) {
        return new Promise((resolve, reject) => {
            this.generateUserID(id, resolve, domainList);
        });
    }
    read(domainList) {
        return new Promise((resolve, reject) => {
            // Fire image pixel with sequence number /0 to erase any existing data
            let marker = (new Image());
            marker.src = this.generateURL(0, false, '/storage/server/hsts', domainList) + 'images/' + 0;
            window.count = 0;
            marker.onload = function() {
                let imgRead;
                // Fire all pixel rquests over HTTPS, see how many are upgraded on server side
                for(let i = 0; i < 31; i++) {
                    imgRead = (new Image());
                    imgRead.onload = () => {
                        window.count++;
                        if (window.count === 30) {
                            // Fetch user id from server
                            this.getUserID(resolve);
                        }
                    }
                    imgRead.src = this.generateURL(i+1, false, '/storage/server/hsts', domainList) + 'img/' + (i+1); 
                }
            }.bind(this);
        });
    }
}

let client = Hsts