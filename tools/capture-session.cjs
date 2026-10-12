'use strict';
const fs=require('node:fs');
const path=require('node:path');
const manifestPath=path.join(__dirname,'..','R121_CAPTURE_MANIFEST.json');
const allowed=new Set(['NOT_CAPTURED','CAPTURED','REVIEWED','NEEDS_RETAKE']);
function createSession(manifest){
 if(!manifest||!Array.isArray(manifest.entries)||manifest.entries.length!==14)throw Error('14 weapons required');
 const ids=new Set();
 const shots=[];
 for(const e of manifest.entries){
  if(!e.id||ids.has(e.id))throw Error('duplicate or missing weapon ID');
  ids.add(e.id);
  const variants=e.id==='heavy-bowgun'?[['A','両スキルなし'],['B','ファーストショットのみ'],['C','フォースショットのみ']]:[['A','基準映像']];
  for(const [variant,condition] of variants)shots.push({id:`${e.id}_${variant}`,weapon:e.id,weaponName:e.name,subject:e.subject,condition,filename:`r125_${e.id}_${variant}.mp4`,status:'NOT_CAPTURED',equipmentEvidence:null,hitEvidence:null,timingEvidence:null,notes:''});
 }
 return {schemaVersion:1,gameVersion:manifest.gameVersion,sourceManifest:'R121_CAPTURE_MANIFEST.json',verification:'UNVERIFIED',shots};
}
function validateSession(session){
 if(!session||session.schemaVersion!==1||!Array.isArray(session.shots))throw Error('invalid session');
 const ids=new Set();
 for(const s of session.shots){
  if(!s.id||ids.has(s.id)||!allowed.has(s.status))throw Error('invalid shot ID/status');
  ids.add(s.id);
  if(s.status==='REVIEWED'&&(!s.equipmentEvidence||!s.hitEvidence||!s.timingEvidence))throw Error(`reviewed shot missing evidence: ${s.id}`);
 }
 return true;
}
function renderCaptureStatus(session){
 validateSession(session);
 const lines=['# 撮影受領・検証管理（r142）','',`ゲームVer: ${session.gameVersion}`,'','注意: REVIEWEDは資料が揃ったことのみを示し、Technique DBの数値確定・DPS検証完了を意味しません。',''];
 for(const s of session.shots){lines.push(`- [${s.status==='REVIEWED'?'x':' '}] ${s.weaponName} ${s.condition} — \`${s.filename}\` (${s.status})`);}
 return lines.join('\n')+'\n';
}
if(require.main===module){const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));const session=createSession(manifest);process.stdout.write(JSON.stringify(session,null,2)+'\n');}
module.exports={createSession,validateSession,renderCaptureStatus};
