import * as fs from "fs";
import path from 'path';

const __dirname = path.resolve();

var uniqueID = '';
var setCacheHeader = true;

function serveWorkerScript(req, res) {
    res.writeHead(200, { 'Cache-Control': 'no-cache',  'Service-Worker-Allowed':"/", "Content-Type": "application/javascript" });
    fs.readFile(`${__dirname}/storageModules/serviceWorkerCache/worker.js`, function (err, data) {
        if (err) console.log(err);
        else{
            try{
                res.write(data);
                res.end();
            } catch(error) {
                console.log(error);
            }
        }
    });
}

function handleSecret(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };
    
    resp.set(responseHeaders);
    
    if (setCacheHeader == true) {
        resp.send(`${uniqueID}`);
        setCacheHeader = false;
    } else {
        resp.send("Gibberish");
    }
    
}

let handle = function(req, resp, storageConfig) {
    uniqueID = storageConfig["uniqueID"];
    setCacheHeader = storageConfig["setCacheHeader"];
    console.log("HEREE");
    if (req.url.includes("serviceWorker.js") && req.method == 'GET') {
        serveWorkerScript(req, resp);
    } else if (req.url.includes("sw-secret") && req.method == 'GET') {
        handleSecret(req, resp);
    }
    storageConfig["setCacheHeader"] = setCacheHeader;

    return storageConfig;
}

export {handle};