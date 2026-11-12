'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),{JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/gog178-inputs.json'))),pack=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/offset-maximum-inputs.json'))).data;
const near=(a,b,label)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${label}: ${a} != ${b}`);
const routes=r=>r.routes?Object.values(r.routes):[r];
test('178 exact public 28 inputs, element-only application, removal and snapshot restoration',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://gog178.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{
 w.__pack={...structuredClone(pack),armor:structuredClone(f.armor)};
 w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const run=input=>{w.applyBuildSnapshot(structuredClone(input));w.document.getElementById('calcBuild').click();return JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));};
 const log=[];
 for(const c of f.cases){
  const hash=crypto.createHash('sha256').update(JSON.stringify(c.input)).digest('hex');assert.equal(hash,c.inputHash);
  const r=run(c.input);for(const ch of ['normal','maximum']){assert.equal(r.channels[ch].metrics.comboTotalDamage.status,'available',c.label);near(r.channels[ch].metrics.comboTotalDamage.value,c.expected[ch],c.label+ch);}
  assert.ok(!JSON.stringify(r).includes('GOG:DEDICATED_COMPONENT_NOT_ADOPTED'),c.label);assert.ok(!JSON.stringify(r).includes('LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED'),c.label);
  const saved=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.deepEqual(run(saved),r);
  // Synthetic matched activation-off control: remove only the 178 grant from
  // copied formal armor records, preserving every attached skill. Not a claim
  // that this grant-free equipment exists in game.
  w.eval('window.__gogArmor=DB.armor.map(a=>a.skills);DB.armor.forEach(a=>{a.skills=a.skills.filter(s=>s.skill?.id!==178);});');
  const off=run(c.input);w.eval('DB.armor.forEach((a,i)=>{a.skills=window.__gogArmor[i];});');
  const restored=run(c.input);assert.deepEqual(restored,r);assert.equal(crypto.createHash('sha256').update(JSON.stringify(c.input)).digest('hex'),hash);
  near(off.channels.normal.metrics.comboTotalDamage.value,r.channels.normal.metrics.comboTotalDamage.value,c.label+' normal inactive');
  const a=routes(off),b=routes(r);assert.equal(a.length,b.length);
  for(let j=0;j<a.length;j++){
   const ac=a[j].channels.maximum.components||[],bc=b[j].channels.maximum.components||[];assert.equal(ac.length,bc.length);
   for(let i=0;i<ac.length;i++){
    assert.equal(ac[i].id,bc[i].id);
    if(['gunlance','charge-blade'].includes(c.input.weaponKind)&&ac[i].id.includes(':element:')){
     const old=ac[i].details.appliedElement,completed=c.input.weaponKind==='gunlance'?[0,548,692][c.rank]:[0,380,510][c.rank];
     near(bc[i].details.appliedElement,completed,c.label+' completed element');near(bc[i].value,ac[i].value*completed/old,c.label+' body/axe element once');
    }else if(['gunlance','charge-blade','light-bowgun','heavy-bowgun'].includes(c.input.weaponKind))near(bc[i].value,ac[i].value,c.label+' non-element component');
   }
  }
  log.push({label:c.label,inputHash:hash,result:r,offResult:off,restored:true,expected:c.expected});
 }
 assert.deepEqual(errors,[]);assert.equal(log.length,28);
 if(process.env.GOG_RESULT_FILE)fs.writeFileSync(process.env.GOG_RESULT_FILE,JSON.stringify({publicExecutions:112,realEquipmentInputs:28,syntheticMatchedOff:28,rows:log,errors},null,2));
 }finally{w.close();}
});
test('178 validated activation and unknown component guards remain closed',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://gog178-boundary.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{
 w.__pack={...structuredClone(pack),armor:structuredClone(f.armor)};w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 // Capture input only, always call the production adapter and return its result.
 const adapter=w.MHWRealOneHitBrowserAdapter;let captured;
 w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){captured=a;return adapter.evaluateCurrent(a);}};
 const rows=[];
 for(const c of f.cases.filter(c=>['gunlance','charge-blade','light-bowgun','heavy-bowgun'].includes(c.input.weaponKind))){
  w.applyBuildSnapshot(structuredClone(c.input));w.document.getElementById('calcBuild').click();const input=captured;
  const positive=adapter.evaluateCurrent(input);assert.equal(positive.channels.maximum.metrics.comboTotalDamage.status,'available');
  for(const change of [{rankLevel:3},{name:'unknown'},{source:'group'},{count:0}]){
   const stats={...input.stats,activeBonusEffects:input.stats.activeBonusEffects.map(e=>e.bonusSkillId===178?{...e,...change}:e)};
   const result=adapter.evaluateCurrent({...input,stats});assert.ok(JSON.stringify(result).includes('BONUS_SKILL_SOURCE_MISMATCH'));rows.push({label:c.label,change,result});
  }
  if(['gunlance','charge-blade'].includes(c.input.weaponKind)){
   const db=input.techniqueDb;const techniqueDb={...db,get(kind,id){const t=db.get(kind,id);if(!t?.hits?.length)return t;const copy=JSON.parse(JSON.stringify(t));copy.hits[0].componentSource='UNADOPTED_TEST_COMPONENT';return copy;}};
   const result=adapter.evaluateCurrent({...input,techniqueDb});assert.ok(JSON.stringify(result).includes('GOG:DEDICATED_COMPONENT_NOT_ADOPTED'),JSON.stringify(result));assert.equal(result.channels.maximum.metrics.comboTotalDamage.status,'unavailable');rows.push({label:c.label,change:'unknown componentSource',result});
  }
 }
 assert.deepEqual(errors,[]);assert.equal(rows.length,36);
 if(process.env.GOG_BOUNDARY_FILE)fs.writeFileSync(process.env.GOG_BOUNDARY_FILE,JSON.stringify({publicExecutions:8,directValid:8,syntheticInvalid:36,rows,errors},null,2));
 }finally{w.close();}
});
