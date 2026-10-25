const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const {readSimulatorHtml}=require(process.cwd()+'/tools/dom-test-setup.cjs');
const rows=[...JSON.parse(fs.readFileSync('docs/reports/r254-artia-capacity-scope/records.json')),...JSON.parse(fs.readFileSync('docs/reports/r254-artia-rare8/mhdb-normal-rare8.json')).filter(x=>[305,828].includes(x.id))];
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=consolidateArtiaFixedVariantRows(${JSON.stringify(rows)});DB.armor=[];DB.skills=[];DB.decorations=[];build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
const results=[],boundaries=[],checks=[];const copy=x=>JSON.parse(JSON.stringify(x));
function select(id){w.eval(`{const chosen=DB.weapons.find(x=>x.id===${id});weaponIndexByKind[chosen.kind]=DB.weapons.filter(x=>x.kind===chosen.kind);weaponKind.value=chosen.kind;weapon.innerHTML='<option value="${id}">selected</option>';weapon.value='${id}';App.build.setWeapon(chosen);build.artia={production:'attack',element:'water',parts:['attack','attack','attack'],sameElementPartCount:3,restores:['none','none','none','none','none'],seriesSkill:'',groupSkill:''};renderArtia();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();}`);}

const singles=[];let before,after,comparison;
try{
 select(523);w.eval(`addCombo('canonical:HBG_NORMAL_AMMO_2');powerHbgAmmoLevel.value='2';powerHbgRange.value='CRITICAL';powerHbgNormalMode.value='0';powerHbgCapacity.value='2';powerHbgFullMagazine.value='YES';powerHbgShotOrdinal.value='1';`);
 for(const [name,count] of [['A',1],['B',2]]){
  w.eval(`build.artia.restores=${JSON.stringify(Array(count).fill('capacity:I'))};calcBuild();buildName.value='${name}';saveNamedBuild();`);
  singles.push(copy(w.eval('({real:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})')));
 }
 before=copy(w.eval('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),projection:realPipelineWeapon(selectedWeapon())})'));
 w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 comparison=copy(w.eval('({rows:lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})),display:compareOut.textContent})'));
 after=copy(w.eval('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),projection:realPipelineWeapon(selectedWeapon())})'));
 assert.equal(comparison.rows.length,2);
 for(const [i,name] of ['A','B'].entries()){
  const row=comparison.rows.find(x=>x.name===name);assert.ok(row);
  for(const ch of ['normal','maximum']){
   const c=row.real.channels[ch],s=singles[i].real.channels[ch];
   assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');assert.ok(Number.isFinite(c.metrics.comboTotalDamage.value));
   assert.equal(c.metrics.comboTotalDamage.value,s.metrics.comboTotalDamage.value);
   assert.equal(c.components.find(x=>x.details?.state).details.state.magazineCapacity,3+i);
   assert.equal(c.components.find(x=>x.details?.state).details.state.capacityEvidence.bonus,1+i);
   assert.ok(comparison.display.includes(c.metrics.comboTotalDamage.value.toFixed(1)));
  }
 }
 assert.equal(singles[0].real.channels.normal.metrics.comboTotalDamage.value,singles[1].real.channels.normal.metrics.comboTotalDamage.value);
 assert.deepEqual(after,before);assert.deepEqual(errors,[]);checks.push({pass:true});
}catch(e){checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify({base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),singles,before,after,comparison,checks},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
