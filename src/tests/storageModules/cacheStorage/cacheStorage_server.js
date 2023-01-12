function handleResource(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable'
    };
    resp.set(responseHeaders);
    resp.send('Saw Request');
}

let handle = function(req, resp) {
    if (req.url.includes("/resources") && req.method == 'GET') {
        handleResource(req, resp);
    }
}

export {handle};