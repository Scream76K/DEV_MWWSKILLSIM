const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const context=vm.createContext({MHSeriesGroupIdentity:require('../series-group-identity.js'),DB:require('../tools/kan108-fixture.cjs').db});
vm.runInContext(html.slice(html.indexOf('function techniqueDbDeepFreeze('),html.indexOf('const TECHNIQUE_DB_R47_EVIDENCE='))+html.slice(html.indexOf('const RECOVERY_BONUS_HP_POLICIES='),html.indexOf('const STANDARD_FORTIFY_SOURCE=')),context);
const effect=(id,level)=>{const p=require('../series-group-identity.js').parents.find(p=>p.id===id),r=p.ranks.find(r=>r.level===level);return {name:r.name,bonusName:p.name,bonusSkillId:id,rankId:r.id,source:'series',rankLevel:level,required:r.setPiecesRequired,count:r.setPiecesRequired};};
test('KAN108 approved excluded and non-damage effects do not block known body inputs',()=>{
 for(const id of [71,26])for(const level of [1,2]){const e=effect(id,level),original=JSON.stringify(e);a.equal(context.bonusDamagePendingReason({element:100,activeBonusEffects:[e]}),null);a.equal(JSON.stringify(e),original);}
});
test('KAN108 exclusions retain identity and do not claim measured zero damage',()=>{
 const p=context.classifyHpBonusEffects([effect(71,1),effect(26,2)]);a.equal(p.effects.length,0);a.equal(p.excludedEffects[0].identity.parentId,71);a.equal(p.excludedEffects[0].policy,'EXCLUDE');a.equal(p.excludedEffects[0].includedInDamage,false);a.equal(p.excludedEffects[0].damage,undefined);a.equal(p.nonDamageEffects[0].identity.parentId,26);
});
test('KAN108 malformed unknown and duplicated effects remain blocked before exclusion',()=>{
 for(const id of [71,26]){const e=effect(id,1);for(const effects of [[e,e],[e,effect(id,2)],[{...e,count:1}],[{...e,count:4}],[{...e,rankId:effect(id,2).rankId}],[{...e,required:4}],[{...e,source:'group'}],[{...e,bonusSkillId:99999}],[{name:'灼熱化Ⅰ',bonusName:'火竜の力'}]])a.match(context.bonusDamagePendingReason({element:100,activeBonusEffects:effects}),/BONUS_DAMAGE_EFFECT_PENDING/);
 a.equal(context.bonusDamagePendingReason({element:null,activeBonusEffects:[e]}),'ELEMENT_VALUE_MISSING');}
});
test('KAN108 ordinary skill38 uses real MHDB rank and preserves invalid input gating',()=>{
 const skills=require('../tools/kan108-fixture.cjs').db.skills,sk=skills.find(s=>s.id===38),name=sk.name;
 for(const r of sk.ranks){const p=context.hpOrdinaryEffectPolicies({[name]:r.level});a.equal(p.excludedEffects.length,1);a.equal(p.excludedEffects[0].skillId,38);a.equal(p.excludedEffects[0].rankId,r.id);a.equal(p.excludedEffects[0].damage,undefined);}
 a.throws(()=>context.hpOrdinaryEffectPolicies({[name]:99}),/ORDINARY_EFFECT_RANK_INVALID/);
});
