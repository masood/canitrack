import * as fs from "fs";
import path from 'path';

const __dirname = path.resolve();

function serveWorkerScript(req, res) {
    res.writeHead(200, { 'Cache-Control': 'no-cache',  'Service-Worker-Allowed':"/", "Content-Type": "application/javascript" });
    fs.readFile(`${__dirname}/storageModules/serviceWorker/worker.js`, function (err, data) {
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

let handle = function(req, resp) {
    if (req.url.includes("serviceWorker.js") && req.method == 'GET') {
        serveWorkerScript(req, resp);
    }
}

export {handle};