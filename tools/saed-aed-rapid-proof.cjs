const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r253-saed-loading/fixture.json'));
assert.equal(f.decoration.kind,'weapon');assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.equal(f.skill.id,109);assert.equal(f.decoration.skills[0].skill.id,109);assert.equal(f.decoration.skills[0].level,2);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(process.argv[2]==='before-fixed'?fs.readFileSync('/tmp/saed-mindseye-before/index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>/^(?:[a-z]+:)?\/\//i.test(src)?tag:`<script${a}${b}>${fs.readFileSync(src==='hope-hammer-browser-adapter.js'?'/tmp/saed-mindseye-before/'+src:src,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`):readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SAED');comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);


w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};calcBuild();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));


const mode=process.argv[2]||'after',cases=[];
w.eval(`DB.weapons[0].skills=[(()=>{const skill=DB.skills.find(x=>x.id===72);return {...skill.ranks[4],skill};})()];`);
function run(label,level,previous='CB_AED',id='CB_SAED_AED_DERIVED'){
 w.eval(`App.state.combo.moves=[{techniqueId:'${id}'}];restoreComboRows();comboCBPreviousAction.value='${previous}';build.charmCustom.skills=[{name:'抜刀術【力】',level:3},{name:'挑戦者',level:1},...(${level}?[{name:'高速変形',level:${level}}]:[])];`);
 for(const ch of ['Normal','Maximum'])w.document.getElementById('powerPunishingHits'+ch).value=JSON.stringify({[id]:[false,true,false]});
 w.calcBuild();const r={label,...take()};cases.push(r);return r;
}
const off=run('off',0),on=run('aed-Lv3',3);
if(mode==='before'){assert.ok(JSON.stringify(on.result).includes('RAPID_MORPH_TECHNIQUE_SCOPE_UNRESOLVED'));}
let comparison;
if(mode==='after'){
 for(const ch of ['normal','maximum']){
  assert.equal(on.result.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify(on.result));
  const d=on.result.channels[ch].components[0].details,b=off.result.channels[ch].components[0].details;
  assert.equal(d.components.elementalBody,b.components.elementalBody);assert.equal(d.components.elementalPhial,b.components.elementalPhial);
  const c=d.trace.bodyAttackBasis;assert.ok(c.normalFlat>0);
  for(const [i,h] of d.trace.bodyHits.entries()){assert.equal(h.hitAttackAdd,0);assert.equal(h.effectiveAttack,c.weaponBase*c.normalMultiplier*1.2+c.normalFlat+h.hitAttackAdd);assert.equal(h.affinity,b.trace.bodyHits[i].affinity);assert.ok(h.physical>b.trace.bodyHits[i].physical);}
 }
 for(const r of [off,on]){w.applyBuildSnapshot(r.snapshot);w.calcBuild();w.eval(`buildName.value=${JSON.stringify(r.label)};saveNamedBuild();`);}
 w.applyBuildSnapshot(on.snapshot);w.calcBuild();const current=take(),storage=JSON.stringify(w.localStorage);assert.deepEqual(current.result.channels,on.result.channels);
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");comparison=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(comparison.length,2);for(const r of comparison)assert.deepEqual(r.result.channels,(r.name==='off'?off:on).result.channels);assert.deepEqual(take(),current);assert.equal(JSON.stringify(w.localStorage),storage);
 for(const r of [run('missing',3,''),run('other-origin',3,'SHIELD_THRUST')])assert.ok(JSON.stringify(r.result).includes('CB_RAPID_MORPH_ORIGIN_UNRESOLVED'));const wrong=run('wrong-guard',3,'GUARD','CB_SAED_AED_DERIVED');assert.ok(JSON.stringify(wrong.result).includes('CB_RAPID_MORPH_ORIGIN_UNRESOLVED'));const guard=run('existing-guard',3,'GUARD','CB_SAED');assert.equal(guard.result.channels.normal.metrics.comboTotalDamage.status,'available');assert.equal(guard.result.channels.normal.components[0].details.trace.bodyAttackMultiplier,1.2);
 const lv1=run('Lv1-missing',1,'');assert.deepEqual(lv1.result.channels.normal.metrics,off.result.channels.normal.metrics);
}
console.log(JSON.stringify({mode,cases,comparison,scope:'Public calcBuild JSDOM, synthetic CB103 Attack5/Punishing3/Agitator1/RapidMorph3. AED predecessor shared, one AED-derived SAED; excluded draw skills retained but no effect, no live equipment/game verification. No F01 injection/full regression.',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
