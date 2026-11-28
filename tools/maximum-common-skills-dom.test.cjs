const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const fixture=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/reports/r257-thunder-conversion/fixture.json')));
const skillDb=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/reports/r263-skill-audit/mhdb-skills.json')));
// Canonical MHDB ranks are equipped individually on a saved Great Sword build.
const COMMON=[
 ['maximumMight','渾身',99,3],
 ['latentPower','力の解放',142,5],
 ['adrenalineRush','巧撃',120,5],
 ['counterstrike','逆襲',81,3],
 ['burst','連撃',95,5],
 ['wetBladeMark','濡れ刃紋',39,3],
 ['offensiveGuard','攻めの守勢',66,3],
 ['coalescence','災禍転福',13,3],
];
function setup(t){
 const w=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 w.eval(`clearWeaponBuckets();const f=${JSON.stringify(fixture.weapon)};f.skills=[];DB.skills=${JSON.stringify(skillDb)};DB.weapons=[f];weaponIndexByKind['great-sword']=[f];weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">Fixture</option>';weapon.value='1081';App.build.setWeapon(f);
 DB.monsters=[{id:900,name:'Target',kind:'large',parts:[{id:901,name:'Soft',monster:{id:900},multipliers:{slash:.8,blunt:.8,pierce:.8,fire:.1,water:.1,thunder:.1,ice:.1,dragon:.3}},{id:902,name:'Hard',monster:{id:900},multipliers:{slash:.2,blunt:.2,pierce:.2,fire:.1,water:.1,thunder:.1,ice:.1,dragon:.3}}]}];
 renderMonsters();monster.value='900';renderMonsterParts();monsterPart.value='901';renderMonsterInfo();
 const save=(name,skills)=>{build.charmCustom={skills,slots:[0,0,0],weaponSlots:[]};calcBuild();buildName.value=name;saveNamedBuild();};
 save('Clean',[]);
 for(const [key,name,id,level] of ${JSON.stringify(COMMON)}){
   const skill=DB.skills.find(x=>x.id===id&&x.name===name&&x.ranks.some(y=>y.level===level));
   if(!skill)throw Error('Missing canonical MHDB skill rank '+name);
   save(key,[{name,level,type:'armor'}]);
 }
 save('Editor',[{name:'火事場力',level:5,type:'armor'}]);

 `);
 return w;
}
function js(w,x){return JSON.parse(w.eval('JSON.stringify('+x+')'));}
function select(w,names){for(const x of w.document.querySelectorAll('[data-compare-name]')){x.checked=names.includes(x.dataset.compareName);x.dispatchEvent(new w.Event('change',{bubbles:true}));}}
function run(w){w.runBuildCompare();return js(w,'lastBuildComparisonRows.map(r=>({name:r.name,channels:Object.fromEntries(Object.entries(r.oneHitPipeline.channels).map(([k,c])=>[k,{metrics:c.metrics,components:c.components,effects:c.effectPlan.effects}]))}))');}
function controls(w){return [...w.document.querySelectorAll('#comparisonOptionalConditions [data-maximum-skill]')].filter(x=>!x.closest('[hidden]'));}

function maximum(row){
 const metric=row.channels.maximum.metrics.comboTotalDamage;
 assert.equal(metric.status,'available',JSON.stringify(row));
 assert.ok(Number.isFinite(metric.value));
 return metric.value;
}

