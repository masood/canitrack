import path from 'path';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import express from "express";
import dotenv from 'dotenv'
import { readFile } from 'fs/promises';
import * as childProcess from "child_process";


const exec = util.promisify(childProcess.exec);

import * as lockfile from 'proper-lockfile';
const retryOptions = {
    retries: {
        retries: 5,
        factor: 3,
        minTimeout: 1 * 1000,
        maxTimeout: 60 * 1000,
        randomize: true,
    }
};

dotenv.config()

const privateKey = process.env.privateKeyPath ? fs.readFileSync(process.env.privateKeyPath, 'utf-8') : null;
const certificate = process.env.certificatePath ? fs.readFileSync(process.env.certificatePath, 'utf-8') : null;

const credentials = {key: privateKey, cert: certificate};

const __dirname = path.resolve();


fs.stat('report.json', (error, stats) => {
    if(error) {
        fs.writeFile('report.json', JSON.stringify({}), (error) => {
            if(error) throw error;
            console.log("Created a new report.json file.");
        });
    } else {
        console.log("Report already exists!");
    }
});

const config = JSON.parse(
    await readFile(
      new URL('./config.json', import.meta.url)
    )
  );

const sites = config["domains"]["sites"];
const subdomains = config["domains"]["subdomains"];
const ports = config["domains"]["ports"];

var testConfigs = {};

var numAccesses = {
    "numAccesses": 0
};

console.log("Storage Modules:");
let storageModules = {};
Object.keys(config['storageModules']).forEach((moduleName) => {
    console.log(moduleName);
    import(`${__dirname}/storageModules/${moduleName}/${moduleName}_server.js`)
    .then((mod) => {
        storageModules[moduleName] = mod
    });
});


console.log("Test Modules");
let testModules = {};
Object.keys(config['testModules']).forEach((moduleName) => {
    console.log(moduleName);
    import(`${__dirname}/testModules/${moduleName}/${moduleName}_server.js`)
    .then((mod) => {
        testModules[moduleName] = mod;
    });
});


function generateUserID(IDLength = 32) {
    let possibleChars = ['0', '1'];
    let uniqueID = '';
    for (let i = 0; i < IDLength; i++) {
      let random = Math.floor(Math.random() * 2);
      uniqueID = uniqueID.concat(random);
    }
    return uniqueID;
}


const app = express();
app.use(express.json());

app.get('/storage/:storage', function (request, response) {
    console.log(request.path);
    let storage = request.params['storage'];
    response.sendFile( `${__dirname}/storageModules/${storage}/${storage}.html`);
});

app.get('/storage/client/:storage', function (request, response) {
    console.log(request.path);
    let storage = request.params['storage'];
    response.sendFile(`${__dirname}/storageModules/${storage}/${storage}_client.js`);
});

app.all('/storage/server/:storage/*', async function (request, response) {
    console.log(request.path);
    let storage = request.params['storage'];
        if (config['storageModules'][storage]['numAccessesBased'] == true) {
            testConfigs[storage] = storageModules[storage].handle(request, response, testConfigs[storage]);
        } else {
            await storageModules[storage].handle(request, response, testConfigs[storage]);
        }
});

app.all('/tests/client/:test', function(request, response) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': request.headers.origin,
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, public, immutable'
    };
    console.log(request.path);
    response.set(responseHeaders);
    let test = request.params['test'];
    response.sendFile(`${__dirname}/testModules/${test}/${test}_client.js`);
});

app.all('/tests/server/:storage/:browser/:test/:subtest/*', function(request, response) {
    let completeUrl = `${request.protocol}://${request.headers.host}${request.originalUrl}`;
    console.log(completeUrl);
    let storage = request.params['storage'];
    let browser = request.params['browser'];
    let test = request.params['test'];
    let subtest = request.params['subtest'];

	console.log(testModules);
        testModules[test].handle(request, response, storage, browser, test, subtest, testConfigs);
    
});

