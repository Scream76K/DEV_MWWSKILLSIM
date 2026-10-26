const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r260-lbg-element-skill/fixture.json'));assert.equal(f.weapon.id,766);assert.equal(f.weapon.slots[0],2);assert.equal(f.decoration.id,35);assert.equal(f.decoration.kind,'weapon');assert.ok(f.decoration.slot<=f.weapon.slots[0]);assert.ok(f.decoration.skills.some(x=>x.skill.id===127&&x.level===2));assert.ok(f.weapon.ammo.some(x=>x.kind==='thunder'&&x.level===1&&x.capacity===5&&x.rapid===false));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.skills=${JSON.stringify(f.skills)};DB.decorations=[${JSON.stringify(f.decoration)}];weaponIndexByKind['light-bowgun']=DB.weapons;weaponKind.value='light-bowgun';weapon.innerHTML='<option value="766">ホープバレットⅣ</option>';weapon.value='766';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LBG_ELEMENT_FIRST_HIT_REFERENCE');comboLBGMode.value='NORMAL';comboLBGAmmoType.value='THUNDER';comboLBGAmmoLevel.value='1';comboLBGRange.value='CRITICAL';comboLBGNormalMode.value='0';comboLBGContactPolicy.value='FIRST_HIT';calcBuild();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();
const contacts=Array.from({length:6},(_,i)=>({ordinal:i+1,targetId:'training-room',partId:'training-front',range:'CRITICAL',physicalHitzone:40,elementalHitzone:30}));
const rows=[];
for(const level of [0,2]){
 const r=adapter.evaluateCurrent({...args,skills:level?[['雷属性攻撃強化',2]]:[],equipmentSkillsResolved:true,lightBowgunState:{...args.lightBowgunState,contactPolicy:'EXPLICIT_CONTACTS',contacts}});
 for(const ch of ['normal','maximum']){const c=r.channels[ch];assert.equal(c.metrics.comboTotalDamage.status,'available',JSON.stringify(c));const d=c.components[0].details;
 assert.equal(d.contacts.length,6);assert.ok(Math.abs(d.physical-d.contacts[0].physical*4.7)<1e-9);assert.ok(Math.abs(d.element-d.contacts[0].element*6)<1e-9);assert.equal(d.contacts[5].flatElement,level?1.5:0);assert.equal(d.contacts[0].flatElement,d.contacts[5].flatElement);assert.equal(c.metrics.firstHitReference,undefined);assert.equal(c.diagnostics.referenceOnly,false);}
 rows.push(r);
}
for(const contactsBad of [[...contacts,{...contacts[0],ordinal:7}],[]]){const r=adapter.evaluateCurrent({...args,lightBowgunState:{...args.lightBowgunState,contactPolicy:'EXPLICIT_CONTACTS',contacts:contactsBad}});assert.equal(r.channels.normal.metrics.comboTotalDamage.status,'unavailable');}
for(const range of ['NEAR','FAR']){const r=adapter.evaluateCurrent({...args,lightBowgunState:{...args.lightBowgunState,contactPolicy:'EXPLICIT_CONTACTS',contacts:contacts.map(c=>({...c,range}))}});assert.equal(r.channels.normal.metrics.comboTotalDamage.status,'unavailable');}
const separate=adapter.evaluateCurrent({...args,skills:[['雷属性攻撃強化',2]],equipmentSkillsResolved:true,stats:{...args.stats,conditionalConditionPlan:{status:'READY',maximum:{element:0},attackComponents:{conditionalMultiplier:1.1,groupMultiplier:1,conditionalFlat:10}}},lightBowgunState:{...args.lightBowgunState,contactPolicy:'EXPLICIT_CONTACTS',contacts}});
const nd=separate.channels.normal.components[0].details,md=separate.channels.maximum.components[0].details,ratio=(f.weapon.damage.raw*1.1+10)/f.weapon.damage.raw;
assert.ok(Math.abs(md.physical/nd.physical-ratio)<1e-9);assert.ok(Math.abs(md.contacts[0].attackDependentElement/nd.contacts[0].attackDependentElement-ratio)<1e-9);assert.equal(md.contacts[0].flatElement,nd.contacts[0].flatElement);rows.push(separate);
const sameInput={attack:90,affinity:0,criticalMultiplier:1.25,elementMultiplier:1.1,elementFlat:50,range:'CRITICAL',contacts};
const crossWeapon=[];
for(const ammoLevel of [1,2]){
 const h=w.BowgunElementReference.contactSequence({...sameInput,ammoLevel,weaponKind:'heavy-bowgun'},w.TechniqueDBEngine);
 const l=w.BowgunElementReference.contactSequence({...sameInput,ammoLevel,weaponKind:'light-bowgun'},w.TechniqueDBEngine);
 for(let i=0;i<6;i++){assert.ok(Math.abs(l.contacts[i].physical/h.contacts[i].physical-.7)<1e-12);assert.ok(Math.abs(l.contacts[i].attackDependentElement/h.contacts[i].attackDependentElement-.7)<1e-12);assert.equal(l.contacts[i].flatElement,h.contacts[i].flatElement);assert.equal(l.contacts[i].flatElement,1.5);}
 assert.ok(l.model.flatRepetitionAssumption.includes('provisional'));
 assert.ok(w.firstHitReferenceDisplay({referenceScope:l.scope}).includes('flat各命中反復'));
 crossWeapon.push({ammoLevel,hbg:h,lbg:l});
}
console.log(JSON.stringify({executionSha:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),rows,crossWeapon},null,2));w.close();
