// KAN-27 C01/C02/C03 (10169-10172): existing adoption decisions only.
// No numeric combat parameters. Display/activation survives exclusion.
(function(root){'use strict';
const identity=typeof module==='object'&&module.exports?require('./series-group-identity.js'):root.MHSeriesGroupIdentity;
const include=new Set([10,62,70,106,115,131,155,157,167,178]),nonHP=new Set([19,20,73,74,148]);
function activated(effects){
 if(!Array.isArray(effects))throw Error('BONUS_IDENTITY_INVALID_ACTIVE_EFFECTS');
 const seen=new Set();return effects.map(e=>{
  if(![e?.bonusSkillId,e?.parentSkillId,e?.identity?.parentId].some(x=>x!=null))throw Error('BONUS_IDENTITY_PARENT_ID_MISSING');
  if(![e?.rankId,e?.identity?.rankId].some(x=>x!=null))throw Error('BONUS_IDENTITY_RANK_ID_MISSING');
  const x=identity.resolveEffect(e);if(x.status!=='IDENTIFIED')throw Error(x.reasons.join(':'));
  const p=x.parent,r=x.rank,highest=p.ranks.filter(t=>Number.isInteger(e.count)&&e.count>=t.setPiecesRequired).sort((a,b)=>b.level-a.level)[0];
  if(seen.has(p.id))throw Error('BONUS_IDENTITY_DUPLICATE_PARENT');seen.add(p.id);
  if(e.source!==(p.kind==='set'?'series':'group')||e.required!==r.setPiecesRequired||e.rankLevel!==r.level||highest?.id!==r.id)throw Error('BONUS_IDENTITY_ACTIVATION_MISMATCH');
  return {...x,effect:{...e,name:r.name,bonusName:p.name,bonusSkillId:p.id,rankId:r.id,identity:x.identity},policy:include.has(p.id)?'INCLUDE':nonHP.has(p.id)?'NON_DAMAGE':'EXCLUDE',affinityException:p.id===162,decision:'KAN-27:10169/10170'+(p.id===162?'/10171':p.id===173?'/10172':'')};
 });
}
const api=Object.freeze({activated,includeIds:Object.freeze([...include]),nonHPIds:Object.freeze([...nonHP])});
if(typeof module==='object'&&module.exports)module.exports=api;else root.MHSeriesGroupHpPolicy=api;
})(typeof globalThis!=='undefined'?globalThis:this);
