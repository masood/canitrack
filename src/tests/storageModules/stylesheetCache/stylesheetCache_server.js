import * as fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

var stylesheetAccesses = {};

var setCacheHeader = true;

function handleStylesheet(req, resp){
    let responseHeaders = {};

    // For older versions of Brave, use: 'Access-Control-Allow-Origin': req.headers.origin
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
    
    resp.sendFile(`${__dirname}/storageModules/stylesheetCache/stylesheet.css`, function(err) {
        if (err) console.log(err);
        if (!(req.headers.host in stylesheetAccesses)) {
            stylesheetAccesses[req.headers.host] = 0;
        } else {
            stylesheetAccesses[req.headers.host] += 1;
        }
        console.log(`Sending Stylesheet For: ${req.headers.host}`);
    });
}

function handleAccess(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    if (req.headers.host in stylesheetAccesses) {
        resp.send("0");
    } else {
        resp.send("1");
    }

    // resp.send(stylesheetAccesses[req.headers.host].toString());
    
}

function clearAccess(req, resp) {

    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);

    stylesheetAccesses = {};

    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    stylesheetAccesses = storageConfig['numAccesses'];
    setCacheHeader = storageConfig['setCacheHeader'];
    if (req.url.includes("/resources/styleSheet") && req.method == 'GET') {
        handleStylesheet(req, resp);
    }
    else if (req.url.includes("/resources/numAccess") && req.method == 'GET') {
        handleAccess(req, resp);
    }
    else if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp);
    }
    storageConfig['numAccesses'] = stylesheetAccesses;
    storageConfig['setCacheHeader'] = setCacheHeader;
    return storageConfig;
}

export {handle};