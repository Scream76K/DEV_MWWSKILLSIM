'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),net=require('node:net');
const status=fs.readFileSync('/proc/self/status','utf8');
const report={environment:'LINUX_ISOLATED_PROCESS_NOT_MAC_HOST_VALIDATION',platform:process.platform,architecture:process.arch,nodeVersion:process.version,productCodeExecuted:false};
report.namespaces=Object.fromEntries(['net','mnt','pid','user'].map(k=>[k,fs.readlinkSync('/proc/self/ns/'+k)]));
assert.notEqual(report.namespaces.net,process.env.HOST_NET_NS,'network namespace must differ from host');
assert.notEqual(report.namespaces.mnt,process.env.HOST_MNT_NS,'mount namespace must differ from host');
assert.equal(/^CapEff:\s+0+$/m.test(status),true,'capabilities must be dropped');
assert.equal(/^NoNewPrivs:\s+1$/m.test(status),true,'no-new-privileges required');
report.capabilitiesDropped=true;report.noNewPrivileges=true;
for(const path of ['/input/isolation-write-probe','/harness/isolation-write-probe','/dependencies/isolation-write-probe','/reference/isolation-write-probe','/outside-write-probe']){
 let code=null;try{fs.writeFileSync(path,'must-not-write');}catch(e){code=e.code;}
 assert.equal(code,'EROFS',path+' must be read-only');
}
assert.equal(fs.existsSync('/workspace'),false,'host workspace must not be visible');
assert.equal(fs.existsSync('/home/agent'),false,'host home must not be visible');
report.inputsReadOnly=true;report.hostWorkspaceNotMounted=true;
fs.writeFileSync('/output/isolation-output-probe.txt','isolated output is writable\n');
report.outputWritable=true;
const socket=net.connect({host:'203.0.113.1',port:443});
const timer=setTimeout(()=>{socket.destroy();throw Error('Network probe timed out; expected OS-level network denial');},1500);
socket.on('connect',()=>{clearTimeout(timer);socket.destroy();throw Error('Network unexpectedly connected');});
socket.on('error',error=>{clearTimeout(timer);assert.ok(['ENETUNREACH','EHOSTUNREACH','EACCES','EPERM'].includes(error.code),error.code);report.networkDeniedByOS=error.code;report.result='ISOLATION_PROBE_PASS_NOT_PRODUCT_TEST';fs.writeFileSync('/output/isolation-preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));});
