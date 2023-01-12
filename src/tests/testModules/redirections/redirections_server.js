import * as fs from 'fs';
import { readFile } from 'fs/promises';
import * as lockfile from 'proper-lockfile';

// const testModule = "storageIsolation";

const config = JSON.parse(
    await readFile(
      new URL('../../config.json', import.meta.url)
    )
  );

const sites = config["domains"]["sites"];
const subdomains = config["domains"]["subdomains"];
const ports = config["domains"]["ports"];

const retryOptions = {
    retries: {
        retries: 5,
        factor: 3,
        minTimeout: 1 * 1000,
        maxTimeout: 60 * 1000,
        randomize: true,
    }
};

function configToDomain(domainLevel, domainIndex, forRedirectionDomainList = false) {
    if (domainLevel == 'site') {
        return sites[domainIndex];
    } else if (domainLevel == 'subdomain') {
        return subdomains[domainIndex];
    } else if (domainLevel == 'port') {
        return ports[domainIndex];
    }
}

function createiFrame(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID) {
    let operation = '';
    if (request.path.split('/')[-1] == 'write') {
        operation = 'write';
    } else {
        operation = 'read';
    }

    //redirections list for redirection tests
    let redirectionLevel = testConfig[operation]["redirectionLevel"];
    let redirectionDomainList = [];
    testConfig[operation]["redirectionIndices"].forEach(domainIndex => {
        redirectionDomainList.push(configToDomain(redirectionLevel, domainIndex, true));
    });


    // domain list for needsDomain
    let domainLevel = testConfig[operation]["iFrame"]["domainLevel"];
    let domainIndex = testConfig[operation]["iFrame"]["domainIndex"];
    let bitsPerVisit = storageConfig["bitsPerVisit"];
    let domainList = [];
    for (let i = domainIndex; i < domainIndex + bitsPerVisit; i++) {
        domainList.push(configToDomain(domainLevel, i));
    }
    let html = `
    <html>
        <head>
            <script>
                const sites = ${"['" + sites.join("','") + "']"};
                const subdomains = ${"['" + subdomains.join("','") + "']"};
                const ports = ${"['" + ports.join("','") + "']"};
                const redirectionDomainList = ${"['" + redirectionDomainList.join("','") + "']"};
                const storageModule = '${storageName}';
                const browserName = '${browserName}';
                const testModule = '${testName}';
                const subtestName = '${subtestName}';
                const uniqueID = '${uniqueID}';
                const bitsPerVisit = ${storageConfig["bitsPerVisit"]};
                const needsDomains = ${storageConfig["needsDomains"]};
                const numAccessesBased = ${storageConfig["numAccessesBased"]};
                const domainList = ${"['" + domainList.join("','") + "']"};
            </script>
            <script src="/storage/client/${storageName}"></script>
            <script src="/tests/client/${testName}" defer></script>
        </head>
        <body>
        </body>
    </html>
    `;
    response.send(html);
}

