import * as fs from 'fs';
import { readFile } from 'fs/promises';

const config = JSON.parse(
    await readFile(
      new URL('./config.json', import.meta.url)
    )
  );

const sites = config["domains"]["sites"];
const subdomains = config["domains"]["subdomains"];
const ports = config["domains"]["ports"];


var browserDirs = fs.readdirSync('../../reports/');
browserDirs.forEach(browserDir => {
    var reportFiles = fs.readdirSync(`../../reports/${browserDir}/`);
    reportFiles.forEach(reportFile => {
        let report = JSON.parse(
            fs.readFileSync(
              new URL(`../../reports/${browserDir}/${reportFile}`, import.meta.url)
            )
          );
        
        let storageModules = [];
        
        Object.keys(report).forEach(function(key) {
            storageModules.push(key);
        });
        let interpretedReport = interpretReport(storageModules, report);
        fs.writeFile(`../../interpreted-reports/${browserDir}/${reportFile}`, JSON.stringify(interpretedReport), function(error){
            if (error) throw error;
            console.log('The interpreted report was appended to file!');
        });
    
    });
});

function configToDomain(domainLevel, domainIndex) {
    if (domainLevel == 'site') {
        return sites[domainIndex];
    } else if (domainLevel == 'subdomain') {
        return subdomains[domainIndex];
    } else if (domainLevel == 'port') {
        return `https://${sites[0]}:${ports[domainIndex]}`;
    }
}

function storageIsolationSubtests(subtestName, subtestReport, interpretedSubtestReport) {
    
    if (subtestName == "site-1P") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Overall']['Track in First-party Contexts'] = true;
            interpretedSubtestReport['First-party Tracking']['Track in First-party Top-level Contexts?'] = true;
        } else {
            interpretedSubtestReport['Overall']['Track in First-party Contexts'] = false;
            interpretedSubtestReport['First-party Tracking']['Track in First-party Top-level Contexts?'] = false;
        }
    }

    if (subtestName == "privacyTestsOrg-1P") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['First-party Tracking']['Track in First-party iFrames?'] = true;
        } else {
            interpretedSubtestReport['First-party Tracking']['Track in First-party iFrames?'] = false;
        }
    }

    if (subtestName == "privacyTestsOrg-3P") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Overall']['Track in Third-party Contexts'] = true;
        } else {
            interpretedSubtestReport['Overall']['Track in Third-party Contexts'] = false;
        }
    }

    if (subtestName == "numKeys-keyed") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] = true;
        } else {
            interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] = false;
        }
    }

    if (subtestName == "numKeys-frameKeyed") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Third-party Tracking']['Track From Different Third-party iFrames in the Same Top-Level Context?'] = true;
            if (interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] == false) {

                interpretedSubtestReport['Partitioning Key']['Number of Elements in Paritioning Key'] = 1;

                interpretedSubtestReport['Partitioning Key']['Key Composition'][0] = {
                        frameLevel : 'Top-Level'
                    };
            }
        } else {
            interpretedSubtestReport['Third-party Tracking']['Track From Different Third-party iFrames in the Same Top-Level Context?'] = false;

            if (interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] == false) {
                
                
                interpretedSubtestReport['Partitioning Key']['Number of Elements in Paritioning Key'] = 1;
                interpretedSubtestReport['Partitioning Key']['Key Composition'][0] = {
                        frameLevel : 'iFrame'
                    };
            }
        }
    }

    if (subtestName == "numKeys-doubleKeyed") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Third-party Tracking']['Track While Embedded in Different Third-party Contexts?'] = true;
            if (interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] == false) {

                interpretedSubtestReport['Partitioning Key']['Number of Elements in Paritioning Key'] = 1;

                interpretedSubtestReport['Partitioning Key']['Key Composition'][0] = {
                    frameLevel : 'iFrame'
                };
            }
        } else {
            interpretedSubtestReport['Third-party Tracking']['Track While Embedded in Different Third-party Contexts?'] = false;

            if (interpretedSubtestReport['Third-party Tracking']['Track Across Third-party Sites?'] == false  && interpretedSubtestReport['Partitioning Key']['Number of Elements in Paritioning Key'] == 1 && interpretedSubtestReport['Partitioning Key']['Key Composition'][0]['frameLevel'] == 'iFrame') {
                
                interpretedSubtestReport['Partitioning Key']['Number of Elements in Paritioning Key'] = 2;

                interpretedSubtestReport['Partitioning Key']['Key Composition'][1] = {
                    frameLevel : 'Top-Level'
                };
            }
        } 
    }

    if (subtestName == "keyLevel-TLCheck") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['First-party Tracking']["Track Across First-party Subdomains?"] = true;
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'Top-Level') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Site (eTLD+1)';
                }
            }

        } else {
            interpretedSubtestReport['First-party Tracking']["Track Across First-party Subdomains?"] = false;
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'Top-Level') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Origin (Subdomain)';
                }
            }

        } 
    }

    if (subtestName == "keyLevel-frameCheck") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'iFrame') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Site (eTLD+1)';
                }
            }

        } else {
            
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'iFrame') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Origin (Subdomain)';
                }
            }

        } 
    }

    if (subtestName == "keyLevel-doubleKeyCheck") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {          
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'Top-Level') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Site (eTLD+1)';
                }
            }

        } else {
            for (let i = 0; i < interpretedSubtestReport['Partitioning Key']['Key Composition'].length; i++) {
                if (interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['frameLevel'] == 'Top-Level') {
                    interpretedSubtestReport['Partitioning Key']['Key Composition'][i]['domainLevel'] = 'Origin (Subdomain)';
                }
            }

        } 
    }
    
    if (subtestName == "site-1P-clearBrowserData") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Overall']['Track Despite Clearing Browsing Data'] = true;
        } else {
            interpretedSubtestReport['Overall']['Track Despite Clearing Browsing Data'] = false;
        }
    }

    if (subtestName == "site-1P-fromPrivate" || subtestName == "site-1P-toPrivate" || subtestName ==  "site-1P-withinPrivate") {
        if (subtestReport["readResult"] && (subtestReport["uniqueID"] == subtestReport["readResult"])) {
            interpretedSubtestReport['Overall']['Track Into or From Private Browsing Mode'] = true;
        } else if (interpretedSubtestReport['Overall']['Track Into or From Private Browsing Mode'] !== true){
            interpretedSubtestReport['Overall']['Track Into or From Private Browsing Mode'] = false;
        }
    }

    return interpretedSubtestReport;
}

