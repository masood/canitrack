let preflights = {};
var setCacheHeader = true;


function handleCORSPreflight(req,res) {
    
    let urlComponents = req.url.split("\/");
    //let id = req.url.substring(req.url.indexOf("id=") + 3);
    console.log(urlComponents);
    // let seqNo  = req.params['seq'];
    let seqNo = urlComponents[5];
    preflights[req.connection.remoteAddress] = preflights[req.connection.remoteAddress] || {};
    
    if (setCacheHeader == false) {
        res.writeHead(200, { 'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin), 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type, X-PINGOTHER2',
        'Access-Control-Max-Age': 0 });
        
        preflights[req.connection.remoteAddress][seqNo] = 1;
    } else {
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type, X-PINGOTHER2',
        'Access-Control-Max-Age': /*user_alloc[id][parseInt(seqNo) - 2] === 0 ? 0 :*/ 300 });
        if (seqNo === '0') preflights[req.connection.remoteAddress][seqNo] = 1;
    }
    res.end();
}

function handleCORS(req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin), 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type', 'Access-Control-Max-Age': 300 });
    let urlComponents = req.url.split("\/");
    let seqNo  = urlComponents[5].substring(0, 1);
    if (seqNo === '0') {
        let preflight_triggered = !!(preflights[req.connection.remoteAddress] && preflights[req.connection.remoteAddress][seqNo]);
        if (preflights[req.connection.remoteAddress]) {
            delete(preflights[req.connection.remoteAddress])
        }
        res.end(JSON.stringify({ preflight_triggered: preflight_triggered}))
    } else {
        res.end();
    } 
}

function fetchUserID(req, res) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin), 'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type', 'Access-Control-Max-Age': 300 });
    let userID = 0;
    let userIdComplete = true;
    for(let i = 32; i >= 1; i--) {
        let bit = ((preflights[req.connection.remoteAddress] && preflights[req.connection.remoteAddress][i]) || 0);
        userID +=  Math.abs(bit - 1) * Math.pow(2, 32 - i);
    }
    console.log(userID, preflights);
    let result;
    if (!userIdComplete) {
        result = {
            id: -1,
            err: true
        };
    } else {
        result = {
            id: userID,
            err: false
        };
    }
    res.end(JSON.stringify(result));
}

function clearAccess(req, resp) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    };

    resp.set(responseHeaders);
    
    setCacheHeader = false;

    console.log("Key Cleared");

    resp.send("Key Cleared");
}

let handle = function(req, resp, storageConfig) {
    preflights = storageConfig["numAccesses"];
    setCacheHeader = storageConfig["setCacheHeader"];
    if (req.url.includes("/resources/clear") && req.method == 'GET') {
        clearAccess(req, resp);
    } else if (req.url.includes("/resources") && req.method == 'POST') {
        handleCORS(req, resp);
    } else if (req.url.includes("/resources") && req.method == 'OPTIONS') {
        handleCORSPreflight(req, resp);
    } else if (req.url.includes("/getuser")) {
        console.log("USER ID FETCH")
        fetchUserID(req, resp);
    }
    storageConfig["setCacheHeader"] = setCacheHeader;
    storageConfig["numAccesses"] = preflights;
    return storageConfig;
}

export {handle};