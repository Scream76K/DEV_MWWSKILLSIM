'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://guard-proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r250-stage5/evidence/hope-hammer-i.mhdb.api.json'))[0];
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.hammer=DB.weapons;weaponKind.value='hammer';weapon.innerHTML='<option value="387">Hope Hammer I</option>';weapon.value='387';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
let args,result;const adapter=w.MHWRealOneHitBrowserAdapter;
w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;result=adapter.evaluateCurrent(a);return result;}};
function run(guard){w.eval(`build.charmCustom={skills:[{name:'挑戦者',level:1,type:'armor'}${guard?",{name:'攻めの守勢',level:3,type:'weapon'}":""}],slots:[0,0,0],weaponSlots:[]};calcBuild();`);return JSON.parse(JSON.stringify({args,result}));}
const without=run(false),withGuard=run(true);assert.ok(args.skills.some(x=>x[0]==='攻めの守勢'&&x[1]===3));
const base={attackTrue:100,attack:100,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},element:0,elementType:null,affinity:0,activeBonusEffects:[]};
const plan=(kind,total,st=base)=>w.MHWStandardPowerConditionPlan(st,total,kind,{});
const hammer=plan('hammer',{'攻めの守勢':3}),hammerAgitator=plan('hammer',{'攻めの守勢':3,'挑戦者':1}),gl=plan('gunlance',{'攻めの守勢':3}),unknown=plan('unknown-kind',{'攻めの守勢':3}),invalid=plan('hammer',{'攻めの守勢':1.5}),badComponents=plan('gunlance',{'攻めの守勢':3},{...base,attackComponents:null});
assert.ok(unknown.pending.includes('攻めの守勢:GUARDING_WEAPON_REQUIRED'));assert.ok(invalid.pending.includes('攻めの守勢:LEVEL_INVALID'));assert.ok(badComponents.pending.includes('攻めの守勢:ATTACK_COMPONENTS_UNRESOLVED'));
assert.equal(gl.normal.attackTrue,100);assert.ok(Math.abs(gl.maximum.attackTrue-115)<1e-10);assert.equal(gl.applied.find(x=>x.skill==='攻めの守勢').attackMultiplier,1.15);
if(process.env.BEFORE){assert.ok(hammer.pending.includes('攻めの守勢:GUARDING_WEAPON_REQUIRED'));assert.ok(JSON.stringify(withGuard.result).includes('GUARDING_WEAPON_REQUIRED'));}else{
assert.equal(hammer.pending.length,0);assert.equal(hammer.maximum.attackTrue,100);assert.equal(hammerAgitator.maximum.attackTrue,104);assert.ok(!hammer.applied.some(x=>x.skill==='攻めの守勢'));
for(const ch of ['normal','maximum']){assert.equal(withGuard.result.channels[ch].execution.status,'complete');assert.equal(withGuard.result.channels[ch].metrics.comboTotalDamage.value,without.result.channels[ch].metrics.comboTotalDamage.value);}
assert.ok(withGuard.result.channels.maximum.metrics.comboTotalDamage.value>withGuard.result.channels.normal.metrics.comboTotalDamage.value);
}
console.log(JSON.stringify({phase:process.env.BEFORE?'before':'after',weaponId:387,techniqueIds:args.techniqueIds,publicResults:{without:without.result,withGuard:withGuard.result},plans:{hammer,hammerAgitator,gl,unknown,invalid,badComponents}},null,2));w.close();