test('equipped applicable common maximum skills: switches change only selected maxima',async t=>{
 const w=setup(t),d=w.document,heroics=d.getElementById('powerHeroicsToggle');
 const details=d.getElementById('comparisonOptionalConditions');
 assert.equal(details.open,false);
 assert.equal(heroics.checked,false);
 assert.ok(!heroics.closest('#maximumSkillConditions'));
 assert.equal(d.getElementById('powerSelectedHp').value,'FULL_HP');
 assert.deepEqual(controls(w),[]);
 select(w,['Clean']);
 assert.deepEqual(controls(w),[]);
 const stored=w.eval('storageGet(BUILDS_KEY)'),editor=js(w,'buildSnapshotComparable(buildSnapshot())'),conditions=js(w,'compareStep5Snapshot()');
 const selectAndRun=key=>{select(w,['Clean',key]);return Object.fromEntries(run(w).map(r=>[r.name,r]));};
 for(const [key,label] of COMMON)await t.test(label,t=>{
  const before=selectAndRun(key);
  const normal=before[key].channels.normal.metrics.comboTotalDamage;
  assert.equal(normal.status,'available');
  assert.ok(maximum(before[key])>maximum(before.Clean),'fixture must produce a real adopted maximum-only effect');
  const visible=controls(w);
  assert.deepEqual(visible.map(x=>x.dataset.maximumSkill),[key],label+' must expose exactly its own applicable switch');
  const box=visible[0];
  assert.equal(box.type,'checkbox');assert.equal(box.closest('label').textContent.trim(),label);
  assert.equal(box.checked,true);
  assert.equal(Object.hasOwn(w.createBuildComparisonReport().context.conditions,'maximumSkillConditions'),false,'default does not change stored comparison assumptions');
  box.click();
  assert.equal(box.checked,false);
  const after=Object.fromEntries(run(w).map(r=>[r.name,r]));
  assert.deepEqual(after[key].channels.normal,before[key].channels.normal,'normal metrics, components and effect plan stay byte-for-byte equivalent');
  assert.deepEqual(after.Clean,before.Clean,'unequipped comparison row stays unchanged');
  assert.ok(maximum(after[key])<maximum(before[key]));
  assert.equal(maximum(after[key]),maximum(after.Clean),'turning off isolated skill restores clean maximum');
  assert.equal(w.createBuildComparisonReport().context.conditions.maximumSkillConditions[key],false);
  t.diagnostic(JSON.stringify({label,normal:normal.value,on:maximum(before[key]),off:maximum(after[key])}));
  select(w,['Clean']);assert.deepEqual(controls(w),[]);
  const restored=selectAndRun(key);
  assert.equal(controls(w).find(x=>x.dataset.maximumSkill===key)?.checked,true,'leaving all eligible selected builds resets hidden switch');
  assert.deepEqual(restored,before);
 });
 select(w,['Clean','Editor']);
 assert.deepEqual(controls(w),[],'heroics belongs to its pre-existing dedicated HP control, not an independent maximum checklist');
 assert.equal(details.open,false);
 assert.equal(heroics.checked,false);
 assert.equal(d.getElementById('powerSelectedHp').value,'FULL_HP');
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),stored);
 assert.deepEqual(js(w,'buildSnapshotComparable(buildSnapshot())'),editor);
 assert.deepEqual(js(w,'compareStep5Snapshot()'),conditions);
});

test('Fortify choices appear only with an active three-piece set in a selected build',t=>{
 const w=setup(t),row=w.document.getElementById('powerFortifyCount').labels[0];
 assert.equal(row.hidden,true);
 const source=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
 w.__armor=JSON.stringify(source.armor.filter(a=>[1,2,3].includes(a.id)));
 w.__sets=JSON.stringify(source.sets.filter(s=>s.id===1));
 w.eval(`DB.armor=JSON.parse(__armor);DB.sets=JSON.parse(__sets);
   const saveSet=(n)=>{build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.armor=Object.fromEntries(DB.armor.slice(0,n).map(a=>[a.kind,a]));calcBuild();buildName.value='Set'+n;saveNamedBuild();};saveSet(2);saveSet(3);`);
 select(w,['Set2']);assert.equal(row.hidden,true);
 select(w,['Set2','Set3']);assert.equal(row.hidden,false);
 assert.equal(row.querySelector('select').value,'2');
 select(w,['Clean']);assert.equal(row.hidden,true);
});
