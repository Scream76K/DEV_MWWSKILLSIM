'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const runs=[];
for(const file of ['uncalculated-diagnostics.cjs','resistance-conditions.cjs','skill-conditions.cjs','gs-smoke.cjs']){
 const r=spawnSync(process.execPath,['/harness/'+file],{encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024});fs.writeFileSync('/output/v8-'+file+'.process.log',(r.stdout||'')+(r.stderr||''));runs.push({file,exitCode:r.status,error:r.error?.message||null});console.log(JSON.stringify(runs.at(-1)));
}
const read=name=>JSON.parse(fs.readFileSync('/output/'+name+'.json')),resistance=read('resistance-conditions'),gs=read('gs-smoke'),oracle=read('skill-conditions'),diagnostics=read('uncalculated-diagnostics');
const result={status:'PARTIAL_WITH_EXISTING_FAILURES',runs,resistance:resistance.counts,sourceFormulaComparison:oracle.independentExpectedComparison,gsIndependentComparison:gs.independentExpectedDamage,retainedGsFailures:gs.knownFailures,uncalculatedAttributions:diagnostics.attributionCounts,uncalculatedCases:diagnostics.uniqueCaseCount,wideScanReexecuted:false,priorWideScanRetained:diagnostics.sourceRunId,macTested:false,gameAccuracyVerified:false,tenShotNormalAmmoImplemented:false};
fs.writeFileSync('/output/v8-targeted.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,resistance:result.resistance,sourceFormula:result.sourceFormulaComparison.status,gsFailures:result.retainedGsFailures?.length,wideScanReexecuted:false}));process.exitCode=2;
