const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://cb-contract.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
const f=JSON.parse(fs.readFileSync('docs/reports/r254-cb-rapid-morph/fixture.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([f.weapon])};DB.skills=[{id:7,name:'高速変形'}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="147">Tempus</option>';weapon.value='147';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'CB_SWORD_TO_AXE_MORPH'}];DB.monsters=[{id:'training-room',name:'test',parts:[{id:'training-front',name:'front',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let captured;const api=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...api,evaluateCurrent(a){captured=a;return api.evaluateCurrent(a)}};w.calcBuild();assert.ok(captured);
// Synthetic stage-II contract: real technique records, explicit attack/element inputs, not a legal-build or game measurement proof.
const input={...captured,weapon:{...f.weapon,specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}]},skills:[],stats:{...captured.stats,attack:190,attackComponents:{weaponBase:190,normalMultiplier:1,normalFlat:0},affinity:0,maxAffinity:0,element:100,elementType:'fire',elementKnown:true,typeKnown:true,elementComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},conditionalConditionPlan:{status:'READY',maximum:{element:100},attackComponents:{conditionalMultiplier:1.1,groupMultiplier:1,conditionalFlat:10}}},techniqueIds:['CB_SWORD_TO_AXE_MORPH']};
const rows=[];
for(const [label,axeBoosted,shieldBoosted,rapid]of [['OFF',false,false,0],['ON',true,false,0],['SHIELD',true,true,0],['RAPID',true,true,3]]){const result=api.evaluateCurrent({...input,skills:rapid?[['高速変形',rapid]]:[],chargeBladeState:{axeBoosted,shieldBoosted}});rows.push({label,result});}
let error=null;
try{if(process.env.BASELINE){assert.equal(rows[1].result.reason,'REAL_SLICE:CB_MORPH_AXE_BOOST_COMPONENTS_UNCONNECTED');}else{
for(const ch of ['normal','maximum']){
const [off,on,shield,rapid]=rows.map(r=>r.result.channels?.[ch]);for(const r of [off,on,shield,rapid])assert.equal(r?.metrics.comboTotalDamage.status,'available',JSON.stringify(rows));
assert.equal(off.components.length,2);assert.equal(on.components.length,10);
const physical=r=>Array.from(r.components).filter(c=>c.coefficientUnit==='MV'),element=r=>Array.from(r.components).filter(c=>c.coefficientUnit==='ELEMENT_MODIFIER');
assert.equal(physical(on).length,5);
assert.equal(element(on).length,5);for(let i=1;i<5;i++){assert.ok(Math.abs(physical(on)[i].value-physical(on)[0].value*12/54)<.012);assert.ok(Math.abs(element(on)[i].value-element(on)[0].value*.2)<.012);}
assert.equal(physical(on)[0].value,physical(off)[0].value);
for(let i=1;i<5;i++)assert.equal(physical(shield)[i].value,physical(on)[i].value);
assert.ok(Math.abs(physical(shield)[0].value-physical(on)[0].value*1.1)<.012);
assert.deepEqual(element(rapid).map(c=>c.value),element(on).map(c=>c.value));
assert.ok(physical(rapid).every(c=>c.effectsApplied.filter(e=>e.id==='rapid-morph-attack:CB_SWORD_TO_AXE_MORPH').length===1),JSON.stringify(physical(rapid)));
assert.equal(on.metrics.comboTotalDamage.value,on.components.reduce((a,c)=>a+c.value,0));
// Source-stage expectation: maximum uses 190 * 1.1 * rapid + 10; flat is outside rapid.
const round=x=>Math.round(x*100)/100;
for(const [r,shielded,rapidMultiplier]of [[on,false,1],[shield,true,1],[rapid,true,1.2]]){
 const attack=190*(ch==='maximum'?1.1:1)*rapidMultiplier+(ch==='maximum'?10:0);
 assert.deepEqual(physical(r).map(c=>c.value),[54,12,12,12,12].map((mv,i)=>round(attack*mv/100*1.32*.8*1.0125*(shielded&&i===0?1.1:1))));
 assert.deepEqual(element(r).map(c=>c.value),[3.45,.69,.69,.69,.69]);
}

}
const sequence=api.evaluateCurrent({...input,techniqueIds:[...input.techniqueIds,...input.techniqueIds],chargeBladeState:{axeBoosted:true,shieldBoosted:true}});assert.equal(sequence.reason,'REAL_SLICE:CB_MORPH_AXE_BOOST_SEQUENCE_UNCONNECTED');
const missing=api.evaluateCurrent({...input,chargeBladeState:{axeBoosted:true}});assert.equal(missing.reason,'REAL_SLICE:CB_MORPH_SHIELD_AXE_STATE_REQUIRED');
}}
catch(e){error=e.stack;}
console.log(JSON.stringify({scope:'STAGE2_SYNTHETIC_CONTRACT_NOT_STAGE4',executionSha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','himmel-real-browser-bundle.js','tools/cb-axe-followup-contract-proof.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows,error},null,2));d.window.close();if(error)process.exitCode=1;
