const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://hh-contract.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
const weapon=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/reports/r252-generic-states/evidence/mhdb-hunting-horn-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['hunting-horn']=[DB.weapons[0]];weaponKind.value='hunting-horn';weapon.innerHTML='<option value="531">Hope</option>';weapon.value='531';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'HH_LEFT_SWING'}];`);
w.eval(`DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
const input={...args,techniqueIds:['HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST','HH_LEFT_SWING'],huntingHornState:{model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['SELF_IMPROVEMENT','SELF_IMPROVEMENT'],echoBubbles:1,selfImprovementLevel:0}};
const r=adapter.evaluateCurrent(input);const rows=[{label:'N2-B1-initial0',result:r}];
for(const ch of ['normal','maximum']){assert.equal(r.channels?.[ch]?.metrics?.comboTotalDamage?.status,'available',JSON.stringify(r));assert.equal(r.channels[ch].execution.status,'complete');}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const ch of ['normal','maximum']){
 const c=r.channels[ch];near(c.metrics.comboTotalDamage.value,254.1);assert.equal(c.finalState.huntingHorn.selfImprovementLevel,2);
 assert.equal(c.components.filter(x=>x.coefficientUnit==='MV').length,4);
 const refs=c.components.filter(x=>x.coefficientUnit==='REFERENCE');assert.equal(refs.length,8);
 assert.deepEqual(Array.from(refs,x=>x.details.trace[0].scenarioCount),[1,1,1,1,1,1,1,1]);
 assert.deepEqual(Array.from(refs,x=>x.details.attack),[90,90,90,90,90,108,108,108]);
 assert.equal(refs[4].value,10);assert.equal(refs[4].effectsApplied.length,0);
 assert.equal(c.diagnostics.hhEventModel.verificationStatus,'UNVERIFIED');
}
// Synthetic stage-input contrast, not a claim of legal equipped skills (stage IV is separate).
const flatInput={...input,stats:{...input.stats,conditionalConditionPlan:{status:'READY',maximum:{element:0},attackComponents:{conditionalMultiplier:1.1,groupMultiplier:1,conditionalFlat:10}}}};
const flat=adapter.evaluateCurrent(flatInput);near(flat.channels.normal.metrics.comboTotalDamage.value,254.1);near(flat.channels.maximum.metrics.comboTotalDamage.value,302.902);
const maxRefs=flat.channels.maximum.components.filter(x=>x.coefficientUnit==='REFERENCE');near(maxRefs[5].details.attack,128.8);assert.notEqual(maxRefs[5].details.attack,(90*1.1+10)*1.2);
rows.push({label:'SYNTHETIC-maximum-mult1.1-flat10',result:flat});
const one=adapter.evaluateCurrent({...input,huntingHornState:{...input.huntingHornState,melodies:['SELF_IMPROVEMENT'],echoBubbles:0}});
near(one.channels.normal.metrics.comboTotalDamage.value,152.52);assert.equal(one.channels.normal.components.filter(x=>x.coefficientUnit==='REFERENCE').length,1);rows.push({label:'N1-B0-no-fixed-no-echo',result:one});
for(const [label,patch,reason] of [['missing-B',{echoBubbles:null},'HH_START_STATE_REQUIRED'],['unknown-song',{melodies:['UNKNOWN']},'HH_MELODY_DEFINITION_UNRESOLVED']]){
 const result=adapter.evaluateCurrent({...input,huntingHornState:{...input.huntingHornState,...patch}});assert.equal(result.status,'UNAVAILABLE');assert.ok(result.reason.includes(reason));rows.push({label,result});
}
const restoreInput=JSON.parse(JSON.stringify(input.huntingHornState));w.restoreHHStoredState(restoreInput);assert.deepEqual(JSON.parse(JSON.stringify(w.comboHHStoredState())),{...restoreInput,echoState:null,melodyState:null});w.restoreHHStoredState(null);assert.equal(w.document.getElementById('comboHHModel').checked,false);w.restoreHHStoredState(restoreInput);
// Synthetic elemental weapon variant solely to distinguish sound/body/fixed application stages.
const elemental=adapter.evaluateCurrent({...input,weapon:{...input.weapon,specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}]},stats:{...input.stats,element:100,elementType:'fire',elementKnown:true,typeKnown:true,conditionalConditionPlan:{status:'READY',maximum:{element:100},attackComponents:{conditionalMultiplier:1,groupMultiplier:1,conditionalFlat:0}}}});
const ec=elemental.channels.normal;assert.equal(ec.metrics.comboTotalDamage.status,'available');
for(const [i,c] of ec.components.entries()){
 const base=r.channels.normal.components[i];
 if(c.coefficientUnit==='MV')near(c.value,base.value);
 if(c.coefficientUnit==='REFERENCE'){
  near(c.details.physical,base.details.physical);near(c.details.fixed,base.details.fixed);
  const id=c.details.trace[0].techniqueId;
  near(c.details.element,id==='HH_MELODY_COMPLETION_FIXED_10'?0:id==='HH_PERFORMANCE_SHOCKWAVE'?3:.9);
 }
}
rows.push({label:'SYNTHETIC-fire100-element-component-scope',result:elemental});
// A saved unsupported melody must not turn into a valid self-improvement melody by length.
const unsupportedSaved={...restoreInput,melodies:['ATTACK_UP']},unsupportedBefore=JSON.stringify(unsupportedSaved);
w.restoreHHStoredState(unsupportedSaved);const restoredUnsupported=JSON.parse(JSON.stringify(w.comboHHStoredState()));assert.equal(restoredUnsupported.melodies,null);
const restoredResult=adapter.evaluateCurrent({...input,huntingHornState:restoredUnsupported});assert.equal(restoredResult.reason,'REAL_SLICE:HH_MELODY_DEFINITION_UNRESOLVED');assert.equal(JSON.stringify(unsupportedSaved),unsupportedBefore);
rows.push({label:'unsupported-saved-melody-rejected-not-converted',state:restoredUnsupported,result:restoredResult});w.restoreHHStoredState(restoreInput);
// Real calcBuild producer + DOM display in isolated JSDOM; never touches Safari/storage.
w.eval(`App.state.combo.moves=${JSON.stringify(input.techniqueIds.map(techniqueId=>({techniqueId})))};`);w.calcBuild();
const displayed=w.document.getElementById('buildSummary').textContent;assert.ok(displayed.includes('254.1'));assert.ok(displayed.includes('暫定総計'));assert.ok(displayed.includes('未検証'));
rows.push({label:'isolated-DOM-and-condition-roundtrip',displayed,state:JSON.parse(JSON.stringify(w.comboHHStoredState()))});
const crypto=require('crypto'),repo=path.resolve(__dirname,'..');
console.log(JSON.stringify({scope:'STAGE2_HH_PUBLIC_PIPELINE_CONTRACT_NOT_GAME_VERIFICATION',executionSha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','himmel-real-browser-bundle.js', 'tools/hh-provisional-events-proof.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex')])),rows},null,2));
d.window.close();