function write(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID) {

    if (testConfig['write']['iFrame'] != null) {
        let iFrameDomainLevel = testConfig['write']['iFrame']['domainLevel'];
        let iFrameDomainIndex = testConfig['write']['iFrame']['domainIndex'];
        let iFrameDomain = configToDomain(iFrameDomainLevel, iFrameDomainIndex);
        let html = `
            <html>
                <head>
                <script>
                    window.addEventListener("message", (event) => {
                        if (event.data == "secret computed"){
                            let testCompletedElement = document.createElement("span");
                            testCompletedElement.setAttribute('id', 'testCompleted');
                            testCompletedElement.innerText = "completed";
                            document.body.appendChild(testCompletedElement);
                        }
                    }, false);
                </script>
                </head>
                <body>
                    <iframe src="https://${iFrameDomain}/tests/server/${storageName}/${browserName}/${testName}/${subtestName}/iFrame/write"></iframe>
                </body>
            </html>
            `
        response.send(html);

    }   else {

        let redirectionLevel = testConfig["write"]["redirectionLevel"];
        let redirectionDomainList = [];
        testConfig["write"]["redirectionIndices"].forEach(domainIndex => {
            redirectionDomainList.push(configToDomain(redirectionLevel, domainIndex, true));
        });

        let domainLevel = testConfig["write"]["topLevel"]["domainLevel"];
        let domainIndex = testConfig["write"]["topLevel"]["domainIndex"];
        let bitsPerVisit = storageConfig["bitsPerVisit"];
        let domainList = [];
        for (let i = domainIndex; i < domainIndex + bitsPerVisit; i++) {
            domainList.push(configToDomain(domainLevel, i));
        }
        let html = `
            <html>
                <head>
                    <script>
                        const sites = ${"['" + sites.join("','") + "']"};
                        const subdomains = ${"['" + subdomains.join("','") + "']"};
                        const ports = ${"['" + ports.join("','") + "']"};
                        const redirectionDomainList = ${"['" + redirectionDomainList.join("','") + "']"};
                        const storageModule = '${storageName}';
                        const browserName = '${browserName}';
                        const testModule = '${testName}';
                        const subtestName = '${subtestName}';
                        const uniqueID = '${uniqueID}';
                        const bitsPerVisit = ${storageConfig["bitsPerVisit"]};
                        const needsDomains = ${storageConfig["needsDomains"]};
                        const numAccessesBased = ${storageConfig["numAccessesBased"]};
                        const domainList = ${"['" + domainList.join("','") + "']"};
                    </script>
                    <script>
                        window.addEventListener("message", (event) => {
                            if (event.data == "secret computed"){
                                let testCompletedElement = document.createElement("span");
                                testCompletedElement.setAttribute('id', 'testCompleted');
                                testCompletedElement.innerText = "completed";
                                document.body.appendChild(testCompletedElement);
                            }
                        }, false);
                    </script>
                    <script src="/storage/client/${storageName}"></script>
                    <script src="/tests/client/${testName}" defer></script>
                </head>
                <body>
                </body>
            </html>
            `;
        response.send(html);
    }
}

function read(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID) {

    if (testConfig['read']['iFrame'] != null) {
        let iFrameDomainLevel = testConfig['read']['iFrame']['domainLevel'];
        let iFrameDomainIndex = testConfig['read']['iFrame']['domainIndex'];
        let iFrameDomain = configToDomain(iFrameDomainLevel, iFrameDomainIndex);
        let protocol = "https";
        if (storageName === 'hsts') {
            protocol = "http";
        }
        let html = `
            <html>
                <head>
                <script>
                    window.addEventListener("message", (event) => {
                        if (event.data == "secret computed"){
                            let testCompletedElement = document.createElement("span");
                            testCompletedElement.setAttribute('id', 'testCompleted');
                            testCompletedElement.innerText = "completed";
                            document.body.appendChild(testCompletedElement);
                        }
                    }, false);
                </script>
                </head>
                <body>
                    <iframe src="${protocol}://${iFrameDomain}/tests/server/${storageName}/${browserName}/${testName}/${subtestName}/iFrame/read"></iframe>
                </body>
            </html>
            `;
        response.send(html);

    }   else {
        let redirectionLevel = testConfig["read"]["redirectionLevel"];
        let redirectionDomainList = [];
        testConfig["read"]["redirectionIndices"].forEach(domainIndex => {
            redirectionDomainList.push(configToDomain(redirectionLevel, domainIndex, true));
        });

        let domainLevel = testConfig["read"]["topLevel"]["domainLevel"];
        let domainIndex = testConfig["read"]["topLevel"]["domainIndex"];
        let bitsPerVisit = storageConfig["bitsPerVisit"];
        let domainList = [];
        for (let i = domainIndex; i < domainIndex + bitsPerVisit; i++) {
            domainList.push(configToDomain(domainLevel, i));
        }
        let html = `
            <html>
                <head>
                    <script>
                        const sites = ${"['" + sites.join("','") + "']"};
                        const subdomains = ${"['" + subdomains.join("','") + "']"};
                        const ports = ${"['" + ports.join("','") + "']"};
                        const redirectionDomainList = ${"['" + redirectionDomainList.join("','") + "']"};
                        const storageModule = '${storageName}';
                        const browserName = '${browserName}';
                        const testModule = '${testName}';
                        const subtestName = '${subtestName}';
                        const uniqueID = '${uniqueID}';
                        const bitsPerVisit = '${storageConfig["bitsPerVisit"]}';
                        const needsDomains = ${storageConfig["needsDomains"]};
                        const numAccessesBased = ${storageConfig["numAccessesBased"]};
                        const domainList = ${"['" + domainList.join("','") + "']"};
                    </script>
                    <script>
                        window.addEventListener("message", (event) => {
                            if (event.data == "secret computed"){
                                let testCompletedElement = document.createElement("span");
                                testCompletedElement.setAttribute('id', 'testCompleted');
                                testCompletedElement.innerText = "completed";
                                document.body.appendChild(testCompletedElement);
                            }
                        }, false);
                    </script>
                    <script src="/storage/client/${storageName}"></script>
                    <script src="/tests/client/${testName}" defer></script>
                </head>
                <body>
                </body>
            </html>
            `;
        response.send(html);
    }

}

