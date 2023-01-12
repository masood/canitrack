//import Storage from './storage.js';

/**
 * @class
 * @classdesc Defining Storage Class to implement the font Cache Read and Write.
 */
 class fledge {


    /**
     * Writes a new cookie with supercookie ID.
     * @param {string} secret - Supercookie ID to be stored using cookie.
     */    
    async write (secret, domainList) {
        for (let i=0; i < domainList.length; i++) {
            if (secret[i] == '1') {
                var iframe = document.createElement('iframe');
                iframe.style.display = "none";
                iframe.src = `https://${domainList[i]}/storage/server/fledge/joinAdInterestGroup`;
                document.body.appendChild(iframe);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    }


    async read (domainList) {
        let secret = '';
        for (let i = 0; i < 32; i++) {
            let dummyHostname = `https://${domainList[i]}`;
            // ssp
            let auctionConfig = {
                seller: dummyHostname, // should https & same as decisionLogicUrl's origin
    
                // x-allow-fledge: true
                decisionLogicUrl: `${dummyHostname}/storage/server/fledge/decision_logic.js`,
    
                interestGroupBuyers: [
                    // * is not supported yet
                    `${dummyHostname}`,
                ],
                // public for everyone
                auctionSignals: { auction_signals: "auction_signals" },
    
                // only for single party
                sellerSignals: { seller_signals: "seller_signals" },
    
                // only for single party
                perBuyerSignals: {
                    // listed on interestGroupByers
                    [dummyHostname]: { per_buyer_signals: "per_buyer_signals" },
                }
            }
            let adAuctionResult = await navigator.runAdAuction(auctionConfig);
            console.log(`Ad Auction Result: ${adAuctionResult}`);
    
            if (adAuctionResult == null) {
                secret += '0';    
            } else {
                secret += '1'; 
            }
        }
        return secret; 
    }

}

var client = fledge;
