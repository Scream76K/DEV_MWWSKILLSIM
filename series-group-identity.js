// Official identity boundary. Display names never override a supplied ID.
(function(root){'use strict';
const data=typeof module==='object'&&module.exports?require('./series-group-identity-data.js'):root.MHSeriesGroupIdentityData;
const fail=code=>{throw Error('BONUS_IDENTITY_'+code);};
const key=id=>typeof id==='number'&&Number.isSafeInteger(id)&&id>0?String(id):typeof id==='string'&&/^[1-9][0-9]*$/.test(id)?id:null;
const list=x=>Array.isArray(x)?x:x==null?[]:[x];
const expectedKind=type=>type==='series'||type==='set'?'set':type==='group'?'group':fail('KIND_UNKNOWN');
const official=new Map(data.parents.map(p=>[String(p.id),p]));
function ranksFor(skill,canonical){
 if(!Array.isArray(skill.ranks)||!skill.ranks.length)fail('RANKS_MISSING');
 const seen=new Set();return skill.ranks.map(r=>{
  const id=key(r?.id);if(!id)fail('RANK_ID_MISSING');if(seen.has(id))fail('RANK_DUPLICATE');seen.add(id);
  const c=canonical.ranks.find(t=>String(t.id)===id);if(!c)fail('RANK_ID_MISMATCH');
  if(r.skill?.id!=null&&String(r.skill.id)!==String(skill.id))fail('RANK_PARENT_MISMATCH');
  if(r.skill?.kind!=null&&r.skill.kind!==canonical.kind)fail('KIND_MISMATCH');
  if(r.level!==c.level)fail('RANK_LEVEL_MISMATCH');
  if(r.setPiecesRequired!==c.setPiecesRequired)fail('RANK_REQUIREMENT_MISMATCH');
  return {...r,id:c.id,skill:{...r.skill,id:canonical.id},bonusRankId:c.bonusRankId};
 });
}
function parent(db,ref,type){
 const kind=expectedKind(type),id=key(ref&&typeof ref==='object'?ref.id:ref);if(!id)fail('PARENT_ID_MISSING');
 const c=official.get(id);if(!c)fail('PARENT_ID_UNKNOWN');
 if(c.kind!==kind||(ref?.kind!=null&&ref.kind!==kind))fail('KIND_MISMATCH');
 const matches=(db.skills||[]).filter(s=>String(s.id)===id);if(matches.length>1)fail('PARENT_DUPLICATE');if(!matches.length)fail('PARENT_DB_MISSING');
 const sk=matches[0];if(sk.kind!==kind)fail('KIND_MISMATCH');
 for(const s of [sk,ref])if(s&&typeof s==='object'&&s.gameId!=null&&s.gameId!==c.gameId)fail('GAME_ID_MISMATCH');
 const ranks=ranksFor(sk,c);
 if(ref&&typeof ref==='object'&&ref!==sk&&Array.isArray(ref.ranks))ranksFor(ref,c);
 return {...sk,id:c.id,ranks,bonusId:c.bonusId};
}
function activeRank(skill,count){
 if(!Number.isInteger(count)||count<0)fail('COUNT_INVALID');
 const expected=official.get(String(skill.id))?.ranks.filter(r=>count>=r.setPiecesRequired).sort((a,b)=>b.level-a.level)[0];
 if(expected&&!skill.ranks.some(r=>r.id===expected.id))fail('RANKS_INCOMPLETE');
 return skill.ranks.filter(r=>count>=r.setPiecesRequired).sort((a,b)=>b.level-a.level)[0]||null;
}
function parentsForSet(db,set,type){
 const seen=new Set();return list(type==='series'?set?.setBonusSkill:set?.groupBonusSkill).map(r=>parent(db,r,type)).filter(s=>{if(seen.has(s.id))return false;seen.add(s.id);return true;});
}
function validateDB(db){
 for(const s of db.skills||[])if(s.kind==='set'||s.kind==='group'||official.has(String(s.id))){const p=parent(db,s,s.kind);if(p.ranks.length!==official.get(String(p.id)).ranks.length)fail('RANKS_INCOMPLETE');}
 for(const s of db.sets||[])for(const [type,field] of [['series','bonus'],['group','groupBonus']]){
  const refs=parentsForSet(db,s,type),b=s[field];if(!b)continue;
  const p=parent(db,b.skill,type),c=official.get(String(p.id));if(b.id!==c.bonusId)fail('BONUS_ID_MISMATCH');
  if(refs.length&&!refs.some(r=>r.id===p.id))fail('BONUS_PARENT_MISMATCH');
  if(!Array.isArray(b.ranks)||b.ranks.length!==c.ranks.length)fail('BONUS_RANKS_INCOMPLETE');
  const seen=new Set();for(const r of b.ranks||[]){const cr=c.ranks.find(x=>x.bonusRankId===r.id);if(!cr||seen.has(r.id)||r.pieces!==cr.setPiecesRequired||r.skill?.id!==cr.id||r.skill?.level!==cr.level||(r.skill?.skill?.id!=null&&r.skill.skill.id!==p.id))fail('BONUS_RANK_MISMATCH');seen.add(r.id);}
 }
 return true;
}
function convertSavedArtia(db,raw){
 const artia={...raw},conversions=[];
 for(const [field,type] of [['seriesSkill','series'],['groupSkill','group']]){
  const value=raw[field];if(value===undefined||value===null||value==='')continue; // preserve the exact legacy empty/missing shape
  let id,rankId;
  if(value&&typeof value==='object'&&!Array.isArray(value)){
   // Explicit optional reference shape; no guessing across API/game ID namespaces.
   id=value.parentId;rankId=value.rankId;
   if(value.kind!=null&&value.kind!==expectedKind(type))fail('KIND_MISMATCH');
  }else if(key(value))id=value;
  else if(typeof value==='string'){
   const aliases=data.parents.filter(p=>p.name===value);if(aliases.length!==1)fail('LEGACY_NAME_UNRESOLVED');id=aliases[0].id;
  }else fail('SAVED_REFERENCE_INVALID');
  const p=parent(db,{id},type);if(rankId!=null&&!p.ranks.some(r=>String(r.id)===String(rankId)))fail('RANK_ID_MISMATCH');
  artia[field]=String(p.id);conversions.push({field,parentId:p.id,rule:key(value)?'LEGACY_MHDB_API_ID':typeof value==='string'?'MHDB_ALIAS_SNAPSHOT_20261015':'EXPLICIT_PARENT_REFERENCE'});
 }
 return {artia,conversions};
}
function legacyEffectIdentity(names,rankLevel){
 const candidates=data.parents.filter(p=>names.includes(p.name)||p.ranks.some(r=>names.includes(r.name)));
 if(candidates.length!==1)fail('LEGACY_NAME_UNRESOLVED');
 const p=candidates[0],named=p.ranks.filter(r=>names.includes(r.name));
 if(named.length>1)fail('RANK_LEVEL_MISMATCH');
 const r=named.length===1?named[0]:p.ranks.find(r=>r.level===rankLevel);
 if(!r)fail('RANK_ID_MISSING');if(rankLevel!=null&&rankLevel!==r.level)fail('RANK_LEVEL_MISMATCH');
 return {parent:p,rank:r};
}
function resolveEffect(effect){
 try{
  if(!effect||typeof effect!=='object'||Array.isArray(effect))fail('REFERENCE_FORMAT');
  const nested=effect.identity;
  if(nested!=null&&(!nested||typeof nested!=='object'||Array.isArray(nested)||nested.schemaVersion!==1))fail('UNSUPPORTED_IDENTITY_SCHEMA');
  const ids=[effect.bonusSkillId,effect.parentSkillId,nested?.parentId].filter(x=>x!=null);
  const rankIds=[effect.rankId,nested?.rankId].filter(x=>x!=null);
  const kindValues=[effect.skillKind,nested?.kind].filter(x=>x!=null);
  let p,r,conversion=null;
  if(ids.length||rankIds.length||nested!=null||kindValues.length){
   if(!ids.length||ids.some(x=>!key(x)))fail('PARENT_ID_MISSING');
   if(new Set(ids.map(String)).size!==1)fail('REFERENCE_CONFLICT');
   p=official.get(String(ids[0]));if(!p)fail('PARENT_ID_UNKNOWN');
   if(rankIds.length){
    if(rankIds.some(x=>!key(x))||new Set(rankIds.map(String)).size!==1)fail('REFERENCE_CONFLICT');
    r=p.ranks.find(r=>String(r.id)===String(rankIds[0]));if(!r)fail('RANK_ID_MISMATCH');
   }else{r=p.ranks.find(r=>r.level===effect.rankLevel);if(!r)fail('RANK_ID_MISSING');conversion='LEGACY_PARENT_AND_LEVEL';}
  }else{
   ({parent:p,rank:r}=legacyEffectIdentity([effect.name,effect.bonusName,effect.parentName].filter(x=>typeof x==='string'),effect.rankLevel));
   conversion='MHDB_EFFECT_ALIAS_SNAPSHOT_20261015';
  }
  if(conversion==='LEGACY_PARENT_AND_LEVEL'){
   const names=[effect.name,effect.bonusName,effect.parentName].filter(x=>typeof x==='string');
   const declared=data.parents.filter(t=>names.includes(t.name)||t.ranks.some(q=>names.includes(q.name)));
   if(declared.some(t=>t.id!==p.id))fail('REFERENCE_CONFLICT');
   if(p.ranks.some(q=>names.includes(q.name)&&q.id!==r.id))fail('RANK_LEVEL_MISMATCH');
  }
  if(kindValues.some(k=>k!==p.kind)||(effect.source!=null&&expectedKind(effect.source)!==p.kind))fail('KIND_MISMATCH');
  if(nested?.gameId!=null&&nested.gameId!==p.gameId)fail('GAME_ID_MISMATCH');
  if(effect.rankLevel!=null&&effect.rankLevel!==r.level)fail('RANK_LEVEL_MISMATCH');
  if(effect.required!=null&&effect.required!==r.setPiecesRequired)fail('RANK_REQUIREMENT_MISMATCH');
  if([effect.bonusRankId,nested?.bonusRankId].some(x=>x!=null&&String(x)!==String(r.bonusRankId)))fail('BONUS_RANK_MISMATCH');
  if(nested?.bonusId!=null&&String(nested.bonusId)!==String(p.bonusId))fail('BONUS_ID_MISMATCH');
  return {status:'IDENTIFIED',parent:p,rank:r,conversion,identity:{schemaVersion:1,parentId:p.id,gameId:p.gameId,rankId:r.id,bonusId:p.bonusId,bonusRankId:r.bonusRankId,kind:p.kind,sourceRevision:'MHDB_IDENTITY_20261015'},reasons:[]};
 }catch(e){return {status:'UNRESOLVED',parent:null,rank:null,conversion:null,identity:{schemaVersion:1,status:'UNRESOLVED',reasons:[String(e.message||e)]},reasons:[String(e.message||e)]};}
}

const api=Object.freeze({schemaVersion:1,source:data.source,parents:data.parents,resolveEffect,legacyEffectIdentity,parent,activeRank,parentsForSet,validateDB,convertSavedArtia});
if(typeof module==='object'&&module.exports)module.exports=api;else root.MHSeriesGroupIdentity=api;
})(typeof globalThis!=='undefined'?globalThis:this);
