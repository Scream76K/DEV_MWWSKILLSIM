const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
const weapon={id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:10,slots:[],skills:[{skill:{id:144,name:'挑戦者'},level:1}],specials:[],coatings:[]};
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};weaponIndexByKind.bow=DB.weapons;weaponKind.value='bow';weapon.innerHTML='<option value="999001">Contract</option>';weapon.value='999001';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};renderComboForWeapon();powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
const cases=[];let failed;
try{
for(const [label,level,pierce,repeat,extra,range] of [['off',0,0,false,null,'CRITICAL'],['pierce',0,1,false,null,'CRITICAL'],['combined',2,1,false,null,'CRITICAL'],['invalid',0,2,false,null,'CRITICAL'],['range',0,1,false,null,'NEAR']]){
 if(label==='invalid')w.eval("DB.skills.find(x=>x.id===94).ranks.push({level:2,skill:{id:94}});");
 w.eval(`powerBowRange.value='${range}';App.state.combo.moves=${JSON.stringify(Array.from({length:repeat?2:1},()=>({techniqueId:'canonical:BOW_THOUSAND_DRAGONS'})))};restoreComboRows();build.charmCustom={skills:[{name:'攻撃',level:5}${level?`,{name:'特殊射撃強化',level:${level}}`:''}${extra?`,{name:'${extra}',level:1}`:''}${pierce?`,{name:'貫通弾・竜の矢強化',level:${pierce}}`:''}],slots:[0,0,0],weaponSlots:[]};calcBuild();`);
 const row={label,level,pierce,...take()};cases.push(row);
 if(label==='invalid'){assert.ok(JSON.stringify(row.result).includes('BOW_THOUSAND:PIERCE_SKILL_CONTRACT_INVALID'));w.eval("DB.skills.find(x=>x.id===94).ranks.pop();");continue;}
 if(repeat||extra||range!=='CRITICAL'){assert.ok(JSON.stringify(row.result).includes('BOW_THOUSAND:'));continue;}
 assert.equal(row.result.channels?.normal?.execution.status,'complete',JSON.stringify(row.result));
 for(const ch of ['normal','maximum']){const c=row.result.channels[ch].components[0],r=c.details;assert.equal(r.hitCount,6);assert.equal(r.shotCount,1);assert.equal(r.chargeLevelApplied,false);assert.equal(r.trace.length,6);const expected=(90*1.04+9+(ch==='maximum'?4:0))*.25*.8*(1+(10+(ch==='maximum'?3:0))/100*.25)*1.1*(1+level*.1)*(pierce?1.05:1)*6;assert.ok(Math.abs(c.value-expected)<1e-8,`${c.value} != ${expected}`);}
 if(pierce)w.eval(`buildName.value='${label}';saveNamedBuild();`);
}
w.restoreStep5Snapshot(cases[2].conditions);w.applyBuildSnapshot(cases[2].snapshot);w.calcBuild();const current=take();assert.deepEqual(current.result.channels,cases[2].result.channels);w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(rows.length,2);for(const r of rows)assert.deepEqual(r.result.channels,cases.find(c=>c.label===r.name).result.channels);assert.deepEqual(take(),current);cases.push({comparison:rows,restored:true});
}catch(e){failed=String(e.stack||e);process.exitCode=1;}
console.log(JSON.stringify({cases,failed,scope:'synthetic equipment public JSDOM calcBuild; no live game or legality validation',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','bow-reference.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
