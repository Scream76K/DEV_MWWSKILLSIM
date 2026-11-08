'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
function runFreshCase({harness,key,runId,outputDir,timeout=60000,executable=process.execPath}){
 const file=path.join(outputDir,'gl-affinity-'+key.replaceAll(':','-')+'.json');
 // Caller owns this isolated output directory. A seeded/stale result cannot survive a failed launch.
 fs.rmSync(file,{force:true});
 const p=spawnSync(executable,[harness,'case',key,runId,outputDir],{encoding:'utf8',timeout,maxBuffer:4*1024*1024});
 assert.equal(p.error,undefined,'CHILD_PROCESS_ERROR: '+String(p.error));
 assert.equal(p.signal,null,'CHILD_SIGNAL: '+p.signal);
 assert.equal(p.status,0,'CHILD_EXIT: '+p.status+' '+p.stderr);
 assert.ok(fs.existsSync(file),'CURRENT_OUTPUT_MISSING');
 const report=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(report.runId,runId,'RUN_ID_MISMATCH');
 assert.equal(report.key,key,'CASE_KEY_MISMATCH');
 assert.equal(report.status,'COLLECTED','COLLECTION_INCOMPLETE: '+report.reason);
 return {report,processExitCode:p.status,outputFile:file};
}
module.exports={runFreshCase};
