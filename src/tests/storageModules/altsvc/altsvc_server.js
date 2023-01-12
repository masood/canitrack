import { request } from "https";

var setCacheHeader = true;

function handleAltSvc(req, resp) {
  let responseHeaders = {};
  if (setCacheHeader == true) {
    responseHeaders = {
      'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      'Access-Control-Expose-Headers': 'Alt-Svc', 
      'Alt-Svc': 'h2=":941"; ma=86400; persist=1,h3=":943"; ma=86400; persist=1,h3-29=":943"; ma=86400; persist=1,h3-32=":943"; ma=86400; persist=1,h3-Q050=":943"; ma=86400; persist=1,h3-Q043=":943"; ma=86400; persist=1,quic=":943"; ma=86400; persist=1; v="46,43"',
      'Content-Type': 'text/plain'
    };
  } else {
    responseHeaders = {
      'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      'Access-Control-Expose-Headers': 'Alt-Svc',
      'Content-Type': 'text/plain'
    };
  }
  resp.set(responseHeaders);
  resp.send('Response from Regular Port');
}

function clearAccess(req, resp) {

  let responseHeaders = {
    'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Expose-Headers': 'Alt-Svc',
    'Content-Type': 'text/plain'
  };

  resp.set(responseHeaders);

  setCacheHeader = false;

  console.log("Set Cache Header Cleared");

  resp.send("Set Cache Header Cleared");
}


let handle = function(req, resp, storageConfig) {
    setCacheHeader = storageConfig['setCacheHeader'];

    if (req.url.includes("/resources/clear") && req.method == 'GET') {
      clearAccess(req, resp);
    } else {
      handleAltSvc(req, resp);
    }
    
    storageConfig['setCacheHeader'] = setCacheHeader;
    return storageConfig;
}

export {handle};