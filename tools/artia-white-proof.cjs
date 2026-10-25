const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const {readSimulatorHtml}=require(process.cwd()+'/tools/dom-test-setup.cjs');
const rows=JSON.parse(fs.readFileSync('docs/reports/r253-base-artia-source/mhdb-base-artia-identities.json'));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify(rows)};DB.armor=[];DB.skills=[];DB.decorations=[];weaponIndexByKind['great-sword']=DB.weapons.filter(x=>x.kind==='great-sword');weaponKind.value='great-sword';weapon.innerHTML='<option value="303">Artia Blade I</option>';weapon.value='303';App.build.setWeapon(DB.weapons.find(x=>x.id===303));build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};build.artia={production:'element',element:'water',parts:['affinity'],sameElementPartCount:2,restores:['atk:I','none','none','none','none'],seriesSkill:'115',groupSkill:'131'};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();calcBuild();renderArtia();`);

const copy=x=>JSON.parse(JSON.stringify(x));
const singles=[];
for(const restores of [['none','none','none','none','none'],['sharp:I','none','none','none','none']]){w.eval(`build.artia.restores=${JSON.stringify(restores)};renderArtia();calcBuild();`);singles.push(copy(w.eval('({stats:calcState.stats,real:calcState.realOneHit,projection:realPipelineWeapon(selectedWeapon()),raw:selectedWeapon(),summary:buildSummary.textContent,ui:artiaBox.textContent})')));}
const checks=[];
try {
 const old=JSON.parse(fs.readFileSync('docs/reports/r254-approved-artia/base-result.json')).singles[1].real;
 for(const s of singles){
  assert.equal(s.stats.attackTrue,185);assert.equal(s.stats.element,330);
  assert.equal(s.raw.sharpness.white,0);assert.equal(s.raw.sharpness.blue,40);
  assert.deepEqual(s.projection.sharpness,s.raw.sharpness);
  assert.equal(s.projection.artiaCalculationEvidence.sharpnessPremise.color,'white');
  assert.equal(s.projection.artiaCalculationEvidence.sharpnessPremise.gaugeLength,null);
  assert.ok(s.ui.includes('ゲージ長未計算'));
  for(const ch of ['normal','maximum']){
   const c=s.real.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');assert.ok(Number.isFinite(c.metrics.comboTotalDamage.value));
   assert.ok(s.summary.includes(c.metrics.comboTotalDamage.value.toFixed(1)));
   const components=c.components,previous=old.channels[ch].components;
   assert.ok(components.length>0);assert.equal(components.length,previous.length);
   components.forEach((x,i)=>{const ratio=x.id.includes(':physical:')?1.32/1.2:1.15/1.0625;assert.ok(Math.abs(x.value-previous[i].value*ratio)<.012,JSON.stringify({x,old:previous[i]}));});
  }
 }
 for(const ch of ['normal','maximum'])assert.equal(singles[0].real.channels[ch].metrics.comboTotalDamage.value,singles[1].real.channels[ch].metrics.comboTotalDamage.value);
 assert.deepEqual(errors,[]);checks.push({pass:true});
}catch(e){checks.push({pass:false,error:e.stack});}
const hashes=Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','weapon-max-sharpness.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
console.log(JSON.stringify({base:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes,singles,checks},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
