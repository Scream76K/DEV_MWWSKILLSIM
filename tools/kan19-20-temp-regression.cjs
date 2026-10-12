'use strict';
// Copies source before invoking suites so generated audits cannot alter original evidence.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const crypto=require('node:crypto');
function hashes(root){const out={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git'||e.name==='node_modules')continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())out[path.relative(root,p)]=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}}walk(root);return out;}
const source=path.resolve(__dirname,'..'),before=hashes(source),dest=fs.mkdtempSync('/private/tmp/kan19-20-regression-');
fs.cpSync(source,dest,{recursive:true,filter:p=>!['.git','node_modules'].includes(path.basename(p))});
fs.symlinkSync(path.join(source,'node_modules'),path.join(dest,'node_modules'),'dir');
console.log(JSON.stringify({source,copy:dest,node:process.execPath,UI_PHASE:'after'}));
for(const [name,dir,pattern] of [['node','tests',/\.test\.cjs$/],['dom','tools',/dom\.test\.cjs$/],['browser','tools',/browser\.test\.cjs$/],['smoke','tools',/^r249-integration-smoke\.test\.cjs$/],['legacy','.',/\.test\.js$/],['template','tools',/^r249-template-gates\.test\.cjs$/]]){
 const files=fs.readdirSync(path.join(dest,dir)).filter(f=>pattern.test(f)).map(f=>path.join(dir,f));const log=path.join(dest,`${name}.log`);const fd=fs.openSync(log,'w');const r=cp.spawnSync(process.execPath,['--test',...files],{cwd:dest,env:{...process.env,UI_PHASE:'after'},stdio:['ignore',fd,fd]});fs.closeSync(fd);console.log(JSON.stringify({suite:name,files:files.length,exit:r.status,signal:r.signal,log}));if(r.error)console.error(r.error.message);
}

const after=hashes(source),changed=Object.keys(before).filter(p=>before[p]!==after[p]);fs.writeFileSync(path.join(dest,'original-preservation.json'),JSON.stringify({source,copy:dest,checked:Object.keys(before).length,changed,added:Object.keys(after).filter(p=>!(p in before))},null,2));console.log(JSON.stringify({preservation:path.join(dest,'original-preservation.json'),checked:Object.keys(before).length,changed}));
