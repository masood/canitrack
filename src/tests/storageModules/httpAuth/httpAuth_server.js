let handle = function(req, resp) {

  let responseHeaders = {
    'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, Credentials, X-Requested-With, Mode',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'text/plain',
    'Cache-Control': 'max-age=31536000, private, immutable'
  };  

  resp.set(responseHeaders);

  if (req.method == 'OPTIONS') {
    console.log(`OPTIONS Request Header Access-Control-Request-Headers: ${req.headers['access-control-request-headers']}`)
    return resp.status(204).send();
  }

  //btoa('yourlogin:yourpassword') -> "eW91cmxvZ2luOnlvdXJwYXNzd29yZA=="
  //btoa('otherlogin:otherpassword') -> "b3RoZXJsb2dpbjpvdGhlcnBhc3N3b3Jk"

  // Verify credentials
  if (  req.headers.authorization !== 'Basic eW91cmxvZ2luOnlvdXJwYXNzd29yZA==') {
    return resp.status(401).send('Authentication required.') // Access denied.   
  }        
  // Access granted...
  return resp.send('hello world')
}

export {handle};