function writeResult(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID) {
    let requestHost = request.headers.host;

    lockfile.lock('report.json', retryOptions).then(release => {
        fs.readFile('report.json', function (error, data) {
            if (error) throw error;
            var json = JSON.parse(data);
            if (!(`${requestHost}` in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName][requestHost] = {};
            }
            json[storageName][browserName][testName][subtestName][requestHost]['writeResult'] = request.body.secret; 
            if (!('writeResult' in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName]['writeResult'] = "";
            }
            json[storageName][browserName][testName][subtestName]['writeResult'] += request.body.secret;    
            fs.writeFile("report.json", JSON.stringify(json), function(error){
                release();
                if (error) throw error;
                console.log(`The writeResult: ${request.body.secret} was appended to file!`);
            });
        });
        response.send("Awesome");
    });
}

function readResult(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID) {
    let requestHost = request.headers.host;

    lockfile.lock('report.json', retryOptions).then(release => {
        fs.readFile('report.json', function (error, data) {
            if (error) throw error;
            var json = JSON.parse(data);
            if (!(`${requestHost}` in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName][requestHost] = {};
            }
            json[storageName][browserName][testName][subtestName][requestHost]['readResult'] = request.body.secret; 
            if (!('readResult' in json[storageName][browserName][testName][subtestName])) {
                json[storageName][browserName][testName][subtestName]['readResult'] = "";
            }
            json[storageName][browserName][testName][subtestName]['readResult'] += request.body.secret;    
            fs.writeFile("report.json", JSON.stringify(json), function(error){
                release();
                if (error) throw error;
                console.log(`The readResult: ${request.body.secret} was appended to file!`);
            });
        });
        response.send("Awesome");
    });
}

let handle = function(request, response, storage, browser, test, subtest, testConfigs) {



    let storageName = storage;
    let browserName = browser;
    let testName = test;
    let subtestName = subtest;
    let storageConfig = testConfigs[storageName]["storageConfig"];
    let testConfig = testConfigs[storageName][browserName][testName][subtestName]["testConfig"];
    let uniqueID = testConfigs[storageName][browserName][testName][subtestName]["uniqueID"];

    var responseHeaders = {}

    if('headers' in testConfigs[storageName]){
        console.log("Headers in testConfigs")
        let splitPath = request.path.split('/')
        if (splitPath[splitPath.length-1] == 'write') {
            console.log("Path Split is Write");
            responseHeaders = testConfigs[storageName]['headers']['writeHeaders'];
        } else {
            console.log("Path Split is Read");
            responseHeaders = testConfigs[storageName]['headers']['readHeaders'];
        }
    } else {
        responseHeaders = {
            'Access-Control-Allow-Origin': request.headers.origin,
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
            'Cache-Control': 'max-age=31536000, public, immutable'
        };
    }
    response.set(responseHeaders);


    if (request.url.includes("/iFrame/") && request.method == 'GET') {
        createiFrame(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID);
    }
    else if (request.url.includes("/write") && request.method == 'GET') {
        write(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID);
    }
    else if (request.url.includes("/writeResult") && request.method == 'POST') {
        writeResult(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID);
    }
    else if (request.url.includes("/read") && request.method == 'GET') {
        read(request, response, storageName, browserName, testName, subtestName, testConfig, storageConfig, uniqueID);
    }
    else if (request.url.includes("/readResult") && request.method == 'POST') {
        readResult(request, response, storageName, browserName, testName, subtestName, testConfig, uniqueID);
    }
}

export {handle};