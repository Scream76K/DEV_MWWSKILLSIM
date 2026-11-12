'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),{JSDOM,VirtualConsole}=require('jsdom'),f=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/selected-hp-inputs.json'))),pack=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/offset-maximum-inputs.json'))).data;
const near=(a,b,label)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
test('selected HP 87/154 all ranks both channels 14 weapons, save and shared conditions',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://hp-selection.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 let count=0;const fd=process.env.HP_RESULT_FILE?fs.openSync(process.env.HP_RESULT_FILE,'wx'):null;
 try{w.__pack={...structuredClone(pack),armor:structuredClone(f.armor)};w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 assert.deepEqual([...w.document.getElementById('powerSelectedHp').options].map(o=>o.value),['FULL_HP','AT_OR_BELOW_30_PERCENT']);assert.equal(w.document.getElementById('powerSelectedHp').value,'FULL_HP');
 const run=(input,label)=>{const old=JSON.stringify(input);w.applyBuildSnapshot(structuredClone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));assert.equal(JSON.stringify(input),old);count++;if(fd!==null)fs.writeSync(fd,JSON.stringify({label,input,result})+'\n');return result;};
 for(const p of f.profiles)for(const id of [87,154])for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT'])for(const lv of [0,1,2,3,4,5]){
  const input=structuredClone(p.input);input.selectedHp=hp;input.charmCustom.skills=lv?[{name:id===87?'火事場力':'フルチャージ',level:lv}]:[];
  const label=[id,p.kind,hp,lv].join(':'),r=run(input,label),m=id===87&&hp==='AT_OR_BELOW_30_PERCENT'?[1,1,1.05,1.05,1.1,1.3][lv]:1,flat=id===154&&hp==='FULL_HP'?[0,3,6,10,15,20][lv]:0,expected=p.K*m+p.J+p.flatSlope*flat;
  for(const ch of ['normal','maximum']){assert.equal(r.channels[ch].metrics.comboTotalDamage.status,'available');near(r.channels[ch].metrics.comboTotalDamage.value,expected,label+ch);assert.equal(r.channels[ch].diagnostics.selectedHpPolicy.selectedHp,hp);}
  assert.ok(!JSON.stringify(r).includes('IGNORED_UNSUPPORTED_EFFECT'),label);
  if(lv===5){const saved=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.equal(saved.selectedHp,hp);assert.deepEqual(run(saved,label+':restore'),r);assert.equal(w.document.getElementById('powerSelectedHp').value,hp);assert.ok(w.document.getElementById('buildSummary').textContent.includes(hp==='FULL_HP'?'HP最大':'HP30%以下'));}
 }
 // Owner decision: missing/legacy HP defaults FULL in both output channels, without rewriting input.
 for(const p of f.profiles){const input=structuredClone(p.input);input.charmCustom.skills=[{name:'火事場力',level:5},{name:'フルチャージ',level:5}];const r=run(input,p.kind+':legacy-unselected');for(const ch of ['normal','maximum']){near(r.channels[ch].metrics.comboTotalDamage.value,p.K+p.J+20*p.flatSlope,'legacy FULL');assert.equal(r.channels[ch].diagnostics.selectedHpPolicy.status,'SELECTED');}assert.equal(w.document.getElementById('powerSelectedHp').value,'FULL_HP');}
 // Missing, empty and historical UNSELECTED normalize only during restore.
 const legacyBase=structuredClone(f.profiles[0].input);legacyBase.charmCustom.skills=[{name:'フルチャージ',level:5}];
 const full=run({...legacyBase,selectedHp:'FULL_HP'},'normalization reference');
 for(const selectedHp of [undefined,null,'','UNSELECTED']){const input={...legacyBase,selectedHp},old=JSON.stringify(input);run({...legacyBase,selectedHp:'AT_OR_BELOW_30_PERCENT'},'prior LOW');assert.deepEqual(run(input,'legacy normalize'),full);assert.equal(JSON.stringify(input),old);assert.equal(JSON.parse(w.eval('JSON.stringify(buildSnapshot())')).selectedHp,'FULL_HP');w.restoreStep5Snapshot({selectedHp});assert.equal(w.document.getElementById('powerSelectedHp').value,'FULL_HP');}
 // Reject corrupt saved HP before mutating the current build.
 const prior=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))');for(const selectedHp of ['UNKNOWN',30,false,{},[]])assert.throws(()=>w.applyBuildSnapshot({...structuredClone(f.profiles[0].input),selectedHp}),/SELECTED_HP_INVALID/);assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'),prior);
 assert.deepEqual(errors,[]);assert.equal(count,415);
 }finally{if(fd!==null)fs.closeSync(fd);w.close();}
});
test('selected HP shared saved comparison, attached155/178 and attack-component order',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://hp-roundtrip.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const log=[];try{w.__pack={...structuredClone(pack),armor:structuredClone(f.armor)};w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const run=(input,label)=>{w.applyBuildSnapshot(structuredClone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));log.push({input,label,result});return result;};
 for(const p of f.profiles)for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT']){
  const input={...structuredClone(p.input),selectedHp:hp,armor:{head:152,chest:153,arms:154}};const r=run(input,'155:'+p.kind+hp),add=hp==='FULL_HP'?3:0;
  near(r.channels.normal.metrics.comboTotalDamage.value,p.K+p.J+p.flatSlope*add,'155 normal');near(r.channels.maximum.metrics.comboTotalDamage.value,p.K+p.J+p.flatSlope*(add+10),'155 maximum');
 }
 for(const p of f.profiles.filter(p=>['charge-blade','heavy-bowgun'].includes(p.kind)))for(const rank of [1,2]){
  const input={...structuredClone(p.input),armor:rank===1?{head:670,chest:671}:{head:670,chest:671,arms:672,waist:673},selectedHp:'FULL_HP'},full=run(input,'178 FULL '+p.kind+rank),low=run({...input,selectedHp:'AT_OR_BELOW_30_PERCENT'},'178 LOW '+p.kind+rank);
  for(const ch of ['normal','maximum']){assert.equal(full.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(low.channels[ch].metrics.comboTotalDamage.status,'available');}
  const routes=r=>r.routes?Object.values(r.routes):[r];const a=routes(full),b=routes(low);for(let j=0;j<a.length;j++)for(const ch of ['normal','maximum'])for(let i=0;i<(a[j].channels[ch].components||[]).length;i++){const x=a[j].channels[ch].components[i],y=b[j].channels[ch].components[i];if(x.id.includes(':element:'))near(x.value,y.value,'178 element independent of HP');}
 }
 const p=f.profiles.find(p=>p.kind==='great-sword'),a=structuredClone(p.input),b=structuredClone(p.input);a.selectedHp='FULL_HP';a.charmCustom.skills=[{name:'フルチャージ',level:5}];b.selectedHp='AT_OR_BELOW_30_PERCENT';
 run(a,'saveA');w.eval("buildName.value='HP-A';saveNamedBuild();");run(b,'saveB');w.eval("buildName.value='HP-B';saveNamedBuild();");
 for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT']){
  w.document.getElementById('powerSelectedHp').value=hp;w.document.getElementById('calcBuild').click();const storageBefore=w.eval('JSON.stringify(savedBuildMap())'),before=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))');
  w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
  const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows)'));assert.equal(rows.length,2);for(const row of rows)for(const ch of ['normal','maximum']){near(row.oneHitPipeline.channels[ch].metrics.comboTotalDamage.value,p.K+p.J+(row.name==='HP-A'&&hp==='FULL_HP'?20*p.flatSlope:0),'shared selected HP comparison');assert.equal(row.oneHitPipeline.channels[ch].diagnostics.selectedHpPolicy.selectedHp,hp);}
  assert.equal(w.eval('JSON.stringify(savedBuildMap())'),storageBefore);assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'),before);log.push({label:'comparison '+hp,rows,storageUnchanged:true});
 }
 const st={attack:220,attackTrue:220,attackComponents:{weaponBase:200,normalMultiplier:1.05,normalFlat:10},element:0,affinity:0,activeBonusEffects:[]};
 for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT']){const q=w.MHWStandardPowerConditionPlan(st,{'火事場力':5,'フルチャージ':5},'great-sword',{selectedHp:hp});for(const ch of ['normal','maximum'])near(q[ch].attackTrue,hp==='FULL_HP'?240:283,'flat outside heroics');}
 assert.deepEqual(errors,[]);if(process.env.HP_ROUNDTRIP_FILE)fs.writeFileSync(process.env.HP_ROUNDTRIP_FILE,JSON.stringify({publicRuns:38,comparisons:2,rows:log,errors},null,2));
 }finally{w.close();}
});
