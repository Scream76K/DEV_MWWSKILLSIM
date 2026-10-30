const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const fixture=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json')),skills=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json'));const results={};
for(const kind of ['long-sword']){
 const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://water.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}).window;
 const weapon=kind==='long-sword'?JSON.parse(JSON.stringify(fixture.weapon)):{id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],coatings:['close-range']};weapon.skills=[];weapon.specials=[{kind:'element',element:'water',damage:{raw:50,display:500}}];
 const armors=[10,200,-30].map((v,i)=>({...fixture.armor,id:990001+i,kind:'head',skills:[],resistances:{fire:0,water:v,thunder:0,ice:0,dragon:0}}));
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=${JSON.stringify(skills)};DB.armor=${JSON.stringify(armors)};DB.decorations=[];weaponIndexByKind[${JSON.stringify(kind)}]=DB.weapons;weaponKind.value=${JSON.stringify(kind)};weapon.innerHTML='<option value="${weapon.id}">Contract</option>';weapon.value='${weapon.id}';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:${kind==='bow'?'BOW_SHOT_3':'LS_RED_BLADE_I'}');`);
 if(kind==='bow')w.eval("powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';");else w.eval("comboLSSpiritGauge.value='RED';");
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};
 const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));

 const mode=process.argv[2],cases=[];
 for(const [label,attribute,armor,expectedMaximum] of [['match','water',0,716],['other','fire',0,620],['missing','',0,null],['cap','water',1,1150]]){
  w.eval(`build.armor.head=DB.armor[${armor}];build.charmCustom.skills=[{name:'耐性変換【水】',level:1},{name:'属性吸収',level:3}];if(document.getElementById('powerAbsorbedElement'))powerAbsorbedElement.value='${attribute}';calcBuild();`);
  const r=take();cases.push({label,attribute,armor,expectedMaximum,...r});
  if(mode==='before'){assert.ok(r.result.reason.startsWith('REAL_SLICE:WATER_RESISTANCE_UNRESOLVED:'));continue;}
  assert.equal(r.result.channels.normal.execution.status,'complete');
  for(const ch of ['normal','maximum']){const c=r.result.channels[ch];if(ch==='maximum'&&expectedMaximum===null){assert.equal(c.execution.status,'incomplete');assert.ok(JSON.stringify(c).includes('ABSORPTION_ELEMENT_REQUIRED'));continue;}assert.equal(c.execution.status,'complete',JSON.stringify(r.result));assert.equal(c.diagnostics.waterResistanceConversion.effectiveElement,ch==='normal'?(armor===1?1150:540):expectedMaximum);}
  if(armor===0&&expectedMaximum!==null)w.eval(`buildName.value='${label}';saveNamedBuild();`);
 }
 let comparison,oldSnapshot;
 if(mode!=='before'){
  assert.deepEqual(cases[0].result.channels.normal.components,cases[1].result.channels.normal.components);assert.deepEqual(cases[0].result.channels.normal.components,cases[2].result.channels.normal.components);
  for(const c of cases)for(const ch of ['normal','maximum'])if(c.result.channels[ch].execution.status==='complete')assert.deepEqual(c.result.channels[ch].components.filter(x=>x.id.includes(':physical:')),cases[0].result.channels.normal.components.filter(x=>x.id.includes(':physical:')));
  w.applyBuildSnapshot(cases[0].snapshot);w.calcBuild();assert.deepEqual(take().result.channels,cases[0].result.channels);const before=take();w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(rows.length,2);for(const row of rows)assert.deepEqual(row.real.channels,cases[0].result.channels);assert.deepEqual(take(),before);comparison={rows,restored:true,sharedAbsorbedElement:'water',activeUnchanged:true};
  const old=JSON.parse(JSON.stringify(cases[0].snapshot));delete old.combo.explicitAffinityState.absorbedElement;w.applyBuildSnapshot(old);w.calcBuild();oldSnapshot=take();assert.equal(oldSnapshot.conditions.absorbedElement,null);assert.equal(oldSnapshot.result.channels.normal.execution.status,'complete');assert.equal(oldSnapshot.result.channels.maximum.execution.status,'incomplete');
 }
 results[kind]={cases,comparison,oldSnapshot};w.close();
}
console.log(JSON.stringify({results,scope:'Synthetic LS water500, armor water10/200, conversion181 Lv1 and absorption133 Lv3; no legal equipment/live game claim',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
