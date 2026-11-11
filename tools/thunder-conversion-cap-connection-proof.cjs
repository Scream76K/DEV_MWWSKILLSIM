const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r257-thunder-conversion/fixture.json'));assert.equal(f.weapon.id,1081);assert.equal(f.decoration.skills[0].skill.id,156);assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.ok(f.armor.slots[0]>=f.decoration.slot);
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=${JSON.stringify(f.skills)};DB.armor=[${JSON.stringify(f.armor)}];weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="1081">ラギアブレイドⅠ</option>';weapon.value='1081';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:GS_CHARGED_SLASH_3');`);

// Contract armor records, not a claim that these resistance totals occur on a real item.
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.armor=[70,150].map((v,i)=>({...DB.armor[0],id:900001+i,name:'Contract thunder '+v,resistances:{...DB.armor[0].resistances,thunder:v}}));`);
const mode=process.argv[2]||'after',cases=[];assert.equal(mode,'after','Historical before mode belongs to the preserved old revision');
const runtimeFiles=['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'];const runtimeHashes=()=>Object.fromEntries(runtimeFiles.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));const runtimeBefore=runtimeHashes();
const take=()=>JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,conditions:compareStep5Snapshot(),snapshot:buildSnapshotComparable(buildSnapshot())})'));
for(const i of [-1,0,1]){
 w.eval(`build.armor.head=${i<0?'null':'DB.armor['+i+']'};calcBuild();`);
 const r=take();cases.push(r);
 if(i>=0)w.eval(`buildName.value='${i===0?'below':'capped'}';saveNamedBuild();`);
}
const checks={};
function verifyCases(rows,selection){
 for(const [i,r] of rows.entries()){
  assert.equal(r.real.evaluationPlan.selection,selection);
  assert.deepEqual(r.real.evaluationPlan.techniqueIds,selection==='STANDARD'?['GS_CHARGED_SLASH_3','GS_STRONG_CHARGED_SLASH_3','GS_STRONG_WIDE_SLASH_3']:['GS_CHARGED_SLASH_3']);
  for(const ch of ['normal','maximum']){
   const c=r.real.channels[ch],active=selection==='EXPLICIT'||ch==='maximum';assert.equal(c.execution.status,'complete');assert.equal((c.diagnostics.ignoredSkillEffects||[]).length,0);
   const d=c.diagnostics.thunderResistanceConversion,amount=active?[0,350,750][i]:0,expected=Math.min(500+amount,1150);
   assert.equal(d.add,amount);assert.equal(d.effectiveElement,expected);assert.equal(d.uncappedElement,500+amount);assert.equal(d.capLimit,1150);
   assert.deepEqual(c.components.map(z=>z.id),rows[0].real.channels[ch].components.map(z=>z.id));
   for(const z of c.components){const baseline=rows[0].real.channels[ch].components.find(b=>b.id===z.id);if(z.id.includes(':physical:'))assert.equal(z.value,baseline.value);else{assert.equal(z.effectsApplied.filter(e=>e.id==='thunder-resistance-conversion-element-add').length,amount?1:0);assert.ok(Math.abs(z.value/baseline.value-expected/500)<1e-9);}}
  }
 }
}
verifyCases(cases,'STANDARD');
let comparison;
if(mode==='after'){
 const before=take();w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 const rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))')),after=take();
 assert.equal(rows.length,2);for(const [i,name] of ['below','capped'].entries())assert.deepEqual(rows.find(x=>x.name===name).real.channels,cases[i+1].real.channels);assert.deepEqual(after,before);
 comparison={before,rows,after,conditionsUnchanged:true,snapshotUnchanged:true};checks.channelsPhysicalUnchangedAndOneFlat=true;
}
const explicitCases=[];
for(const i of [-1,0,1]){
 w.eval(`build.armor.head=${i<0?'null':'DB.armor['+i+']'};calcBuild();`);
 const before=take(),real=JSON.parse(w.eval(`JSON.stringify(evaluateConsumerCombat({kind:'great-sword',moves:[{techniqueId:'GS_CHARGED_SLASH_3'}],conditions:compareStep5Snapshot(),target:{monster:monster.value,part:monsterPart.value}}))`));
 explicitCases.push({real});assert.deepEqual(take(),before);
}
verifyCases(explicitCases,'EXPLICIT');assert.deepEqual(errors,[]);assert.deepEqual(runtimeHashes(),runtimeBefore);
console.log(JSON.stringify({currentContractVerified:true,runtimeUnchanged:true,explicitCases,mode,inputScope:'Contract armor resistances70/150; real captured GS1081 base thunder500; no live equipment legality claim',cases,comparison,checks,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','tools/dom-test-setup.cjs','docs/reports/r257-thunder-conversion/fixture.json','docs/reports/r263-skill-audit/mhdb-skills.json',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
