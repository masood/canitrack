//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement Cache Storage Read and Write.
 */
class AcceptCh {
    generateUserID(id, domainList) {
        let rint = id;
        let protocol = 'https://';
        window.location.href = protocol + domainList[0] + '/storage/server/acceptch/landing?id=' + rint + '&browser=' + browserName + '&test=' + testModule + '&subtest=' + subtestName + '&method=write';
    }
    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    write (secret, domainList) {
        return new Promise(async (resolve, reject) => {
            if (window.location.search) {
                console.log(window.location.search.substring(4));
                resolve(window.location.search.substring(4));
                return;
            }
            this.generateUserID(parseInt(secret.substring(0,5), 2), domainList);
        });
    }

    read (domainList) {
        let protocol = 'https://'
        return new Promise((resolve, reject) => {
            if (window.location.search) {
                console.log(window.location.search.substring(4));
                resolve(window.location.search.substring(4));
                return;
            }
            window.location.href = protocol + domainList[0] + '/storage/server/acceptch/landing?browser=' + browserName + '&test=' + testModule + '&subtest=' + subtestName + '&method=read';
        });
    }   

}

var client = AcceptCh;
