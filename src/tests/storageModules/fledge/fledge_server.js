import fs from "fs"
import path from 'path';

const __dirname = path.resolve();

function handleBiddingLogic(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable',
        'x-allow-fledge': true,
        'Supports-Loading-Mode': 'fenced-frame'
    };
    resp.set(responseHeaders);
    resp.sendFile(`${__dirname}/storageModules/fledge/bidding_logic.js`, function(err) {
            if (err) throw err; 
    });
}

function handleBiddingSignal(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable',
        'x-allow-fledge': true,
        'Supports-Loading-Mode': 'fenced-frame'
    };
    resp.set(responseHeaders);
    resp.sendFile(`${__dirname}/storageModules/fledge/bidding_signal.json`, function(err) {
            if (err) throw err; 
    });
}

function handleShoppingAd(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable',
        'x-allow-fledge': true,
        'Supports-Loading-Mode': 'fenced-frame'
    };
    resp.set(responseHeaders);
    resp.sendFile(`${__dirname}/storageModules/fledge/shopping-ad.html`, function(err) {
            if (err) throw err; 
    });
}
function handleDecisionLogic(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable',
        'x-allow-fledge': true,
        'Supports-Loading-Mode': 'fenced-frame'
    };
    resp.set(responseHeaders);
    resp.sendFile(`${__dirname}/storageModules/fledge/decision_logic.js`, function(err) {
            if (err) throw err; 
    });
}

async function handleReporting (req, resp) {
    const data = {
        date: new Date(),
        query: req.query,
        body: req.body,
    }
    console.log(req.hostname);
    const log = JSON.stringify(data) + "\n"
    console.log(log)
    await fs.promises.writeFile("./report.log", log, { flag: "a" })
    resp.status(201);
    resp.send("");
}

async function handleJoinInterestGroup(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable',
        'x-allow-fledge': true,
        'Supports-Loading-Mode': 'fenced-frame'
    };
    resp.set(responseHeaders);
    resp.sendFile(`${__dirname}/storageModules/fledge/joinInterestGroup.html`, function(err) {
            if (err) throw err; 
    });
}

let handle = function(req, resp) {
    if (req.url.includes("/bidding_logic.js")) {
        handleBiddingLogic(req, resp);
    } else if (req.url.includes("/bidding_signal.js")) {
        handleBiddingSignal(req, resp);
    } else if (req.url.includes("/decision_logic.js")) {
        handleDecisionLogic(req, resp);
    } else if (req.url.includes("/shopping-ad.html")) {
        handleShoppingAd(req, resp);
    } else if (req.url.includes("/reporting")) {
        handleReporting(req, resp);
    } else if (req.url.includes("/joinAdInterestGroup")) {
        handleJoinInterestGroup(req, resp);
    }
}

export {handle};