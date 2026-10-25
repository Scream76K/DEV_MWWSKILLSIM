const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
let html=require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml();
const adapterPath='hope-hammer-browser-adapter.js',adapter=process.env.BEFORE_ADAPTER_SHA?cp.execFileSync('git',['show',process.env.BEFORE_ADAPTER_SHA+':'+adapterPath],{encoding:'utf8'}):fs.readFileSync(adapterPath,'utf8');
if(process.env.BEFORE_ADAPTER_SHA)html=html.replace(fs.readFileSync(adapterPath,'utf8'),adapter);
const f=JSON.parse(fs.readFileSync(process.env.CB_MORPH_FIXTURE||'/tmp/cb-morph-fixture.json'));assert.equal(f.decoration.skills[0].skill.id,7);assert.equal(f.decoration.skills[0].level,3);assert.ok(f.weapon.slots[0]>=f.decoration.slot);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window,copy=x=>JSON.parse(JSON.stringify(x));
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];DB.armor=[];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="147">Tempus Gear</option>';weapon.value='147';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.artia={production:'attack',element:'water',parts:['attack','attack','attack'],sameElementPartCount:3,restores:['none','none','none','none','none'],seriesSkill:'',groupSkill:''};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='IMPACT';comboCBEnhancedPhial.value='1';`);
const results=[],checks=[];let blocked,comparison;
for(const id of ['CB_SWORD_TO_AXE_MORPH','CB_ELEMENT_DISCHARGE_1'])for(const level of [0,3]){
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:${id}');build.decos=${level?"{w0:'46'}":"{}"};calcBuild();`);
 results.push({id,level,...copy(w.eval('({total:calcState.total,real:calcState.realOneHit,summary:buildSummary.textContent,conditions:compareStep5Snapshot()})'))});
 if(id==='CB_SWORD_TO_AXE_MORPH')w.eval(`buildName.value='${level?'B':'A'}';saveNamedBuild();`);
}
w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SWORD_TO_AXE_MORPH');comboCBAxe.value='1';calcBuild();`);blocked=copy(w.eval('calcState.realOneHit'));
try{
 for(const r of results)for(const ch of ['normal','maximum']){const c=r.real.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');assert.ok(Number.isFinite(c.metrics.comboTotalDamage.value));assert.ok(r.summary.includes(c.metrics.comboTotalDamage.value.toFixed(1)));}
 assert.equal(results[1].total['高速変形'],3);
 for(const ch of ['normal','maximum']){
  const a=results[0].real.channels[ch].components,b=results[1].real.channels[ch].components;assert.equal(a.length,2);assert.equal(b.length,2);
  for(let i=0;i<2;i++){assert.ok(Math.abs(b[i].value-a[i].value*1.2)<.012);assert.equal(b[i].effectsApplied.filter(e=>e.id?.startsWith('cb-rapid-morph')).length,1);}
  assert.equal(results[2].real.channels[ch].metrics.comboTotalDamage.value,results[3].real.channels[ch].metrics.comboTotalDamage.value);
  assert.ok(results[3].real.channels[ch].components.every(c=>!c.effectsApplied.some(e=>e.id?.startsWith('cb-rapid-morph'))));
 }
 assert.equal(blocked.status,'UNAVAILABLE');assert.equal(blocked.reason,'REAL_SLICE:CB_MORPH_AXE_BOOST_COMPONENTS_UNCONNECTED');
 w.eval(`comboCBAxe.value='0';calcBuild();`);const before=copy(w.eval('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
 w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 comparison=copy(w.eval('({rows:lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})),after:{snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()}})'));
 for(const [i,name] of ['A','B'].entries())for(const ch of ['normal','maximum'])assert.equal(comparison.rows.find(r=>r.name===name).real.channels[ch].metrics.comboTotalDamage.value,results[i].real.channels[ch].metrics.comboTotalDamage.value);
 assert.deepEqual(comparison.after,before);assert.deepEqual(errors,[]);checks.push({pass:true});
}catch(e){checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify({base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),adapterSource:process.env.BEFORE_ADAPTER_SHA||'working-tree',adapterSha256:crypto.createHash('sha256').update(adapter).digest('hex'),results,blocked,comparison,checks},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
