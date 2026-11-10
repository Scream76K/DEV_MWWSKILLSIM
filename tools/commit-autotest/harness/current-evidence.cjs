'use strict';
const fs=require('node:fs'),path=require('node:path');
function currentProvenance(){const p=path.join(__dirname,'run-provenance.json');if(fs.existsSync(p))return JSON.parse(fs.readFileSync(p));return {sourceCommit:'5f1f733fc00c770073704c699ea7c2641a8bc9fb',sourceKind:'bundled-baseline',classification:{evidenceSourceCommit:'5f1f733fc00c770073704c699ea7c2641a8bc9fb'}};}
function selectCurrentCases(scan,jobs,commit){
 if(!scan||!scan.runId||!Array.isArray(scan.cases))throw Error('CURRENT_SCAN_REQUIRED');
 if(scan.sourceCommit!==commit)throw Error('CURRENT_SCAN_COMMIT_MISMATCH');
 return jobs.map(job=>{const source=scan.cases.find(c=>c.key===job.sourceV5Case);if(!source)throw Error('CURRENT_SCAN_CASE_MISSING: '+job.sourceV5Case);return source;});
}
module.exports={currentProvenance,selectCurrentCases};
