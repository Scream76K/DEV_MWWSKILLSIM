const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r259-hbg-element-skill/fixture.json'));assert.equal(f.weapon.id,467);assert.equal(f.weapon.slots[0],2);assert.equal(f.decoration.id,35);assert.equal(f.decoration.kind,'weapon');assert.ok(f.decoration.slot<=f.weapon.slots[0]);assert.ok(f.decoration.skills.some(x=>x.skill.id===127&&x.level===2));assert.ok(f.weapon.ammo.some(x=>x.kind==='thunder'&&x.level===1&&x.capacity===7));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.skills=${JSON.stringify(f.skills)};DB.decorations=[${JSON.stringify(f.decoration)}];weaponIndexByKind['heavy-bowgun']=DB.weapons;weaponKind.value='heavy-bowgun';weapon.innerHTML='<option value="467">ホープキャノンⅣ</option>';weapon.value='467';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:HBG_ELEMENT_FIRST_HIT_REFERENCE');powerHbgElementType.value='thunder';powerHbgAmmoLevel.value='1';powerHbgNormalMode.value='0';powerHbgRange.value='CRITICAL';calcBuild();`);

let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const rows=[];
for(const ordinal of [1,4,5]){
 const skills=[['見切り',1],['雷属性攻撃強化',2],['会心撃【属性】',3],['濡れ刃紋',3],['ファーストショット',3],['フォースショット',3]];
 const conditions={...args.conditions,wetState:{normal:{wet:false,bubble:false},maximum:{wet:true,bubble:true}}};
 const stats={...args.stats};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,Object.fromEntries(skills),'heavy-bowgun',conditions);
 const result=adapter.evaluateCurrent({...args,conditions,stats,skills,equipmentSkillsResolved:true,hbgState:{...args.hbgState,shotOrdinal:ordinal,fullMagazine:true,magazineCapacity:7}});
 for(const channel of ['normal','maximum']){const c=result.channels[channel];assert.equal(c.execution.status,'complete');assert.equal(c.components[0].status,'available');const d=c.components[0].details,aff=4+(ordinal>=4?12:0)+(channel==='maximum'?30:0),attackAdd=ordinal===1?15:ordinal===4?10:0,m=ordinal===1?1.1:ordinal===4?1.05:1;
 const expectedPhysical=(160+attackAdd)*.08*.8*(1+aff/100*.25),expectedElement=(160/100*20*1.1*m+5)*.3*(1+aff/100*.21);
 assert.ok(Math.abs(d.physical-expectedPhysical)<1e-8);assert.ok(Math.abs(d.element-expectedElement)<1e-8);assert.equal(d.shotSkills.shotElementMultiplier,m);assert.equal(d.flatElement,1.5);}
 rows.push({ordinal,result});
}
const saved=w.eval(`powerWetNormal.value='DRY';powerWetMaximum.value='BOTH';buildSnapshot()`);
w.eval(`powerWetMaximum.value='WET';`);w.applyBuildSnapshot(saved,{preserveCombo:true});assert.equal(w.document.getElementById('powerWetMaximum').value,'WET');w.applyBuildSnapshot(saved);assert.equal(w.document.getElementById('powerWetMaximum').value,'BOTH');
const restored=w.compareStep5Snapshot();assert.equal(restored.wetState.maximum.bubble,true);assert.equal(restored.wetState.normal.wet,false);
console.log(JSON.stringify({rows,savedCondition:saved.combo.explicitAffinityState,restoredCondition:restored.wetState,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','bowgun-element-reference.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
