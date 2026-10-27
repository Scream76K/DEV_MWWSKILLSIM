const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r259-hbg-element-skill/fixture.json'));assert.equal(f.weapon.id,467);assert.equal(f.weapon.slots[0],2);assert.equal(f.decoration.id,35);assert.equal(f.decoration.kind,'weapon');assert.ok(f.decoration.slot<=f.weapon.slots[0]);assert.ok(f.decoration.skills.some(x=>x.skill.id===127&&x.level===2));assert.ok(f.weapon.ammo.some(x=>x.kind==='thunder'&&x.level===1&&x.capacity===7));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.skills=${JSON.stringify(f.skills)};DB.decorations=[${JSON.stringify(f.decoration)}];weaponIndexByKind['heavy-bowgun']=DB.weapons;weaponKind.value='heavy-bowgun';weapon.innerHTML='<option value="467">ホープキャノンⅣ</option>';weapon.value='467';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:HBG_ELEMENT_FIRST_HIT_REFERENCE');powerHbgElementType.value='thunder';powerHbgAmmoLevel.value='1';powerHbgNormalMode.value='0';powerHbgRange.value='CRITICAL';calcBuild();`);

let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
const rows=[];for(const level of [2,3]){
 const skills=[['見切り',1],['弾導強化',level]];
 const result=adapter.evaluateCurrent({...args,skills,equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum']){const c=result.channels[ch];assert.equal(c.execution.status,'complete',JSON.stringify(result));const d=c.components[0].details;assert.ok(Math.abs(d.element-9.6)<1e-9);assert.ok(Math.abs(d.physical-(level===2?10.3424:10.6656))<1e-9);}
 rows.push({level,result});
}
const contrasts=[];for(const range of ['CRITICAL','FAR']){
 const base={weaponKind:'heavy-bowgun',ammoLevel:1,range,attack:160,affinity:0,criticalMultiplier:1.25,physicalHitzone:80,elementalHitzone:30,elementMultiplier:1.1,elementFlat:50};
 const a=w.BowgunElementReference.firstHit(base,w.TechniqueDBEngine),b=w.BowgunElementReference.firstHit({...base,criticalRangeAttackAdd:w.MHCommonSkillDamageRules.ballistics.criticalRangeAttackAdds[3]},w.TechniqueDBEngine);
 assert.equal(a.element,b.element);assert.equal(a.flatElement,b.flatElement);assert.equal(b.physicalAttackAdd,range==='CRITICAL'?5:0);if(range==='FAR')assert.equal(a.physical,b.physical);contrasts.push({range,a,b});
}
console.log(JSON.stringify({scope:'HBG_ELEMENT_PUBLIC_PIPELINE_BALLISTICS_PHYSICAL_ONLY_AND_RANGE_CONTRACT',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','bowgun-element-reference.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows,contrasts},null,2));w.close();
