import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();


var imageAccesses = {};

var setCacheHeader = true;

function handleimage(req, resp){

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

    resp.sendFile(`${__dirname}/storageModules/imageCache/example-image.jpg`, function(err) {
        if (err) console.log(err);

        if (!(req.headers.host in imageAccesses)) {
            imageAccesses[req.headers.host] = 0;
        } else {
            imageAccesses[req.headers.host] += 1;
        }
        console.log(`Sending image for: ${req.headers.host}`);
    });
}

function handleAccess(req, resp) {
    
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    if (req.headers.host in imageAccesses) {
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

    imageAccesses = {};

    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    imageAccesses = storageConfig["numAccesses"];
    setCacheHeader = storageConfig["setCacheHeader"];
    if (req.url.includes("/resources/image") && req.method == 'GET') {
        handleimage(req, resp, imageAccesses);
    }
    else if (req.url.includes("/resources/numAccess") && req.method == 'GET') {
        handleAccess(req, resp, imageAccesses);
    }
    else if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp, imageAccesses);
    }
    storageConfig["numAccesses"] = imageAccesses;
    storageConfig["setCacheHeader"] = setCacheHeader;

    return storageConfig;
}

export {handle};