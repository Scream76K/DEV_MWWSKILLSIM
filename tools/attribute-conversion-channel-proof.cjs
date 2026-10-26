const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r258-attribute-conversion/fixture.json'));assert.equal(f.weapon.id,900);assert.ok(f.armor.skills.some(x=>x.skill.id===152&&x.level===1));
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['long-sword']=DB.weapons;weaponKind.value='long-sword';weapon.innerHTML='<option value="900">ガルシュエンシスⅠ</option>';weapon.value='900';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LS_RED_BLADE_I');comboLSSpiritGauge.value='RED';`);
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,total:calcState.total,summary:buildSummary.textContent,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));
const out={codeSHA:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','bowgun-normal-reference.js','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),cases:[],checks:[]};
w.eval(`build.armor.head=DB.armor[0];build.decos={};`);
// Initialize equipment-derived UI values before capturing comparison identity.
w.eval('calcBuild();');
try{
for(const [name,n,m,known] of [['Unknown-ON','','ON','maximum'],['ON-Unknown','ON','','normal']]){
 w.eval(`powerAttributeConversionNormal.value='${n}';powerAttributeConversionMaximum.value='${m}';calcBuild();`);
 const single=take(),unknown=known==='normal'?'maximum':'normal',good=single.real.channels[known],bad=single.real.channels[unknown];
 out.cases.push({name,single});
 assert.equal(good.metrics.comboTotalDamage.status,'available');assert.equal(good.metrics.comboTotalDamage.value,74.83);assert.equal(good.execution.status,'complete');
 assert.equal(good.diagnostics.referenceOnly,true);assert.equal(good.diagnostics.attributeConversion.status,'OWNER_APPROVED_PROVISIONAL');assert.equal(good.diagnostics.attributeConversion.source,'https://kuroyonhon.com/mhwilds/program/skill.php');
 assert.notEqual(bad.metrics.comboTotalDamage.status,'available');assert.ok(JSON.stringify(bad).includes('ATTRIBUTE_CONVERSION_STATE_REQUIRED'));assert.equal(bad.diagnostics.attributeConversion.active,null);assert.equal(bad.diagnostics.attributeConversion.effectiveElement,null);
 assert.ok(single.summary.includes('74.8'));assert.ok(single.summary.includes('状態未入力'));assert.ok(single.summary.includes('固定・龍追撃を含まない'));
 for(const label of ['A','B'])w.eval(`buildName.value='${label}';saveNamedBuild();`);
 const before=take();w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))')),after=take(),compareDOM=w.document.querySelector('#compareOut').textContent;
 assert.equal(rows.length,2);for(const row of rows)assert.deepEqual(row.real.channels,single.real.channels);assert.deepEqual(after,before);assert.ok(compareDOM.includes('74.8'));assert.ok(compareDOM.includes('未算出'));assert.ok(compareDOM.includes('固定・龍追撃を含まない'));
 out.cases[out.cases.length-1].comparison={rows,before,after,compareDOM};
}
assert.deepEqual(errors,[]);out.checks.push({pass:true});
}catch(e){out.checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify(out,null,2));dom.window.close();process.exitCode=out.checks.some(c=>!c.pass)?1:0;
