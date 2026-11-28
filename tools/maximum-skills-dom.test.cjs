const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const fixture=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/reports/r257-thunder-conversion/fixture.json')));
const skillDb=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../docs/reports/r263-skill-audit/mhdb-skills.json')));
function setup(t){
 const w=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 w.eval(`clearWeaponBuckets();const f=${JSON.stringify(fixture.weapon)};f.skills=[];DB.skills=${JSON.stringify(skillDb)};DB.weapons=[f];weaponIndexByKind['great-sword']=[f];weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">Fixture</option>';weapon.value='1081';App.build.setWeapon(f);
 DB.monsters=[{id:900,name:'Target',kind:'large',parts:[{id:901,name:'Soft',monster:{id:900},multipliers:{slash:.8,blunt:.8,pierce:.8,fire:.1,water:.1,thunder:.1,ice:.1,dragon:.3}},{id:902,name:'Hard',monster:{id:900},multipliers:{slash:.2,blunt:.2,pierce:.2,fire:.1,water:.1,thunder:.1,ice:.1,dragon:.3}}]}];
 renderMonsters();monster.value='900';renderMonsterParts();monsterPart.value='901';renderMonsterInfo();
 const save=(name,skills)=>{build.charmCustom={skills,slots:[0,0,0],weaponSlots:[]};calcBuild();buildName.value=name;saveNamedBuild();};
 save('A',[]);save('B',[{name:'挑戦者',level:5},{name:'弱点特効',level:5},{name:'無我の境地',level:3}]);
 `);
 return w;
}
function js(w,x){return JSON.parse(w.eval('JSON.stringify('+x+')'));}
function select(w,names){for(const x of w.document.querySelectorAll('[data-compare-name]')){x.checked=names.includes(x.dataset.compareName);x.dispatchEvent(new w.Event('change',{bubbles:true}));}}
function run(w){w.runBuildCompare();return js(w,'lastBuildComparisonRows.map(r=>({name:r.name,channels:Object.fromEntries(Object.entries(r.oneHitPipeline.channels).map(([k,c])=>[k,{metrics:c.metrics,components:c.components,effects:c.effectPlan.effects}]))}))');}
function controls(w){return [...w.document.querySelectorAll('#comparisonOptionalConditions [data-maximum-skill]')].filter(x=>!x.closest('[hidden]'));}
function set(w,id,on){const x=controls(w).find(x=>x.dataset.maximumSkill===id);assert.ok(x,id);x.checked=on;x.dispatchEvent(new w.Event('change',{bubbles:true}));}

test('maximum-only checkboxes follow equipped skills of selected builds (checked by default)',t=>{
 const w=setup(t);
 assert.equal(controls(w).length,0);
 select(w,['A']);assert.equal(controls(w).length,0);
 select(w,['A','B']);assert.deepEqual(controls(w).map(x=>x.dataset.maximumSkill),['agitator','weaknessExploit','frenzy']);
 assert.ok(controls(w).every(x=>x.checked));
 select(w,['A']);assert.equal(controls(w).length,0);
});

test('all maximum switch combinations preserve complete normal and unequipped row without changing saved or current state',t=>{
 const w=setup(t);select(w,['A','B']);
 const editor=js(w,'buildSnapshotComparable(buildSnapshot())'),stored=w.eval('storageGet(BUILDS_KEY)'),raw=js(w,'compareStep5Snapshot()');
 const on=run(w);assert.ok(on.every(x=>x.channels.maximum.metrics.comboTotalDamage.status==='available'));
 assert.equal(Object.hasOwn(w.createBuildComparisonReport().context.conditions,'maximumSkillConditions'),false,'default result keeps its previous report metadata');
 const keys=['agitator','weaknessExploit','frenzy'];
 for(let mask=0;mask<8;mask++){
  for(const [i,id] of keys.entries())set(w,id,Boolean(mask&(1<<i)));
  const rows=run(w);assert.deepEqual(rows[0],on[0]);assert.deepEqual(rows[1].channels.normal,on[1].channels.normal);
  assert.ok(rows[1].channels.maximum.metrics.comboTotalDamage.status==='available');
  if(mask<7)assert.ok(rows[1].channels.maximum.metrics.comboTotalDamage.value<on[1].channels.maximum.metrics.comboTotalDamage.value,'missing maximum effect mask '+mask);
 }
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),stored);assert.deepEqual(js(w,'buildSnapshotComparable(buildSnapshot())'),editor);assert.deepEqual(js(w,'compareStep5Snapshot()'),raw);
});

