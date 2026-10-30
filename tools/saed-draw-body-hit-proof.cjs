const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r253-saed-loading/fixture.json'));
assert.equal(f.decoration.kind,'weapon');assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.equal(f.skill.id,109);assert.equal(f.decoration.skills[0].skill.id,109);assert.equal(f.decoration.skills[0].level,2);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SAED');comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);


w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};calcBuild();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshot(),conditions:compareStep5Snapshot()})'));
const baseline=take(),mode=process.argv[2],cases=[];
const count=w.TechniqueDBEngine.get('charge-blade','CB_SAED').hits.length;assert.equal(count,3);
const off=Array(count).fill(false),patterns=[[off,off],[[true,false,false],[false,true,false]],[[true,false,true],[false,true,true]]];
for(const [i,[crit,power]] of patterns.entries()){
 w.eval(`build.charmCustom={skills:[{name:'抜刀術【技】',level:1},{name:'抜刀術【力】',level:3},{name:'会心撃【属性】',level:3}],slots:[0,0,0],weaponSlots:[]};`);
 for(const [prefix,flags] of [['Draw',crit],['Punishing',power]])for(const [ch,values] of [['Normal',off],['Maximum',flags]])w.document.getElementById('power'+prefix+'Hits'+ch).value=JSON.stringify({CB_SAED:values});
 w.calcBuild();const r=take();cases.push(r);w.eval(`buildName.value='draw-${i}';saveNamedBuild();`);
 if(mode==='before'){assert.notEqual(r.result.channels?.maximum?.execution?.status,'complete');continue;}
 for(const ch of ['normal','maximum']){
  const c=r.result.channels[ch];assert.equal(c.execution.status,'complete');const d=c.components[0].details,base=cases[0].result.channels[ch].components[0].details;
  assert.equal(d.components.elementalPhial,base.components.elementalPhial);assert.equal(d.trace.bodyHits.length,count);
  for(const [j,h] of d.trace.bodyHits.entries()){assert.equal(h.hitAttackAdd,ch==='maximum'&&power[j]?7:0);assert.equal(h.hitAffinityAdd,ch==='maximum'&&crit[j]?50:0);if(ch==='normal'||!crit[j]&&!power[j])assert.deepEqual(h,base.trace.bodyHits[j]);}
 }
}
let restored,comparison,invalid;
if(mode==='after'){
 w.applyBuildSnapshot(cases[1].snapshot);w.calcBuild();restored=take();assert.deepEqual(restored.result.channels,cases[1].result.channels);assert.deepEqual(restored.conditions.criticalDrawHits,cases[1].conditions.criticalDrawHits);assert.deepEqual(restored.conditions.punishingDrawHits,cases[1].conditions.punishingDrawHits);
 const before=take();w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);const after=take(),rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(rows.length,3);for(const row of rows)assert.deepEqual(row.result.channels,restored.result.channels);assert.deepEqual(after.conditions,before.conditions);assert.deepEqual(after.result,before.result);comparison={rows,before,after};
 w.document.getElementById('powerDrawHitsMaximum').value=JSON.stringify({CB_SAED:[true]});w.calcBuild();invalid=take();assert.notEqual(invalid.result.channels?.maximum?.execution?.status,'complete');assert.equal(invalid.result.channels.normal.execution.status,'complete');
}
console.log(JSON.stringify({mode,input:'Captured CB103; custom skill contract; explicit per-body flags, no timing inferred',baseline,cases,restored,comparison,invalid,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
