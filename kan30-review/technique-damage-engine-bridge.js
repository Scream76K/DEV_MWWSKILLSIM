// r179: fail-closed, read-only Technique DB -> damage-engine readiness gate.
(function(root){'use strict';
function inspect(provenance, stages, auditReader, engine){
 if(!provenance||!Array.isArray(provenance.entries)||!Array.isArray(stages)||provenance.entries.length!==stages.length||typeof auditReader!=='function'||!engine||typeof engine.hits!=='function')throw new TypeError('matching combo, Technique DB audit and engine required');
 const rows=provenance.entries.map((entry,index)=>{
  const stage=stages[index]||{}, canonical=stage.canonicalTechniqueId;
  const blockers=[];
  if(typeof canonical!=='string'||!canonical.trim())blockers.push('CANONICAL_TECHNIQUE_ID_MISSING');
  let audit=null,hits=null;
  if(!blockers.length){try{audit=auditReader(provenance.weaponType,canonical);}catch(e){blockers.push('TECHNIQUE_AUDIT_FAILED');}}
  if(!audit||audit.techniqueId!==canonical||audit.weaponType!==provenance.weaponType)blockers.push('CANONICAL_TECHNIQUE_NOT_CONFIRMED');
  if(audit&&audit.calculable!==true)blockers.push('TECHNIQUE_NOT_CALCULABLE');
  if(!blockers.length){try{hits=engine.hits(provenance.weaponType,canonical);}catch(e){blockers.push('TECHNIQUE_HITS_GATED');}}
  if(!Array.isArray(hits)||!hits.length||hits.some(h=>typeof h.mv!=='number'||!Number.isFinite(h.mv)||h.mv<0||typeof h.elementModifier!=='number'||!Number.isFinite(h.elementModifier)||h.elementModifier<0))blockers.push('NUMERIC_HITS_UNAVAILABLE');
  if(!stage.handler)blockers.push('DAMAGE_HANDLER_NOT_BOUND');
  // A numeric hit registry is not a verified damage formula, hit-zone state or live timing.
  blockers.push('VERIFIED_DAMAGE_FORMULA_NOT_CONNECTED','LIVE_DAMAGE_AND_DURATION_NOT_VERIFIED');
  return Object.freeze({stage:index+1,legacyTechniqueId:entry.techniqueId,canonicalTechniqueId:typeof canonical==='string'?canonical:null,hitCount:Array.isArray(hits)&&!blockers.includes('NUMERIC_HITS_UNAVAILABLE')?hits.length:null,source:'TECHNIQUE_DB_READ_ONLY',status:'ENGINE_INTEGRATION_PENDING',blockers:Object.freeze([...new Set(blockers)]),damage:null,dps:null,verified:false});
 });
 return Object.freeze({scope:'R179_TECHNIQUE_ENGINE_READINESS_ONLY',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function format(report){return ['Technique DB → ダメージ計算エンジン接続診断（読み取り専用）',...report.rows.map(r=>r.stage+'. '+r.legacyTechniqueId+' → '+(r.canonicalTechniqueId||'未対応')+' / Hit数 '+(r.hitCount??'未確定')+' / '+r.blockers.join(', ')),'※確定数値の存在だけではダメージやDPSを確定しません。'].join('\n');}
const api=Object.freeze({inspect,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWTechniqueDamageEngineBridge=api;
})(typeof window!=='undefined'?window:globalThis);
