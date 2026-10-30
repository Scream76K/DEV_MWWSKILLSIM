const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r253-saed-loading/fixture.json'));
assert.equal(f.decoration.kind,'weapon');assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.equal(f.skill.id,109);assert.equal(f.decoration.skills[0].skill.id,109);assert.equal(f.decoration.skills[0].level,2);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(process.argv[2]==='before-fixed'?fs.readFileSync('/tmp/saed-mindseye-before/index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>/^(?:[a-z]+:)?\/\//i.test(src)?tag:`<script${a}${b}>${fs.readFileSync(src==='hope-hammer-browser-adapter.js'?'/tmp/saed-mindseye-before/'+src:src,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`):readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SAED');comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);


w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};calcBuild();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));

const mode=process.argv[2].startsWith('before')?'before':'after',cases=[];
w.eval(`DB.weapons[0].skills=[(()=>{const skill=DB.skills.find(x=>x.id===72);return {...skill.ranks[4],skill};})()];const originalTraining=trainingRoomMonster;window.testOriginalHz=44;window.testWounded=true;trainingRoomMonster=function(){const x=JSON.parse(JSON.stringify(originalTraining()));const p=x.parts.find(p=>p.id==='training-front');p.wounded=window.testWounded;p.multipliers.slash=.6;if(window.testOriginalHz===null)delete p.originalMultipliers;else p.originalMultipliers={...p.multipliers,slash:window.testOriginalHz/100};return x;};`);
for(const [label,level,original] of [['off',0,44],['active',3,44],['inactive',3,45],['missing',3,null]]){
 w.eval(`testOriginalHz=${original};build.charmCustom.skills=[{name:'抜刀術【力】',level:3},{name:'挑戦者',level:1}${level?",{name:'心眼',level:3}":''}];`);
 for(const ch of ['Normal','Maximum'])w.document.getElementById('powerPunishingHits'+ch).value=JSON.stringify({CB_SAED:[false,true,false]});
 w.calcBuild();const r=take();cases.push({label,...r});
 if(mode==='before')continue;
 if(label==='missing'){assert.equal(r.result.channels.normal.metrics.comboTotalDamage.status,'unavailable');assert.ok(JSON.stringify(r.result).includes('ORIGINAL_HITZONE_UNRESOLVED'));continue;}
 for(const ch of ['normal','maximum']){
  assert.equal(r.result.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify(r.result));
  const d=r.result.channels[ch].components[0].details,b=cases[0].result.channels[ch].components[0].details;
  assert.equal(d.components.elementalPhial,b.components.elementalPhial);assert.equal(d.components.elementalBody,b.components.elementalBody);
  for(const [i,h] of d.trace.bodyHits.entries()){
   const old=b.trace.bodyHits[i];assert.equal(h.hitAttackAdd,i===1?7:0);assert.equal(h.affinity,old.affinity);
   if(label==='active'){const c=d.trace.bodyAttackBasis;const expected=c.weaponBase*c.normalMultiplier*1.3+c.normalFlat+h.hitAttackAdd;assert.equal(h.effectiveAttack,expected);assert.ok(Math.abs(h.physical-old.physical*(expected/(c.weaponBase*c.normalMultiplier+c.normalFlat+h.hitAttackAdd)))<1e-9);}
   if(label==='inactive')assert.equal(h.physical,old.physical);
  }
 }
 if(label==='active')w.eval(`buildName.value='mindseye-active';saveNamedBuild();`);
}
let comparison;
if(mode==='after'){
 w.applyBuildSnapshot(cases[1].snapshot);w.testOriginalHz=44;w.calcBuild();const current=take();assert.deepEqual(current.result.channels,cases[1].result.channels);
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(rows.length,1);assert.deepEqual(rows[0].result.channels,current.result.channels);assert.deepEqual(take(),current);comparison={rows,currentUnchanged:true,normalLoadMatches:true,scope:'one saved build vs current shared conditions, not two saved builds'};
}
console.log(JSON.stringify({mode,cases,comparison,scope:'Synthetic CB103 weapon Attack5 and charm Punishing3/Agitator1/MindsEye3; original44/current60 wounded. Public calcBuild JSDOM; not game/equipment validation.',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(process.argv[2]==='before-fixed'&&['index.html','hope-hammer-browser-adapter.js'].includes(p)?'/tmp/saed-mindseye-before/'+p:p)).digest('hex')]))},null,2));w.close();
