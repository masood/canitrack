import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();



var faviconAccesses = {};

var setCacheHeader = true;

function handleFavicon(req, resp){
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
    
    resp.sendFile(`${__dirname}/storageModules/faviconCache/favicon.ico`, function(err) {
        try {
            if (err) console.log(err);
            let pathname = req.path.split('/');
            let key = pathname[pathname.length - 1];
            // let secret = req.query.secret;

            if (!(req.headers.host in faviconAccesses)) {
                faviconAccesses[req.headers.host] = 0;
            } else {
                faviconAccesses[req.headers.host] += 1;
            }
            console.log(`Sending Favicon For: ${req.headers.host}`);
        } catch(e) {
            console.log(e);
        }
    });
}

function handleAccess(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    if (req.headers.host in faviconAccesses) {
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

    faviconAccesses = {};

    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    faviconAccesses = storageConfig["numAccesses"];
    setCacheHeader = storageConfig["setCacheHeader"];
    if (req.url.includes("/resources/favicon") && req.method == 'GET') {
        handleFavicon(req, resp, faviconAccesses);
    }
    else if (req.url.includes("/resources/numAccess") && req.method == 'GET') {
        handleAccess(req, resp, faviconAccesses);
    }
    else if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp, faviconAccesses);
    }
    storageConfig["numAccesses"] = faviconAccesses;
    storageConfig["setCacheHeader"] = setCacheHeader;
    return storageConfig;
}

export {handle};