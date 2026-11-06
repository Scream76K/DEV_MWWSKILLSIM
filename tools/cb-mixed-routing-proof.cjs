const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r250-stage6/evidence/cb103-conditional-ab-fixture.json'));const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[];DB.skills=[];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);
const registrations=[];const original=w.HimmelRealOneHitPipeline;w.HimmelRealOneHitPipeline=function(options){registrations.push({ids:[...options.techniqueIds],referenceRegistered:typeof options.referenceFormula==='function',physicalRegistered:typeof options.canonicalPhysical?.calculate==='function',phialRegistered:typeof options.phialFormula==='function'});return original(options);};
const results=[];for(const ids of [['CB_ELEMENT_DISCHARGE_1','CB_SAED'],['CB_SAED']]){w.eval(`App.state.combo.moves=[];restoreComboRows();for(const id of ${JSON.stringify(ids)})addCombo('canonical:'+id);calcBuild();`);results.push(JSON.parse(w.eval('JSON.stringify({real:calcState.realOneHit,snapshot:buildSnapshot(),summary:buildSummary.textContent})')));}
// r253 registration-only evidence predates the adopted single-SAED consumer.
// Mixed ED1+SAED remains unadopted; do not replace a blocked sequence with a single hit.
const checks=[];try{
 const mixed=results[0].real,single=results[1].real;
 assert.equal(mixed.status,'UNAVAILABLE');
 assert.equal(mixed.reason,'REAL_SLICE:CB_DISCHARGE_SEQUENCE_SCOPE_UNCONNECTED');
 for(const ch of ['normal','maximum'])assert.ok(!Number.isFinite(mixed.channels?.[ch]?.metrics?.comboTotalDamage?.value));
 assert.ok(!registrations.some(x=>x.ids.length===2));
 assert.ok(registrations.some(x=>JSON.stringify(x.ids)===JSON.stringify(['CB_SAED'])&&x.referenceRegistered&&x.physicalRegistered&&x.phialRegistered));
 assert.equal(single.status,'OK');
 for(const ch of ['normal','maximum']){
  const c=single.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');
  assert.equal(c.components.length,1);const ref=c.components[0];assert.equal(ref.techniqueId,'CB_SAED');assert.equal(ref.status,'available');
  assert.equal(ref.details.status,'REFERENCE_ONLY');assert.equal(ref.details.verificationStatus,'UNVERIFIED');
  assert.equal(ref.details.trace.bodyHits.length,3);assert.equal(ref.details.trace.hitCount,5);
  assert.ok(ref.details.components.physicalBody>0&&ref.details.components.elementalPhial>0);
  // Independent fixture oracle: MHDB103 attack190/water260/affinity-15,
  // green1.05/1, training80/30; adopted SAED16/78/45, shield1.1/1.3,
  // power-element8.2/11 with loadingLv0 => normal2 + enhanced3.
  // Do not read expected values from the resolver or its result/DB at runtime.
  const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,actual+' != '+expected);
  const expectedPhysical=[16,78,45].map(mv=>190*(mv/100)*1.1*1.05*.8*(1-.15*.25));
  const normalPhial=26*8.2*.3*1.3*2,enhancedPhial=26*11*.3*1.3*3;
  assert.equal(ref.details.trace.normalCount,2);assert.equal(ref.details.trace.enhancedCount,3);
  near(ref.details.trace.normalPhialDamage,normalPhial);near(ref.details.trace.enhancedPhialDamage,enhancedPhial);
  for(let i=0;i<3;i++){near(ref.details.trace.bodyHits[i].physical,expectedPhysical[i]);near(ref.details.trace.bodyHits[i].element,26*.3);}
  near(ref.details.components.physicalBody,expectedPhysical.reduce((a,b)=>a+b,0));
  near(ref.details.components.elementalBody,26*.3*3);near(ref.details.components.elementalPhial,normalPhial+enhancedPhial);
  for(const key of ['axeBoostPhysical','axeBoostElement','impactPhial'])assert.equal(ref.details.components[key],0);
  near(c.metrics.comboTotalDamage.value,759.193335);

  const sum=Object.values(ref.details.components).reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(sum-ref.value)<1e-9);assert.equal(c.metrics.comboTotalDamage.value,ref.value);
  assert.equal(c.metrics.comboDps.status,'unavailable');
 }
 assert.deepEqual(errors,[]);checks.push({pass:true});}catch(e){checks.push({pass:false,error:e.message});}console.log(JSON.stringify({adapterSha256:crypto.createHash('sha256').update(fs.readFileSync('hope-hammer-browser-adapter.js')).digest('hex'),checks,registrations,results},null,2));dom.window.close();process.exitCode=checks.some(x=>!x.pass)?1:0;