test('weakness keeps actual original hitzone and wound prerequisites in saved explicit route',t=>{
 const w=setup(t);select(w,['B']);
 w.eval(`const map=savedBuildMap();map.B.combo.moves=[{techniqueId:'GS_CHARGED_SLASH_3'}];storageSet(BUILDS_KEY,JSON.stringify(map));`);
 const max=x=>x[0].channels.maximum.metrics.comboTotalDamage.value;
 const delta=()=>{
  set(w,'weaknessExploit',true);const on=run(w);
  set(w,'weaknessExploit',false);const off=run(w);
  assert.deepEqual(off[0].channels.normal,on[0].channels.normal);
  return max(on)-max(off);
 };
 const soft=delta();assert.ok(soft>0);
 w.eval(`const map=savedBuildMap();map.B.target.partId='902';storageSet(BUILDS_KEY,JSON.stringify(map));`);
 assert.equal(delta(),0);
 w.eval(`const p=DB.monsters[0].parts[1];p.wounded=true;p.originalMultipliers={...p.multipliers};p.multipliers.slash=.85;`);
 assert.equal(delta(),0,'wound cannot turn a non-weak original part into a weakpoint');
 w.eval(`const p=DB.monsters[0].parts[1];p.originalMultipliers.slash=.8;p.multipliers.slash=.8;`);
 assert.ok(delta()>soft,'qualifying wound adds the established skills effect');
});

test('Frenzy checkbox suppresses Black II maximum attack and affinity, not the normal or direct explicit state',t=>{
 const w=setup(t);
 w.eval(`const black=DB.skills.find(x=>x.id===106);const base=${JSON.stringify(fixture.armor)};
 DB.armor=['head','chest','arms','waist'].map((kind,i)=>({...base,id:986700+i,kind,skills:[{...black.ranks[0],skill:black}]}));
 build.armor=Object.fromEntries(DB.armor.map(a=>[a.kind,a]));build.charmCustom={skills:[{name:'無我の境地',level:3}], slots:[0,0,0],weaponSlots:[]};calcBuild();buildName.value='Black-II';saveNamedBuild();`);
 select(w,['Black-II']);assert.deepEqual(controls(w).map(x=>x.dataset.maximumSkill),['frenzy']);
 const on=run(w)[0];assert.ok(on.channels.maximum.metrics.comboTotalDamage.value>on.channels.normal.metrics.comboTotalDamage.value);
 set(w,'frenzy',false);
 const off=run(w)[0];assert.deepEqual(off.channels.normal,on.channels.normal);
 assert.equal(off.channels.maximum.metrics.comboTotalDamage.value,on.channels.normal.metrics.comboTotalDamage.value);
 assert.equal(w.createBuildComparisonReport().context.conditions.maximumSkillConditions.frenzy,false);
 const direct=js(w,`MHResolveFrenzyAffinity({'無我の境地':3},'OVERCOME',false,{maximumSkillConditions:{frenzy:false}})`);
 assert.equal(direct.normalAdd,25);assert.equal(direct.maximumAdd,0);
});

test('set discovery does not show a skill from a locked set bonus or an incompatible jewel',t=>{
 const w=setup(t);
 w.eval(`const black=DB.skills.find(x=>x.id===106);const base=${JSON.stringify(fixture.armor)};
 DB.armor=[{...base,id:986701,kind:'head',skills:[{...black.ranks[0],skill:black}],slots:[]}];
 DB.decorations=[{id:986702,kind:'armor',slot:3,skills:[{skill:DB.skills.find(x=>x.id===144),level:1}]}];
 build.armor={head:DB.armor[0]};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={head0:'986702'};calcBuild();buildName.value='Not-equipped';saveNamedBuild();`);
 select(w,['Not-equipped']);assert.equal(controls(w).length,0);
});

