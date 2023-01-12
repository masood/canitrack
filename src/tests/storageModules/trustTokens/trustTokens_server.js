import path from 'path';
import * as childProcess from "child_process";
import * as util from "util";


const exec = util.promisify(childProcess.exec);

const __dirname = path.resolve();

function execShellCommand(cmd) {
    const exec = childProcess.exec;
    return new Promise((resolve, reject) => {
     exec(cmd, (error, stdout, stderr) => {
      if (error) {
       console.warn(error);
      }
      resolve(stdout? stdout : stderr);
     });
    });
}

async function handleIssuance(req, resp){
    let responseHeaders = {
        'Access-Control-Allow-Origin': (req.headers.referer ? new URL(req.headers.referer).origin: req.headers.origin),
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Cache-Control': 'max-age=31536000, private, immutable'
    };
    resp.set(responseHeaders);
    console.log(req.path);
    let sec_trust_token = req.headers["sec-trust-token"];
    console.log({ sec_trust_token });
    console.log(`${__dirname}`)
    // let changeDir = await execShellCommand(`cd ./storageModules/trustTokens`);
    // let result = await execShellCommand(`./bin/main --issue ${sec_trust_token}`);
    // changeDir = execShellCommand(`cd ../../`);
    let result = await exec(`./bin/main --issue ${sec_trust_token}`, { cwd: './storageModules/trustTokens'});
    console.log(result);
    let token = result.stdout;
    resp.append("sec-trust-token", token);
    resp.send();
}

let handle = async function(req, resp) {
    if (req.url.includes("/issuance")) {
        await handleIssuance(req, resp);
    }
}

export {handle};