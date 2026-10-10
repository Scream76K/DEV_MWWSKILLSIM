// r175: review untrusted in-game measurements against combo stage identities.
// This is an observation ledger, never a verification or DPS calculator.
(function(root){'use strict';
function review(provenance,records){
 if(!provenance||!Array.isArray(provenance.entries))throw new TypeError('combo provenance entries required');
 if(!Array.isArray(records)||records.length>200)throw new TypeError('measurement array required (max 200)');
 const accepted=[],rejected=[],seen=new Set();
 records.forEach((r,index)=>{
  const fail=reason=>rejected.push(Object.freeze({index,reason}));
  if(!r||typeof r!=='object'||Array.isArray(r))return fail('INVALID_RECORD');
  const stage=r.stage,entry=provenance.entries[stage-1];
  if(!Number.isInteger(stage)||stage<1||!entry||r.techniqueId!==entry.techniqueId)return fail('STAGE_TECHNIQUE_MISMATCH');
  if(seen.has(stage))return fail('DUPLICATE_STAGE');
  if(typeof r.evidenceRef!=='string'||!r.evidenceRef.trim()||r.evidenceRef.length>500)return fail('EVIDENCE_REF_REQUIRED');
  if(typeof r.gameVersion!=='string'||!r.gameVersion.trim()||r.gameVersion.length>80)return fail('GAME_VERSION_REQUIRED');
  if(!Number.isInteger(r.hitCount)||r.hitCount<1||r.hitCount>1000)return fail('INVALID_HIT_COUNT');
  if(typeof r.durationSeconds!=='number'||!Number.isFinite(r.durationSeconds)||r.durationSeconds<=0||r.durationSeconds>3600)return fail('INVALID_DURATION');
  if(!r.damage||typeof r.damage!=='object'||Array.isArray(r.damage))return fail('DAMAGE_COMPONENTS_REQUIRED');
  const keys=Object.keys(r.damage),allowed=['physicalBody','elementalBody','shelling','wyrmstake'];
  if(!keys.length||keys.some(k=>!allowed.includes(k)||typeof r.damage[k]!=='number'||!Number.isFinite(r.damage[k])||r.damage[k]<0||!Number.isInteger(r.damage[k])))return fail('INVALID_DAMAGE_COMPONENTS');
  if(keys.every(k=>r.damage[k]===0))return fail('ZERO_DAMAGE');
  seen.add(stage);
  const damage=Object.freeze(Object.fromEntries(keys.map(k=>[k,r.damage[k]])));
  accepted.push(Object.freeze({stage,techniqueId:r.techniqueId,evidenceRef:r.evidenceRef.trim(),gameVersion:r.gameVersion.trim(),hitCount:r.hitCount,durationSeconds:r.durationSeconds,damage,status:'OBSERVED_NOT_VERIFIED'}));
 });
 return Object.freeze({status:'MEASUREMENT_REVIEW_ONLY',accepted:Object.freeze(accepted),rejected:Object.freeze(rejected),missingStages:Object.freeze(provenance.entries.map((_,i)=>i+1).filter(i=>!seen.has(i))),captureEligible:false,verifiedDps:null});
}
function format(report){return ['実機計測記録（未検証・DPS確定不可）','受付 '+report.accepted.length+'件 / 未入力段階 '+report.missingStages.length+'件 / 不一致 '+report.rejected.length+'件',...report.accepted.map(r=>r.stage+'. '+r.techniqueId+'：'+r.hitCount+'Hit / '+r.durationSeconds+'秒 / '+Object.entries(r.damage).map(([k,v])=>k+'='+v).join(', ')+' ['+r.evidenceRef+']（未検証）'),...report.rejected.map(r=>'入力'+(r.index+1)+'：'+r.reason),'※数値は申告値です。Technique DBとの数値一致・証拠内容・計測条件は未検証です。'].join('\n');}
const api=Object.freeze({review,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboMeasurementReview=api;
})(typeof window!=='undefined'?window:globalThis);