app.get('/tests/current/create/:storageName/:browserName/:testName/:subtestName', async function(request, response) {
    let responseHeaders = {
        'Access-Control-Allow-Origin': request.headers.origin,
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, public, immutable'
    };
    response.set(responseHeaders);
    console.log(request.path);
    let storageName = request.params['storageName'];
    let browserName = request.params['browserName'];
    let testName = request.params['testName'];
    let subtestName = request.params['subtestName'];

    // Update Global Test Config Variable
    if(!(storageName in testConfigs)) {
        testConfigs[storageName] = {};
        testConfigs[storageName]['storageConfig'] = config['storageModules'][storageName];
    }
    if(!(browserName in testConfigs[storageName])) {
        testConfigs[storageName][browserName] = {};
        testConfigs[storageName][browserName]['browserConfig'] = config["browsers"][browserName];
    }
    if (!(testName in testConfigs[storageName][browserName])) {
        testConfigs[storageName][browserName][testName] = {};
    }
    if (!(subtestName in testConfigs[storageName][browserName][testName])) {
        testConfigs[storageName][browserName][testName][subtestName] = {};
    }
    if (!('testConfig' in testConfigs[storageName][browserName][testName][subtestName])) {
        testConfigs[storageName][browserName][testName][subtestName]["testConfig"] = config["testModules"][testName][subtestName];
    }
    if (!('uniqueID' in testConfigs[storageName])) {
        testConfigs[storageName]["uniqueID"] = generateUserID();
    }
    // Temporary solution to make the tool work. Eventually we'll simply remove uniqueID generation from each subtest.
    if (!('uniqueID' in testConfigs[storageName][browserName][testName][subtestName])) {
        testConfigs[storageName][browserName][testName][subtestName]["uniqueID"] = testConfigs[storageName]["uniqueID"];
    }
    if (config['storageModules'][storageName]['numAccessesBased'] == true) {
        testConfigs[storageName]['numAccesses'] = {};
        testConfigs[storageName]['setCacheHeader'] = true;
    }
    if (config['storageModules'][storageName]['askModuleForHeaders'] == true) {
        testConfigs[storageName]["headers"] = await storageModules[storageName].handle(request, response, testConfigs[storageName], true);
    }

    console.log(JSON.stringify(testConfigs));

    // Update Report with config
    lockfile.lock('report.json', retryOptions).then(release => {
        fs.readFile('report.json', (error, data) => {
            if (error) throw error;
            var json = JSON.parse(data);
            if(!(storageName in json)) {
                json[storageName] = {};
            }
            if(!(browserName in json[storageName])) {
                json[storageName][browserName] = {};
            }
            if(!('browserConfig' in json[storageName][browserName])) {
                json[storageName][browserName]['browserConfig'] = config["browsers"][browserName];
            }
            if (!(testName in json[storageName][browserName])) {
                json[storageName][browserName][testName] = {}
            }
            if (!(subtestName in json[storageName][browserName][testName])) {
                json[storageName][browserName][testName][subtestName] = {};
            }
            if (!('testConfig' in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName]["testConfig"] = config["testModules"][testName][subtestName];
            }
            if (!('uniqueID' in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName]["uniqueID"] = testConfigs[storageName][browserName][testName][subtestName]["uniqueID"];
            }
            fs.writeFile("report.json", JSON.stringify(json), function(error){
                release();
                if (error) throw error;
                console.log('New Subtest appended to report!');
            });
    
        });
    });


    let html = `
        <html>
            <head>
            </head>
            <body>
                <h3>Create Test: <span id="testCompleted">completed</span></h3>
            </body>
        </html>
    `;

    // Respond once successful.
    response.send(html);
});

var server = https.createServer(credentials, app);
server.listen(process.env.PORT);

var httpServer = http.createServer(credentials, app);
httpServer.listen(80);

// Additional 32 ports (3000-3031)
var httpsServers = []

for (let i = 0; i <= 32; i++) {
  httpsServers[i] = https.createServer(credentials, app);
  httpsServers[i].listen(3000+i);
}