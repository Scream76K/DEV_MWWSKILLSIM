'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {stageDefinitions,summarize,japanese,names}=require('./batch-summary.cjs');
const runId=crypto.randomUUID(),startedAt=new Date().toISOString(),runs=[],reports={};
const read=file=>JSON.parse(fs.readFileSync('/output/'+file));
const preflight=read('isolation-preflight.json');
if(preflight.result!=='ISOLATION_PROBE_PASS_NOT_PRODUCT_TEST')throw Error('OS isolation preflight required');
const expected=JSON.parse(fs.readFileSync('/harness/expected-inputs.json'));
const integrity=()=>{const mismatches=[];for(const e of expected){try{if(crypto.createHash('sha256').update(fs.readFileSync('/input/'+e.path)).digest('hex')!==e.sha256)mismatches.push(e.path)}catch(error){mismatches.push(e.path+': '+error.message)}}return {checked:expected.length,unchanged:mismatches.length===0,mismatches}};
let inputIntegrity=integrity();if(!inputIntegrity.unchanged)throw Error('Fixed inputs changed; refusing product execution');
function save(finishedAt){
 const result=summarize({runId,startedAt,finishedAt,runs,reports,inputIntegrity,environment:preflight});
 result.provenance=require('./current-evidence.cjs').currentProvenance();result.sourceCommit=result.provenance.sourceCommit;
 fs.writeFileSync('/output/all-cases.json',JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync('/output/日本語サマリー.txt',japanese(result));return result;
}
save();
for(const [file,resultFile,label] of stageDefinitions){
 const run={file,resultFile,label,startedAt:new Date().toISOString(),exitCode:null,error:null};
 console.log(`開始: ${label}`);
 const log=fs.openSync('/output/'+file+'.process.log','w');
 if(file==='uncalculated-diagnostics.cjs'&&!reports['skill-scan.json']){
  run.skipped=true;run.error='今回のスキル全件結果がないため原因分類を実行しません。';fs.writeSync(log,run.error+'\n');
 }else{
  const child=spawnSync(process.execPath,['/harness/'+file],{env:{...process.env,REQUIRE_CURRENT_SCAN:'1'},stdio:['ignore',log,log],timeout:1800000});
  run.exitCode=child.status;run.signal=child.signal;run.error=child.error?.message||null;
  try{reports[resultFile]=read(resultFile)}catch(error){run.error=[run.error,'今回の結果読込失敗: '+error.message].filter(Boolean).join('; ')}
  if(file==='charge-master.cjs')try{reports['skill-conditions.json']=read('skill-conditions.json')}catch(error){run.error=[run.error,'大剣条件結果読込失敗: '+error.message].filter(Boolean).join('; ')}
 }
 fs.closeSync(log);run.finishedAt=new Date().toISOString();runs.push(run);save();console.log(`終了: ${label} / code=${run.exitCode}${run.error?' / '+run.error:''}`);
}
inputIntegrity=integrity();
const clean=x=>String(x??'').replaceAll('\t',' ').replaceAll('\r',' ').replaceAll('\n',' ');
const rows=[['武器種','スキルID','スキル','Lv','判定','通常値','最大値','理由']];
const statusJa={CALCULATED_ACCURACY_AND_APPLICABILITY_UNVERIFIED:'数値取得・正当性未検証',PRODUCT_UNAVAILABLE_OR_INCOMPLETE:'未算出',NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE:'明示武器条件による対象外',INPUT_SKILL_NOT_ESTABLISHED:'入力スキル成立未確認',EQUIPMENT_CONDITION_UNRESOLVED:'装備条件不足',HARNESS_FAILURE:'ハーネス異常'};
for(const c of reports['skill-scan.json']?.cases||[])rows.push([names[c.kind]||c.kind,c.skillId,c.name,c.level,statusJa[c.status]||c.status,c.channels?.normal?.value,c.channels?.maximum?.value,c.reason||c.applicabilityReason||'']);
fs.writeFileSync('/output/skill-results.tsv',rows.map(row=>row.map(clean).join('\t')).join('\n')+'\n');
const result=save(new Date().toISOString());console.log(japanese(result));process.exitCode=result.exitCode;