function interpretReport(storageModules, report) {
    let interpretedReport = {};
    for (let i = 0; i < storageModules.length; i++ ) {
        let storageModule = storageModules[i];
        
        interpretedReport[storageModule] = {};

        let browsers = [];
        Object.keys(report[storageModule]).forEach(function(key) {
            browsers.push(key);
        });

        for (let j = 0; j < browsers.length; j++) {
            let browserName = browsers[j];
            // let browserConfig = browsers[j]['browserConfig'];

            interpretedReport[storageModule][browserName] = {};
            // interpretedReport[storageModule][browserName]['browserConfig'] = browserConfig;

            let testModules = [];
            Object.keys(report[storageModule][browserName]).forEach(function(key) {
                if (key != 'browserConfig') {
                    testModules.push(key);
                }
            });


            for (let k = 0; k < testModules.length; k++) {
                let testModule = testModules[k];

                

                let allModules = ["site-1P", "privacyTestsOrg-1P", "privacyTestsOrg-3P", "numKeys-keyed", "numKeys-frameKeyed", "numKeys-doubleKeyed", "keyLevel-TLCheck", "keyLevel-frameCheck", "keyLevel-doubleKeyCheck", "site-1P-clearBrowserData", "site-1P-fromPrivate", "site-1P-toPrivate", "site-1P-withinPrivate"];

                let subtestModules = [];
                
                allModules.forEach(mod => {
                    if (report[storageModule][browserName][testModule][mod]) {
                        subtestModules.push(mod);
                    }
                })

                if (testModule === 'redirections') {
                    let redirectResults = {
                        "Can be implemented using redirects?": false,
                        "Number of redirects to write a 32 bit identifier": null //32 / config['storageModules'][storageModule]['bitsPerVisit']
                    };
                    let subtestReport = report[storageModule][browserName][testModule];
                    if (subtestReport['port-TopLevel']['uniqueID'] === subtestReport['port-TopLevel']['readResult']) {
                        redirectResults['Can be implemented using redirects?'] = true;
                        redirectResults['Number of redirects to write a 32 bit identifier'] = 32 / config['storageModules'][storageModule]['bitsPerVisit'];
                    }
                    interpretedReport[storageModule][browserName]['Redirections'] = redirectResults;
                    continue;
                }

                interpretedReport[storageModule][browserName][testModule] = {};
                
                let interpretedSubtestReport = {
                    "Overall": {
                        "Track in First-party Contexts": null,
                        "Track in Third-party Contexts": null,
                        "Redirections": null,
                        "Track Into or From Private Browsing Mode": null,
                        "Track Despite Clearing Browsing Data": null
                    },
                    "First-party Tracking": {
                        "Track in First-party Top-level Contexts?": null,
                        "Track in First-party iFrames?": null,
                        "Track Across First-party Subdomains?" : null
                    },
                    "Third-party Tracking": {
                        "Track Across Third-party Sites?": null,
                        "Track While Embedded in Different Third-party Contexts?": null,
                        "Track From Different Third-party iFrames in the Same Top-Level Context?": null
                    },
                    "Partitioning Key": {
                        "Number of Elements in Paritioning Key": 1,
                        "Key Composition": [
                            {
                                "frameLevel": "iFrame",
                                "domainLevel": "Site (eTLD+1)"
                            }
                        ]
                    }
                };

                for (let l = 0; l < subtestModules.length; l++) {

                    let subtestModule = subtestModules[l];

                    console.log(`storageModule: ${storageModule}, browser: ${browserName}, testModule: ${testModule}, subtestModule: ${subtestModule}`);


                    let subtestReport = report[storageModule][browserName][testModule][subtestModule];

                    interpretedSubtestReport = storageIsolationSubtests(subtestModule, subtestReport, interpretedSubtestReport);
 
                }

                interpretedReport[storageModule][browserName] = interpretedSubtestReport;

            }
        }

    }
    return interpretedReport;
}