import * as fs from "fs";
import path from 'path';

const __dirname = path.resolve();

var jsAccesses = {};

var setCacheHeader = true;


function handleJsReq(req,resp) {
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
    
    resp.sendFile(`${__dirname}/storageModules/httpCache/js/demo.js`, function(err) {
        if (err) console.log(err);
        if (!(req.headers.host in jsAccesses)) {
            jsAccesses[req.headers.host] = 0;
        } else {
            jsAccesses[req.headers.host] += 1;
        }
        console.log(`Sending JS For: ${req.headers.host}`);
    });
}

function handleAccess(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    if (req.headers.host in jsAccesses) {
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

    jsAccesses = {};

    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    jsAccesses = storageConfig['numAccesses'];
    setCacheHeader = storageConfig['setCacheHeader'];
    console.log("HERE");
    if (req.url.includes("/resources/js") && req.method == 'GET') {
        handleJsReq(req, resp);
    } else if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp);
    } else if (req.url.includes("/resources/numAccess") && req.method == 'GET') {
        handleAccess(req, resp);
    }
    storageConfig['numAccesses'] = jsAccesses;
    storageConfig['setCacheHeader'] = setCacheHeader;
    return storageConfig;
}

export {handle};