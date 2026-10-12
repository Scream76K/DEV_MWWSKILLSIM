const fs=require('fs');
const {engine}=require('../tests/r220-technique-audit.cjs');
const source=JSON.parse(fs.readFileSync('HAMMER_UPDATE_EVIDENCE_r231.json','utf8'));
const mapping={
'振り回し':'HAM_SWING','縦振りⅠ':'HAM_VERTICAL_I','縦振りⅡ':'HAM_VERTICAL_II','アッパー':'HAM_UPPERCUT','横振り':'HAM_SIDE_SWING',
'叩きつけ1':'HAM_BIG_BANG_1','叩きつけ2':'HAM_BIG_BANG_2','叩きつけ3':'HAM_BIG_BANG_3','叩きつけ4':'HAM_BIG_BANG_4','叩きつけフィニッシュ':'HAM_BIG_BANG_FINISH',
'返し振り':'HAM_RETURN_SWING','回転攻撃':'HAM_SPIN_ATTACK','回転横振り':'HAM_SPIN_SIDE_SWING','回転返し振り':'HAM_SPIN_RETURN_SWING','回転強アッパー':'HAM_SPIN_STRONG_UPPERCUT',
'溜め振り回し':'HAM_CHARGED_SWING','溜めアッパー':'HAM_CHARGED_UPPERCUT','溜め叩きつけ':'HAM_CHARGED_SLAM','渾身溜めアッパー':'HAM_MIGHTY_CHARGE_UPPERCUT','渾身溜め叩きつけ':'HAM_MIGHTY_CHARGED_SLAM',
'ジャンプ溜め攻撃Ⅰ':'HAM_JUMP_CHARGE_1','ジャンプ溜め攻撃Ⅱ':'HAM_JUMP_CHARGE_2','ジャンプ溜め攻撃Ⅲ':'HAM_JUMP_CHARGE_3'
};
const latest=new Map(source.changes.map(r=>[r.name,{...r,updateVersion:'1.011.00'}]));
for(const r of source.subsequentUpdates||[])latest.set(r.name,{...r,updateVersion:r.version});
const rows=Object.entries(mapping).map(([name,id])=>{
 const record=latest.get(name);if(!record)throw Error('missing history '+name);
 const technique=engine.db.hammer[id];if(!technique)throw Error('missing DB '+id);
 const actual=technique.hits.map(h=>h.mv);const expected=record.afterHits;
 return {name,techniqueId:id,dbHits:actual,historyAfterHits:expected,historyVersion:record.updateVersion,match:JSON.stringify(actual)===JSON.stringify(expected),status:JSON.stringify(actual)===JSON.stringify(expected)?'HISTORY_MATCH_CURRENT_VERSION_UNVERIFIED':'HISTORY_MISMATCH_REVIEW_REQUIRED'};
});
const summary={total:rows.length,matching:rows.filter(r=>r.match).length,mismatching:rows.filter(r=>!r.match).length,unmapped:source.changes.filter(r=>!mapping[r.name]).map(r=>r.name)};
const report={revision:'r232',targetGameVersion:'1.042.00.02',sourceUrls:source.sourceUrls,summary,rows,numericChangesApplied:0,notes:['History match does not establish current version verification.','Only Technique DB values are compared; generic profile and handler calculations are not certified by this audit.']};
fs.writeFileSync('HAMMER_FULL_DB_AUDIT_r232.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(summary));
for(const r of rows.filter(r=>!r.match))console.log(r.techniqueId,JSON.stringify(r.dbHits),'->',JSON.stringify(r.historyAfterHits));
