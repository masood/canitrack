import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

var fontAccesses = {};

var setCacheHeader = true;

function handleFont(req, resp){

    let responseHeaders = {};

    if (setCacheHeader == true) {
        responseHeaders = {
            'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
            'Cache-Control': 'max-age=31536000, private, immutable'
        };
    } else {
        responseHeaders = {
            'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        };
    }

    resp.set(responseHeaders);
    
    resp.sendFile(`${__dirname}/storageModules/fontCache/myFont.ttf`, function(err) {
        if (err) console.log(err);

        if (!(req.headers.host in fontAccesses)) {
            fontAccesses[req.headers.host] = 0;
        } else {
            fontAccesses[req.headers.host] += 1;
        }
        console.log(`Sending font for: ${req.headers.host}`);
    });
}

function handleAccess(req, resp) {
    
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    if (req.headers.host in fontAccesses) {
        resp.send("0");
    } else {
        resp.send("1");
    }
}

function clearAccess(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    fontAccesses = {};

    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    fontAccesses = storageConfig["numAccesses"];
    setCacheHeader = storageConfig["setCacheHeader"];
    if (req.url.includes("/resources/font") && req.method == 'GET') {
        handleFont(req, resp);
    }
    else if (req.url.includes("/resources/numAccess") && req.method == 'GET') {
        handleAccess(req, resp);
    }
    else if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp);
    }

    storageConfig["numAccesses"] = fontAccesses;
    storageConfig["setCacheHeader"] = setCacheHeader;

    return storageConfig;
}

export {handle};