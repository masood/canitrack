import { response } from 'express';
import { readFile } from 'fs/promises';

const config = JSON.parse(
  await readFile(
    new URL('../../config.json', import.meta.url)
  )
);

const sites = config["domains"]["sites"];
const subdomains = config["domains"]["subdomains"];
const ports = config["domains"]["ports"];

var nelAccesses = {};

function handleReport(req, resp) {
  console.log(req.path);
  let splitPath = req.path.split('/')
  nelAccesses["secret"] = splitPath[splitPath.length-1];
  console.log(`Secret Fetched: ${nelAccesses['secret']}`);
  // console.log(req);
  // console.log(req.body);
  resp.send(req.body);
  return;
}

function handleClear(req, resp) {
  nelAccesses = {};
  console.log(req.path);
  resp.send("Cleared Secret");
  return;
}

function handleFetch(req, resp) {
  console.log(req.path);
  resp.send("Handled Fetch");
  return;
}

function receivedYet(req, resp) {
  console.log(req.path);
  if ("secret" in nelAccesses) {
    resp.send(`${nelAccesses['secret']}`);
  } else  {
    resp.send("Not Yet");
  }
  return;
}

let handle = function(req, resp, storageConfig, returnHeaders=false) {

  if (returnHeaders == true) {
    let uniqueID = storageConfig["uniqueID"];
    let writeHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'NEL': `{"report_to": "network-errors", "max_age": 2592000, "include_subdomains": true, "success_fraction": 1.0, "failure_fraction": 1.0 }`,
        'Report-To': `{
              "group": "network-errors",
              "max_age": 2592000,
              "endpoints": [{
              "url": "https://${sites[4]}/storage/server/nel/network-reports/${uniqueID}"
              }]
        }`.replace(/[\n\s]/g, '')
      }
    let readHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With'
      }
    return {
      'writeHeaders': writeHeaders,
      'readHeaders': readHeaders
    }
  }

  nelAccesses = storageConfig["numAccesses"];

  if (req.url.includes("/network-reports")) {
    handleReport(req, resp);
  }
  else if (req.url.includes("/check-secret")) {
    receivedYet(req, resp);
  }
  else if (req.url.includes("/handle-fetch")) {
    handleFetch(req, resp);
  }
  else if (req.url.includes("/clear-access")) {
    handleClear(req, resp);
  }

  storageConfig['numAccesses'] = nelAccesses;
  return storageConfig;
}

export {handle};