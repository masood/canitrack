import * as fs from "fs";
import path from 'path';

const __dirname = path.resolve();


let headerList = [
    'viewport-width',
    'device-memory',
    'rtt',
    'downlink',
    'ect', 
];

function retrieveUserId(req, res) {
    let headers = req.headers;
    let userId = "";
    let subId = req.query.sub_id || "";

    let headerSet = new Set(Object.keys(headers));
    for(let i = 0; i < headerList.length; i++) {
        userId += headerSet.has(headerList[i]) ? 1 : 0;
    }
    let final_user_id = subId+ userId;
    return final_user_id.split("").reverse().join("");
}

function generateUserID(req,res) {
    let userId = parseInt(req.query.id);
    let resp_ch_headers = [];
    let index = 0;
    let subId = req.query.sub_id || "";
    while(index < headerList.length) {
        if (userId % 2 === 1) {
            resp_ch_headers.push(headerList[index]);
        }
        subId += userId % 2;
        userId = Math.floor(userId / 2);
        index++;
    }
    resp_ch_headers.push('dpr');
    res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Vary',
        'Access-Control-Max-Age': 300,
    'Accept-CH': resp_ch_headers.join(',') });
    
    return subId.split("").reverse().join("");
}

function getUserID(req, res) {
    let dpr = req.headers['dpr'];
    if (dpr && !req.query.set) {
        return retrieveUserId(req, res);
    } else if (req.query.id !== undefined) {
        return generateUserID(req, res);
    }
}


let handle = function(req, resp) {
    let userID = getUserID(req, resp);
    let markup = fs.readFileSync(`${__dirname}/storageModules/acceptch/landing.html`, 'utf-8');
    markup = markup.replace('##userId##', userID);
    markup = markup.replace('##test##', req.query.test);
    markup = markup.replace('##browserName##', req.query.browser);
    markup = markup.replace('##subtestName##', req.query.subtest);
    markup = markup.replace('##method##', req.query.method);
    if(!resp.headersSent) {
        resp.send(markup);
    }
}

export {handle};