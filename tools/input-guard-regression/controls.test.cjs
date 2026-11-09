'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {input,raw,bonus,accepted,aliases,syntheticSkills,classify}=require('./synthetic.cjs');
test('empty valid ingress reaches downstream sentinel',()=>accepted(input()));
for(const [name,mutate] of [
 ['omitted conditions',a=>delete a.conditions],['omitted bonuses',a=>delete a.stats.activeBonusEffects],['omitted aggregate',a=>delete a.skills],['numeric ID',a=>raw(a)],['canonical string ID',a=>raw(a,{skill:{id:'6',name:'通常弾・通常矢強化'},level:1})],['name only',a=>raw(a,{skill:{name:'通常弾・通常矢強化'},level:1})],['outer rank ID with nested skill ID',a=>raw(a,{id:900004,skill:{id:6,name:'通常弾・通常矢強化'},level:1})],['primitive string level',a=>raw(a,{skill:{id:6,name:'通常弾・通常矢強化'},level:'1'})],['aggregate primitive string level',a=>a.skills=[['通常弾・通常矢強化','1']]],['source overlap equal',a=>{raw(a);a.skills=[['通常弾・通常矢強化',1]];}],['source overlap higher aggregate rank',a=>{raw(a);a.skills=[['通常弾・通常矢強化',3]];}],['raw alias plus aggregate canonical',a=>{raw(a,{skill:{id:6,name:'Normal Shots'},level:1});a.skills=[['通常弾・通常矢強化',1]];}],['two coeffects across sources',a=>{a.weapon.skills=[{skill:{id:72,name:'攻撃'},level:1},{skill:{id:3,name:'見切り'},level:1}];a.skills=[['攻撃',3],['見切り',2]];}],['synthetic set activation',a=>a.stats.activeBonusEffects=[bonus()]],['synthetic selected higher set rank',a=>a.stats.activeBonusEffects=[{...bonus(),name:'SYNTHETIC_BONUS_II',rankLevel:2,required:4,count:4}]]
])test(name+' preserves valid ingress',()=>{const a=input();mutate(a);accepted(a);});
test('synthetic group activation reaches sentinel',()=>{const rows=syntheticSkills();rows.at(-1).kind='group';const a=input();a.stats.activeBonusEffects=[{...bonus(),source:'group'}];accepted(a,rows);});
// These aliases are already present in production. The synthetic source names
// are intentionally invented; this checks identity mapping, NOT effect adoption.
const map=aliases();test('public identity alias table remains 53 aliases',()=>assert.equal(Object.keys(map).length,53));
for(const [alias,id] of Object.entries(map))for(const route of ['raw','aggregate'])test('existing alias identity '+alias+' '+route,()=>{const rows=[{id,name:'SYNTHETIC_CANONICAL_'+id,kind:'weapon',ranks:[{level:1}]}],a=input();if(route==='raw')raw(a,{skill:{id,name:alias},level:1});else a.skills=[[alias,1]];accepted(a,rows);});
test('alias validation does not assign an ID to name-only alias output',()=>{const row=classify({name:'Normal Shots',level:1});assert.equal(row.skillId,null);assert.equal(row.skillKey,'normalUp');});
