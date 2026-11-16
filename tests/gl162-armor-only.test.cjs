const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{JSDOM,VirtualConsole}=require('jsdom');const P=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),rows=[],probes=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://gl1084.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const adapter=w.MHWRealOneHitBrowserAdapter,contexts=[],live=[],saved={};w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(i){contexts.push(i);return adapter.evaluateCurrent(i);}};
try{const fixture=require('./fixtures/gl162-armor-only.json');w.__pack=structuredClone(require(P+'/tests/fixtures/offset-maximum-inputs.json').data);w.__pack.armor=w.__pack.armor.filter(x=>!fixture.armor.some(a=>a.id===x.id)).concat(fixture.armor);w.__pack.skills=w.__pack.skills.filter(x=>!fixture.skills.some(a=>a.id===x.id)).concat(fixture.skills);w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
for(const input of fixture.inputs){contexts.length=0;w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));live.push(contexts[0]);rows.push({input,inputHash:crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'),result,context:JSON.parse(JSON.stringify(contexts[0]))});}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const baseline=process.env.BASELINE_FILE?JSON.parse(fs.readFileSync(process.env.BASELINE_FILE)):null;
if(baseline)for(let i=0;i<rows.length;i++)for(const ch of ['normal','maximum']){
 const a=rows[i].result.channels[ch],b=baseline.rows[i].result.channels[ch];
 assert.deepEqual(a.components.map(c=>[c.id,c.value,c.status]),b.components.map(c=>[c.id,c.value,c.status]));
 assert.deepEqual(a.execution,b.execution);assert.deepEqual(a.finalState,b.finalState);
}
// Public controls use synthetic charms with the three actual attached skills.
// Rank2 excluded sliding is absent; it contributes no damage. Not a legal-equipment proof.
for(const i of [1,2]){
 const source=rows[i],input=structuredClone(source.input);input.armor={};input.charmCustom.skills=source.context.skills.filter(x=>['渾身','弱点特効','スタミナ急速回復'].includes(x[0])).map(([name,level])=>({name,level,type:'armor'}));
 contexts.length=0;w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();const off=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)')),stats=contexts[0].stats;
 near(source.context.stats.maxAffinity-stats.maxAffinity,15);
 for(const ch of ['normal','maximum']){const a=source.result.channels[ch],b=off.channels[ch];assert.equal(a.components.length,b.components.length);for(let j=0;j<a.components.length;j++){
  const ac=a.components[j],bc=b.components[j];assert.equal(ac.id,bc.id);
  // Unwounded training target: WEX base5/15 only, not display maximum wound3/10.
  const ratio=ch==='maximum'&&ac.id.includes(':physical:')?(1+([-10+20+5+15,-10+30+15+15][i-1])/100*.25)/(1+([-10+20+5,-10+30+15][i-1])/100*.25):1;
  near(ac.value,bc.value*ratio);
 }}
 probes.push({label:'public-attached-skill-control-'+i,scope:'synthetic-charm-three-skills',input,off,stats});
}
for(const i of [1,2]){
 w.applyBuildSnapshot(rows[i].input);
 for(const label of ['forgedWeapon','wrongSource','wrongRank','wrongCount','explicit','changedSequence','pending','unknownSelection']){
  const c={...live[i],weapon:structuredClone(live[i].weapon),stats:structuredClone(live[i].stats),conditions:structuredClone(live[i].conditions),conditionalConditionPlan:structuredClone(live[i].conditionalConditionPlan),techniqueIds:[...live[i].techniqueIds]};
  if(label==='forgedWeapon')c.weapon.damage.raw++;
  if(label==='wrongSource')c.stats.armorThunderResistanceInput.rows[0].sourceUrl='https://invalid.example/';
  if(label==='wrongRank')c.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skillId===162).rank=9;
  if(label==='wrongCount')c.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skillId===162).annotationActivation.count++;
  if(label==='explicit')c.conditions.standardEvaluation=false;
  if(label==='changedSequence')c.techniqueIds.reverse();
  if(label==='pending'){c.stats.conditionalConditionPlan.pending.push('INDEPENDENT_PENDING_TEST');c.conditionalConditionPlan.pending.push('INDEPENDENT_PENDING_TEST');}
  const original=w.buildSnapshot;if(label==='unknownSelection')w.buildSnapshot=()=>{const b=original();delete b.artia.seriesSkill;return b;};
  let r;try{r=adapter.evaluateCurrent(c);}finally{w.buildSnapshot=original;}
  assert.ok(r.status==='UNAVAILABLE'||JSON.stringify(r).includes('UNREVIEWED_MODIFIER')||JSON.stringify(r).includes('INDEPENDENT_PENDING_TEST'),label);
  probes.push({label:label+'-'+i,scope:'synthetic-direct-boundary',result:r});
 }
}
// Weapon-piece threshold now admitted only by the separately validated1151 gate.
for(const count of [1,3]){const input=structuredClone(rows[2].input);if(count===1)input.armor={head:'609'};else delete input.armor.waist;input.artia.seriesSkill='162';w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));for(const ch of ['normal','maximum']){assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available');assert.ok(!result.channels[ch].diagnostics.ignoredSkillEffects?.some(x=>x.skillId===162));}probes.push({label:'weapon-threshold-'+count,input,result});}
assert.deepEqual(errors,[]);for(const row of rows)for(const ch of ['normal','maximum']){const c=row.result.channels[ch];assert.equal(c.metrics.comboTotalDamage.status,'available');assert.equal(c.components.length,64);assert.ok(!c.diagnostics.ignoredSkillEffects?.some(x=>x.skillId===162),'armor-only ID162 must not be unsupported');}
}finally{if(process.env.RESULT_FILE)fs.writeFileSync(process.env.RESULT_FILE,JSON.stringify({rows,probes,errors},null,2));w.close();}
