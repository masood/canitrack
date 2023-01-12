import * as fs from "fs";
import path from 'path';

const __dirname = path.resolve();

let insecure_requests = {};


function handleHSTSRead(req,res) {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    let urlComponents = req.url.split("\/");
    let seqNo  = urlComponents[5];
    let status = 200;
    if (!(req.connection.remoteAddress in insecure_requests)) {
        insecure_requests[req.connection.remoteAddress] = {};
    }
    let header = {
        'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type,X-PINGOTHER2,X-FIRST', 'Access-Control-Max-Age': 300, 'Cache-Control': 'no-store'
    }

    if (!req.secure) {
        insecure_requests[req.connection.remoteAddress][seqNo] = 1;
    }
    header['Strict-Transport-Security'] = 'max-age=300'

    res.writeHead(status, 
        header
    );
    fs.readFile(`${__dirname}/storageModules/hsts/img/404.jpg`, function (err, data) {
        if (err) {
            console.log(err);
        }
        try {
            res.write(data);
            res.end();
        } catch(error) {
            console.log(error);
        }
    });
}
function handleHSTSWrite(req, res) {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
    let urlComponents = req.url.split("\/");
    console.log(urlComponents);
    let seqNo  = urlComponents[5];
    console.log(seqNo);
    console.log(req.connection.remoteAddress);
        let status = 200;
        if (!(req.connection.remoteAddress in insecure_requests)) {
            insecure_requests[req.connection.remoteAddress] = {};
        }
        let header = {
            'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type,X-PINGOTHER2,X-FIRST', 'Access-Control-Max-Age': 300, 'Cache-Control': 'no-store'
        }
        if (!req.secure) {
            insecure_requests[req.connection.remoteAddress][seqNo] = 1;
        }
        header['Strict-Transport-Security'] = 'max-age=300';

        res.writeHead(status, 
            header
        );
        fs.readFile(`${__dirname}/storageModules/hsts/img/404.jpg`, function (err, data) {
            if (err) {
                console.log(err);
            }
            try{
                res.write(data);
                res.end();
            } catch(error) {
                console.log(error);
            }
        });
}

function fetchUserID(req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin), 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type, X-PINGOTHER2', 'Access-Control-Max-Age': 300 });
    let userID = 0;
    let userIdComplete = true;
    // Binary to int
    for(let i = 32; i >= 1; i--) {
        let bit = ((insecure_requests[req.connection.remoteAddress] && insecure_requests[req.connection.remoteAddress][i]) || 0);
        userID +=  Math.abs(bit-1) * Math.pow(2, 32 - i);
    }
    console.log(insecure_requests);
    let result = {
        id: userID,
        err: false
    };
    res.end(JSON.stringify(result));
}


let handle = function(req, resp, storageConfig) {
    insecure_requests = storageConfig["numAccesses"];
    if (req.url.includes("/images/")) {
        handleHSTSWrite(req, resp);
    } else if (req.url.includes("/img/")) {
        handleHSTSRead(req, resp);
    } else if (req.url.includes("/getuser-hsts")) {
        fetchUserID(req, resp)
    }
    storageConfig["numAccesses"] = insecure_requests;
    return storageConfig;
}

export {handle};