test('changing maximum choices invalidates only ⑥ results, never the editor diagnostics',t=>{
 const w=setup(t);select(w,['B']);run(w);
 const editor=['dpsOut','groupProposalOut','comboReportOut','comboReportStatus'].map(id=>w.document.getElementById(id));
 editor.forEach((node,i)=>node.textContent='Unrelated editor content '+i);
 set(w,'agitator',false);
 assert.equal(w.createBuildComparisonReport(),null);
 assert.match(w.document.getElementById('compareOut').textContent,/もう一度比較/);
 assert.deepEqual(editor.map(node=>node.textContent),editor.map((_,i)=>'Unrelated editor content '+i));
});

test('maximum-only Weakness Exploit preserves the unrelated ID162 weapon-piece guard and normal Gunlance components',t=>{
 const w=setup(t);
 const pack=structuredClone(require('../tests/fixtures/offset-maximum-inputs.json').data), gl=require('../tests/fixtures/gl162-armor-only.json');
 pack.armor=pack.armor.filter(x=>!gl.armor.some(a=>a.id===x.id)).concat(gl.armor);
 pack.skills=pack.skills.filter(x=>!gl.skills.some(a=>a.id===x.id)).concat(gl.skills);
 const snapshot=structuredClone(gl.inputs[2]);
 snapshot.armor={head:'609',chest:'610',arms:'611'};snapshot.artia.seriesSkill='';
 w.__pack=pack;w.__input=snapshot;
 w.eval(`DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();
 applyBuildSnapshot(__input);aSeries.value='162';aSeries.onchange();calcBuild();buildName.value='GL-ID162';saveNamedBuild();`);
 select(w,['GL-ID162']);const [on]=run(w);
 set(w,'weaknessExploit',false);const [off]=run(w);
 assert.equal(off.channels.maximum.metrics.comboTotalDamage.status,'available');
 assert.ok(off.channels.maximum.components.some(x=>x.coefficientUnit==='SHELLING'&&x.status==='available'));
 assert.deepEqual(off.channels.normal,on.channels.normal);
 assert.ok(off.channels.maximum.metrics.comboTotalDamage.value<on.channels.maximum.metrics.comboTotalDamage.value);
 const blocked=w.eval(`lastBuildComparisonRows[0].oneHitPipeline.channels.maximum.diagnostics.ignoredSkillEffects?.some(x=>x.skillId===162)`);
 assert.equal(Boolean(blocked),false);
});

test('Fortify remains in the max-only group with its three values and compact wrapping layout',t=>{
 const w=setup(t), d=w.document;
 const group=d.getElementById('maximumSkillConditions'), fortify=d.getElementById('powerFortifyCount');
 const row=fortify.labels[0], layout=w.getComputedStyle(row.parentElement);
 assert.equal(fortify.closest('fieldset'),group);
 assert.equal(layout.display,'flex');
 assert.equal(layout.flexWrap,'wrap');
 assert.equal(layout.alignItems,'center');
 assert.deepEqual([...fortify.options].map(x=>x.value),['0','1','2']);
 assert.equal(fortify.value,'2');
 select(w,['B']);
 for(const control of controls(w)){
  const label=control.closest('label'), size=w.getComputedStyle(control);
  assert.equal(label.parentElement,row.parentElement);
  assert.equal(w.getComputedStyle(label).minHeight,w.getComputedStyle(row).minHeight);
  assert.equal(size.width,'16px');
  assert.equal(size.height,'16px');
 }
 for(const count of [0,1,2]){
  w.restoreStep5Snapshot({...w.compareStep5Snapshot(),fortifyCount:count});
  assert.equal(w.compareStep5Snapshot().fortifyCount,count);
 }
 assert.ok(d.getElementById('consumerSkillConditions').hidden);
});
