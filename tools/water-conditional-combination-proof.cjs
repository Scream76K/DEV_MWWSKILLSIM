const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const fixture=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json')),skills=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json'));const results={};
for(const kind of ['long-sword','bow']){
 const w=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://water.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}).window;
 const weapon=kind==='long-sword'?JSON.parse(JSON.stringify(fixture.weapon)):{id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],coatings:['close-range']};weapon.skills=[];weapon.specials=[{kind:'element',element:'water',damage:{raw:50,display:500}}];
 const armors=[10,200,-30].map((v,i)=>({...fixture.armor,id:990001+i,kind:'head',skills:[],resistances:{fire:0,water:v,thunder:0,ice:0,dragon:0}}));
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=${JSON.stringify(skills)};DB.armor=${JSON.stringify(armors)};DB.decorations=[];weaponIndexByKind[${JSON.stringify(kind)}]=DB.weapons;weaponKind.value=${JSON.stringify(kind)};weapon.innerHTML='<option value="${weapon.id}">Contract</option>';weapon.value='${weapon.id}';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:${kind==='bow'?'BOW_SHOT_3':'LS_RED_BLADE_I'}');`);
 if(kind==='bow')w.eval("powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';");else w.eval("comboLSSpiritGauge.value='RED';");
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a)}};
 const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshot(),conditions:compareStep5Snapshot()})'));

 w.eval(`DB.weapons[0].skills=[{skill:DB.skills.find(x=>x.id===91),level:3},...${kind==='bow'?"[{skill:DB.skills.find(x=>x.id===24),level:3}]":"[]"}];build.armor.head=DB.armor[0];calcBuild();`);
 const baseline=take(),cases=[];
 w.eval(`DB.weapons[0].skills.push({skill:DB.skills.find(x=>x.id===13),level:3},{skill:DB.skills.find(x=>x.id===95),level:1});`);
 for(const on of [false,true]){
 w.eval(`build.charmCustom.skills=${on?"[{name:'耐性変換【水】',level:1}]":"[]"};calcBuild();`);const r=take();cases.push(r);
 for(const ch of ['normal','maximum']){const c=r.result.channels[ch];assert.equal(c?.execution?.status,'complete',JSON.stringify(r.result));const expected=(kind==='bow'?(ch==='normal'?750:893.5):(ch==='normal'?660:810))+(on?40:0);for(const z of c.components){if(kind==='bow')assert.ok(Math.abs(z.details.effectiveDisplayedElement-expected)<1e-9);else if(z.id.includes(':element:'))assert.ok(Math.abs(z.details.appliedElement-expected)<1e-9);}}
 w.eval(`buildName.value='condition-water-${on}';saveNamedBuild();`);
 }
 const physical=(r,ch)=>r.result.channels[ch].components.reduce((n,z)=>n+(kind==='bow'?z.details.physical:z.id.includes(':physical:')?z.value:0),0);
 for(const ch of ['normal','maximum'])assert.equal(physical(cases[1],ch),physical(cases[0],ch));
 assert.equal(physical(cases[0],'normal'),physical(baseline,'normal'));assert.ok(physical(cases[0],'maximum')>physical(baseline,'maximum'));
 let comparison;
 if(kind==='bow'){const before=take();w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(rows.length,2);for(const [i,on] of [false,true].entries())assert.deepEqual(rows.find(x=>x.name==='condition-water-'+on).result.channels,cases[i].result.channels);const after=take();assert.deepEqual(after.result,before.result);assert.deepEqual(after.conditions,before.conditions);assert.deepEqual(w.buildSnapshotComparable(after.snapshot),w.buildSnapshotComparable(before.snapshot));comparison={rows,activeUnchanged:true};}
 const negative=adapter.evaluateCurrent({...captured,stats:{...captured.stats,waterResistanceInput:{status:'UNRESOLVED',reason:'CONTRACT_MISSING_RESISTANCE'}}});assert.equal(negative.reason,'REAL_SLICE:WATER_RESISTANCE_UNRESOLVED:CONTRACT_MISSING_RESISTANCE');
 results[kind]={baseline,cases,comparison,negative,physical:{baselineNormal:physical(baseline,'normal'),baselineMaximum:physical(baseline,'maximum'),conditionNormal:physical(cases[0],'normal'),conditionMaximum:physical(cases[0],'maximum'),waterMaximum:physical(cases[1],'maximum')}};w.close();
}
console.log(JSON.stringify({scope:'Synthetic LS/Bow water500 with Water Attack3, Coalescence3/Burst1, Bow CM3; not legal-equipment/game verification',results,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));
