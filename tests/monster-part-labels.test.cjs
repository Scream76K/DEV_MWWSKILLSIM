'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function setup(){const c={};vm.createContext(c);vm.runInContext(html.slice(html.indexOf('const PART_JP='),html.indexOf('function expandMonsterVariants()')),c);return c;}
const monsters=require(path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json')).data.monsters;
test('part labels never leak source IDs or keys and leave source hitzones untouched',()=>{
 const c=setup(),before=JSON.stringify(monsters);
 for(const m of monsters)for(const p of m.parts){
   const label=c.monsterPartDisplayName(p,m.parts,m);
   assert.ok(label);assert.doesNotMatch(label,/ID\s|[a-z]+-[a-z]+/);
 }
 assert.equal(JSON.stringify(monsters),before);
});
test('known states use human-readable labels, and do not invent conditions for unlabeled states',()=>{
 const c=setup(),zoh=monsters.find(m=>m.id===1),jin=monsters.find(m=>m.id===26);
 const label=(m,p)=>c.monsterPartDisplayName(p,m.parts,m);
 assert.match(label(zoh,zoh.parts.find(p=>p.kind==='head-wear')),/^頭（白纏晶）$/);
 assert.match(label(zoh,zoh.parts.find(p=>p.kind==='head-hide')),/^頭（本体・斬撃\d+）$/);
 assert.equal(label(jin,jin.parts.find(p=>p.kind==='frozen-bigcore-after')),'大凍成殻（露出後）');
});
test('front and hind legs stay distinct after localization',()=>{const c=setup();assert.notEqual(c.partNameJP({name:'left-front-leg'}),c.partNameJP({name:'left-hind-leg'}));assert.notEqual(c.partNameJP({name:'right-front-leg'}),c.partNameJP({name:'right-hind-leg'}));});
test('training names stay unchanged and an unnamed part is hidden from new selection',()=>{
 const c=setup(),training={id:'training-front',name:'正面'},unknown={id:55};
 assert.equal(c.monsterPartDisplayName(training,[training]),training.name);
 assert.equal(c.monsterPartDisplayName(unknown,[unknown]),'部位不明（旧保存）');
 assert.equal(c.unidentifiedMonsterPart(unknown),true);
 assert.equal(unknown.id,55);
});
