'use strict';
const fs=require('node:fs');
const path=require('node:path');
const MANIFEST=path.join(__dirname,'..','R121_CAPTURE_MANIFEST.json');
function buildChecklist(manifest){
 if(!manifest||!Array.isArray(manifest.entries)||manifest.entries.length!==14) throw Error('14 weapon entries required');
 const ids=new Set();
 const rows=manifest.entries.map(e=>{
  if(!e.id||!e.name||!e.subject||ids.has(e.id)) throw Error('invalid or duplicate weapon');
  ids.add(e.id);
  const priority=e.id==='heavy-bowgun'?'P0':e.status==='STANDARD'?'P2':'P1';
  const shots=e.id==='heavy-bowgun'?[['A','両スキルなし'],['B','ファーストショットのみ'],['C','フォースショットのみ']]:[['A','基準映像']];
  return {id:e.id,name:e.name,priority,subject:e.subject,shots:shots.map(([code,condition])=>({code,condition,filename:`r125_${e.id}_${code}.mp4`})),verified:false};
 });
 return {gameVersion:manifest.gameVersion,revision:'r125',rows,verificationStatus:'UNVERIFIED'};
}
function renderMarkdown(plan){
 const lines=['# r125 夜間撮影チェックリスト','',`ゲームVer: ${plan.gameVersion} / 判定: 未検証`,'','共通: 装備・スキルLvの画面、対象部位、会心/距離/バフ、全Hit数字、コンボ開始〜終了を記録。A/B/Cでは変更するスキル以外を固定。',''];
 for(const priority of ['P0','P1','P2']){
  lines.push(`## ${priority}`,'');
  for(const row of plan.rows.filter(r=>r.priority===priority)){
   lines.push(`### ${row.name} — ${row.subject}`,'');
   for(const shot of row.shots) lines.push(`- [ ] ${shot.code} ${shot.condition}: \`${shot.filename}\``);
   lines.push('');
  }
 }
 lines.push('注: 撮影完了はTechnique DBの確定や実機照合完了を意味しません。');
 return lines.join('\n')+'\n';
}
if(require.main===module){const plan=buildChecklist(JSON.parse(fs.readFileSync(MANIFEST,'utf8')));process.stdout.write(renderMarkdown(plan));}
module.exports={buildChecklist,renderMarkdown};
