const {test}=require('node:test'),assert=require('node:assert/strict');const {JSDOM,VirtualConsole}=require('jsdom');const html=require('./dom-test-setup.cjs').readSimulatorHtml();
function setup(t,kind='lance',source=html){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(source,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.addEventListener('error',e=>errors.push(e.message));w.fetch=()=>Promise.reject(new Error('OFFLINE_TEST_NO_EXTERNAL_REQUESTS'));}});t.after(()=>dom.window.close());const w=dom.window,d=w.document;w.eval(`clearWeaponBuckets();weaponIndexByKind[API_WEAPON_KIND[${JSON.stringify(kind)}]]=[{id:987,kind:${JSON.stringify(kind)},name:'Test weapon',damage:{raw:200,display:200},slots:[],skills:[],affinity:0,specials:[],sharpness:{red:10,orange:10,yellow:10,green:100,blue:0,white:0,purple:0}}];document.getElementById('weaponKind').value=${JSON.stringify(kind)};document.getElementById('weapon').innerHTML='<option value="987">Test weapon</option>';document.getElementById('weapon').value='987';calcState.stats={attackTrue:200,affinity:0,maxAffinity:0,element:100,elementType:'fire'};DB.monsters=[{id:'fixture',name:'Fixture',parts:[{id:'fixture-part',name:'Part',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2}}]}];`);w.renderMonsters();d.getElementById('monster').value='fixture';w.renderMonsterParts();d.getElementById('monsterPart').value='fixture-part';for(const [id,value] of Object.entries({dSharp:'1',dESharp:'1',dCB:'0',dECrit:'0',uptime:'100',uptimeMode:'0'}))d.getElementById(id).value=value;w.renderComboForWeapon();return {w,d,errors};}

const id='canonical:LAN_MID_THRUST_I',key='mhwilds-canonical-timing-v1',recordKey='lance:'+id;
const move=w=>w.comboMove(id),close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
// Removing the owner resolver, broadening its ID, or falling back after stale evidence must fail this test.
test('owner lance timing is scoped, unmeasured, fail-closed, replaceable and traceable',t=>{
 const {w,d,errors}=setup(t);
 const owner=()=>{const m=move(w);assert.equal(m.time,.55);assert.equal(m.timingStatus,'OWNER_ADOPTED_REFERENCE');assert.equal(m.timingEvidence.measurement,null);assert.equal(m.timingEvidence.measuredGameVersion,null);assert.equal(m.timingEvidence.appliesToDbVersion,'1.042.00.02');assert.equal(m.timingEvidence.adoptionId,'KAN66-10882-LANCE-MID-I');assert.equal(m.timingEvidence.adoptionRevision,1);assert.deepEqual(Array.from(m.timingEvidence.unconfirmed),['LEGACY_STAGE','TIME_BOUNDARIES','MEASURED_GAME_VERSION','SPEED_CONDITIONS']);return m;};
 const pending=()=>{assert.equal(move(w).time,0);assert.equal(move(w).timingStatus,'PENDING');assert.equal(w.createComboVerificationReport().summary.dps,null);};
 const initial=owner();assert.equal(w.localStorage.getItem(key),null);w.addCombo(id);
 const result=w.calcDps();assert.equal(result.time,.55);close(result.dps,result.damage/.55);assert.equal(result.dpsStatus,'CALCULATED');
 assert.equal(result.calculationReceipt.techniques[0].timingAdoption.id,'KAN66-10882-LANCE-MID-I');assert.equal(result.calculationReceipt.techniques[0].timingAdoption.measuredGameVersion,null);
 assert.equal(w.createComboVerificationReport().stages[0].timingEvidence.adoptionId,'KAN66-10882-LANCE-MID-I');
 assert.doesNotMatch(d.getElementById('dpsOut').textContent,/OWNER_ADOPTED|PROVISIONAL|暫定/);
 for(const suffix of ['II','III'])assert.equal(w.comboMove('canonical:LAN_MID_THRUST_'+suffix).time,0);
 assert.equal(w.comboMove('canonical:LAN_TRIPLE_THRUST').time,0);
 w.addCombo('canonical:LAN_MID_THRUST_II');assert.equal(w.calcDps().time,null);assert.equal(w.createComboVerificationReport().summary.dps,null);
 d.querySelectorAll('.comboRow .del')[1].click();
 // A stale comparison must be invalidated before a saved measurement can change its denominator.
 w.eval('DB.weapons=[selectedWeapon()]');w.calcBuild();
 for(const name of ['A','B']){d.getElementById('buildName').value=name;d.getElementById('saveBuild').click();}
 d.getElementById('selectAllCompare').click();d.getElementById('runCompare').click();assert.ok(d.querySelector('#compareOut table'));
 const saved=w.saveCanonicalTiming('lance',id,{seconds:1.1,gameVersion:'1.042.00.02',note:'Synthetic replacement fixture, not game evidence'});assert.equal(saved.applied,true);
 assert.equal(move(w).time,1.1);assert.equal(move(w).timingStatus,'USER_MEASURED_REFERENCE');assert.equal(d.querySelector('#compareOut table'),null);w.dispatchEvent(new w.Event('resize'));assert.equal(d.querySelector('#compareOut table'),null);
 const measured=w.calcDps();close(measured.dps,measured.damage/1.1);assert.equal(measured.calculationReceipt.techniques[0].timingAdoption,undefined);
 const valid=JSON.parse(w.localStorage.getItem(key));
 for(const patch of [{fingerprint:'different'},{gameVersion:'1.999.00.00'},{seconds:0},{note:''},{measurement:{method:'FRAMES',startFrame:0,endFrame:60,frameCount:60,fps:60,constantFrameRate:true}}]){
  const changed=JSON.parse(JSON.stringify(valid));Object.assign(changed.records[recordKey],patch);w.localStorage.setItem(key,JSON.stringify(changed));pending();
 }
 for(const malformed of ['broken','null','{}','{"schemaVersion":2,"records":{}}','{"schemaVersion":1,"records":[]}','{"schemaVersion":1,"records":{"lance:canonical:LAN_MID_THRUST_I":null}}']){w.localStorage.setItem(key,malformed);pending();}
 assert.equal(w.removeCanonicalTiming('lance',id).ok,true);owner();
 w.renderCanonicalTimingEditor();d.getElementById('canonicalTimingTechnique').value=id;d.getElementById('canonicalTimingTechnique').onchange();assert.equal(d.getElementById('canonicalTimingSeconds').value,'');assert.equal(d.getElementById('canonicalTimingVersion').value,'');assert.equal(d.getElementById('canonicalTimingNote').value,'');
 const changedHtml=html.replace("techniqueName:'中段突きⅠ',revision:3","techniqueName:'中段突きⅠ',revision:4");assert.notEqual(changedHtml,html);const revised=setup(t,'lance',changedHtml);assert.equal(move(revised.w).time,0);assert.equal(move(revised.w).timingStatus,'PENDING');
 for(const [kind,tech] of [['long-sword','LS_RED_BLADE_I'],['dual-blades','DB_DEMON_DANCE_I'],['switch-axe','SA_AXE_MORPH_SLASH'],['insect-glaive','IG_SWEEP'],['light-bowgun','LBG_NORMAL_AMMO_2'],['charge-blade','CB_SWORD_TO_AXE_MORPH'],['gunlance','GL_SWEEP'],['heavy-bowgun','HBG_NORMAL_AMMO_2'],['bow','BOW_SHOT_3']]){const other=setup(t,kind);assert.equal(other.w.comboMove('canonical:'+tech).time,0,kind);}
 assert.deepEqual(errors,[]);assert.equal(initial.timingEvidence.measurement,null);
});

// Removing the LBG adoption or multiplying the period by contact count must fail.
test('owner LBG cycle applies once to one normal Lv1 shot without changing damage',t=>{
 const {w,d,errors}=setup(t,'light-bowgun');
 d.getElementById('comboLBGMode').value='NORMAL';w.addCombo('canonical:LBG_NORMAL_AMMO_1');
 const result=w.calcDps();close(result.damage,40.8);assert.equal(result.time,59/60);
 close(result.dps,40.8*60/59);assert.equal(result.dpsStatus,'CALCULATED');
 const report=w.createComboVerificationReport();assert.equal(report.stages[0].hits.length,3);
 assert.equal(report.stages[0].time,59/60);assert.equal(report.stages[0].timingStatus,'OWNER_ADOPTED_REFERENCE');
 assert.equal(report.stages[0].timingEvidence.measurement,null);assert.equal(report.stages[0].timingEvidence.measuredGameVersion,null);
 assert.deepEqual(errors,[]);
});

const lbgId='canonical:LBG_NORMAL_AMMO_1',lbgKey='light-bowgun:'+lbgId;
function lbgSetup(t,source=html){const s=setup(t,'light-bowgun',source);s.d.getElementById('comboLBGMode').value='NORMAL';s.w.addCombo(lbgId);return s;}
test('LBG reference cycle excludes unknown modes, other ammo and multiple shots but preserves measured durations',t=>{
 const {w,d,errors}=lbgSetup(t);
 for(const mode of ['','RAPID','CHASE','MOUNTED']){d.getElementById('comboLBGMode').value=mode;assert.equal(w.calcDps(),null);const report=w.createComboVerificationReport();assert.equal(report.summary.dps,null);assert.equal(report.summary.status,'BLOCKED');assert.equal(report.stages[0].time,null);assert.equal(report.stages[0].timingStatus,'PENDING');}
 d.getElementById('comboLBGMode').value='NORMAL';w.addCombo(lbgId);
 const repeated=w.calcDps();close(repeated.damage,81.6);assert.equal(repeated.time,null);
 assert.ok(w.createComboVerificationReport().stages.every(s=>s.time===null&&s.timingStatus==='PENDING'));
 d.querySelectorAll('.comboRow .del')[1].click();w.addCombo('canonical:LBG_NORMAL_AMMO_2');assert.equal(w.calcDps().time,null);
 d.querySelectorAll('.comboRow .del')[1].click();
 assert.equal(w.saveCanonicalTiming('light-bowgun',lbgId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic timing fixture'}).applied,true);
 close(w.calcDps().dps,20.4);w.addCombo(lbgId);assert.equal(w.calcDps().time,4);close(w.calcDps().damage,81.6);
 assert.equal(w.calcDps().calculationReceipt.techniques[0].timingAdoption,undefined);assert.deepEqual(errors,[]);
});
test('LBG malformed or stale saved evidence never falls back; removal restores the reference cycle',t=>{
 const {w,errors}=lbgSetup(t);assert.equal(w.saveCanonicalTiming('light-bowgun',lbgId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic fixture'}).applied,true);
 const valid=JSON.parse(w.localStorage.getItem(key));
 for(const patch of [{fingerprint:'stale'},{gameVersion:'1.999.00.00'},{seconds:0},{seconds:-1},{note:''},{measurement:{method:'FRAMES',startFrame:0,endFrame:60,frameCount:60,fps:60,constantFrameRate:true}}]){
  const changed=JSON.parse(JSON.stringify(valid));Object.assign(changed.records[lbgKey],patch);w.localStorage.setItem(key,JSON.stringify(changed));assert.equal(w.calcDps().time,null);
 }
 for(const bad of ['broken','null','{}','{"schemaVersion":2,"records":{}}','{"schemaVersion":1,"records":[]}',JSON.stringify({schemaVersion:1,records:{[lbgKey]:null}})]){w.localStorage.setItem(key,bad);assert.equal(w.calcDps().time,null);}
 assert.equal(w.removeCanonicalTiming('light-bowgun',lbgId).ok,true);assert.equal(w.calcDps().time,59/60);assert.deepEqual(errors,[]);
});
test('LBG reference evaluation uses captured state and storage, including explicit comparison conditions',t=>{
 const {w,d,errors}=lbgSetup(t),rows=[{techniqueId:lbgId}];d.getElementById('dHZ').value='50';
 const conditions=JSON.parse(JSON.stringify(w.compareStep5Snapshot()));assert.equal(conditions.hz,'50');
 const captured=w.captureComboInputs(rows,null,{conditions}),signature=captured.signature;
 d.getElementById('comboLBGMode').value='RAPID';w.localStorage.setItem(key,'broken');
 const replay=w.evaluateCapturedComboRoute(rows,null,{capturedInput:captured});assert.equal(replay.time,59/60);close(replay.damage,40.8);assert.equal(captured.signature,signature);
 w.localStorage.removeItem(key);
 const explicit=w.captureComboInputs(rows,null,{conditions});assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:explicit}).time,59/60);
 conditions.lightBowgunState.shotMode='MOUNTED';d.getElementById('comboLBGMode').value='NORMAL';
 const excluded=w.captureComboInputs(rows,null,{conditions});assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:excluded}).time,null);
 assert.deepEqual(errors,[]);
});
test('LBG ammo and rule revision changes invalidate the fixed adoption fingerprint',t=>{
 const variants=[
  ['"techniqueId":"LBG_NORMAL_AMMO_1","techniqueName":"Lv1通常弾","revision":1','"techniqueId":"LBG_NORMAL_AMMO_1","techniqueName":"Lv1通常弾","revision":2'],
  ["shotMode:'NON_RAPID_NON_CHASE_NON_MOUNTED'","shotMode:'CHANGED_SOURCE_CONDITION'"]
 ];
 for(const [from,to] of variants){const source=html.replace(from,to);assert.notEqual(source,html);const {w}=lbgSetup(t,source);assert.equal(w.calcDps().time,null);}
});

const igId='canonical:IG_DIAGONAL_SLASH',igKey='insect-glaive:'+igId;
function igSetup(t,source=html){const x=setup(t,'insect-glaive',source);x.w.eval("calcState.stats.element=0;calcState.stats.elementType='none'");x.d.getElementById('comboIGExtract').value='NO_EXTRACT';x.d.getElementById('comboIGKinsect').value='STOWED';x.w.addCombo(igId);return x;}
// Removing adoption or using a two-input/loop duration must fail this independent oracle.
test('IG reaping slash adopts one 51-frame reference without changing physical or elemental damage',t=>{
 const {w,d,errors}=igSetup(t),result=w.calcDps();close(result.damage,18.9);assert.equal(result.time,51/60);close(result.dps,18.9*60/51);
 const report=w.createComboVerificationReport(),stage=report.stages[0],adoption=result.calculationReceipt.techniques[0].timingAdoption;
 assert.equal(stage.hits.length,1);assert.equal(stage.hits[0].mv,18);assert.equal(stage.hits[0].elementModifier,.8);assert.equal(stage.timingStatus,'OWNER_ADOPTED_REFERENCE');assert.equal(adoption.id,'KAN17-66-IG-REAPING-SLASH');assert.equal(adoption.measurement,null);assert.equal(adoption.measuredGameVersion,null);
 assert.equal(adoption.timingModel.preFrames,16);assert.equal(adoption.timingModel.postFrames,35);assert.equal(adoption.timingModel.totalFrames,51);assert.equal(adoption.timingModel.recordingFps,60);assert.equal(adoption.timingModel.sourceGameVersion,'TU4 1.04');assert.equal(adoption.timingModel.sourceInput,'Y>Y');assert.equal(adoption.timingModel.includesPrecedingMove,false);assert.equal(adoption.timingModel.liveGameVerification,'PENDING');
 for(const item of ['TARGET_VERSION_MATCH','SOURCE_NO_EXTRACT','SOURCE_KINSECT_STOWED','EXACT_TIME_BOUNDARIES'])assert.ok(adoption.unconfirmed.includes(item));assert.equal(result.dpsStatus,'CALCULATED');assert.notEqual(stage.verificationStatus,'VERIFIED');
 w.eval("calcState.stats.element=100;calcState.stats.elementType='fire'");const element=w.calcDps();close(element.damage,20.5);close(w.createComboVerificationReport().stages[0].hits[0].element,1.6);close(element.dps,20.5*60/51);
 assert.doesNotMatch(d.getElementById('dpsOut').textContent,/OWNER_ADOPTED|PROVISIONAL/);assert.deepEqual(errors,[]);
});
test('IG state and single-row restriction affect only the adopted reference',t=>{
 const {w,d,errors}=igSetup(t);
 for(const [extract,kinsect] of [['','STOWED'],['TRIPLE_EXTRACT','STOWED'],['NO_EXTRACT',''],['NO_EXTRACT','DEPLOYED']]){d.getElementById('comboIGExtract').value=extract;d.getElementById('comboIGKinsect').value=kinsect;const v=w.createComboVerificationReport();assert.equal(v.summary.damage,null);assert.equal(v.summary.dps,null);assert.equal(v.stages[0].timingStatus,'PENDING');}
 d.getElementById('comboIGExtract').value='NO_EXTRACT';d.getElementById('comboIGKinsect').value='STOWED';
 for(const id of ['canonical:IG_SWEEP','canonical:IG_DOUBLE_SLASH'])assert.equal(w.comboMove(id).time,0);
 w.addCombo(igId);const repeat=w.calcDps();close(repeat.damage,37.8);assert.equal(repeat.time,null);assert.ok(w.createComboVerificationReport().stages.every(s=>s.timingStatus==='PENDING'));
 d.querySelectorAll('.comboRow .del')[1].click();w.addCombo('canonical:IG_SWEEP');assert.equal(w.calcDps().time,null);assert.ok(w.calcDps().damage>18.9);d.querySelectorAll('.comboRow .del')[1].click();
 assert.equal(w.saveCanonicalTiming('insect-glaive',igId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic fixture, not live-game evidence'}).applied,true);close(w.calcDps().dps,9.45);w.addCombo(igId);assert.equal(w.calcDps().time,4);close(w.calcDps().damage,37.8);assert.equal(w.calcDps().calculationReceipt.techniques[0].timingAdoption,undefined);assert.deepEqual(errors,[]);
});
test('IG malformed or stale measurement never falls back and explicit removal restores adoption',t=>{
 const {w,errors}=igSetup(t);assert.equal(w.saveCanonicalTiming('insect-glaive',igId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic timing'}).applied,true);const valid=JSON.parse(w.localStorage.getItem(key));
 for(const patch of [{fingerprint:'stale'},{gameVersion:'1.999.00.00'},{seconds:0},{seconds:-1},{note:''},{measurement:{method:'FRAMES',startFrame:0,endFrame:60,frameCount:60,fps:60,constantFrameRate:true}}]){const changed=JSON.parse(JSON.stringify(valid));Object.assign(changed.records[igKey],patch);w.localStorage.setItem(key,JSON.stringify(changed));assert.equal(w.calcDps().time,null);}
 for(const bad of ['broken','null','{}','{"schemaVersion":2,"records":{}}','{"schemaVersion":1,"records":[]}',JSON.stringify({schemaVersion:1,records:{[igKey]:null}})]){w.localStorage.setItem(key,bad);assert.equal(w.calcDps().time,null);}
 assert.equal(w.removeCanonicalTiming('insect-glaive',igId).ok,true);assert.equal(w.calcDps().time,51/60);assert.deepEqual(errors,[]);
});
test('IG damage and timing share captured explicit conditions and ignore later UI or storage',t=>{
 const {w,d,errors}=igSetup(t),rows=[{techniqueId:igId}];d.getElementById('dHZ').value='50';d.getElementById('dEHZ').value='20';const conditions=JSON.parse(JSON.stringify(w.compareStep5Snapshot()));
 const captured=w.captureComboInputs(rows,null,{conditions}),serialized=JSON.stringify(captured);d.getElementById('comboIGExtract').value='TRIPLE_EXTRACT';d.getElementById('comboIGKinsect').value='DEPLOYED';w.localStorage.setItem(key,'broken');
 const replay=w.evaluateCapturedComboRoute(rows,null,{capturedInput:captured});close(replay.damage,18.9);assert.equal(replay.time,51/60);assert.equal(JSON.stringify(captured),serialized);w.localStorage.removeItem(key);
 const explicit=w.captureComboInputs(rows,null,{conditions});const allowed=w.evaluateCapturedComboRoute(rows,null,{capturedInput:explicit});close(allowed.damage,18.9);assert.equal(allowed.time,51/60);
 d.getElementById('comboIGExtract').value='NO_EXTRACT';d.getElementById('comboIGKinsect').value='STOWED';
 for(const state of [undefined,{extractState:'NO_EXTRACT'},{extractState:'TRIPLE_EXTRACT',kinsectState:'STOWED'},{extractState:'NO_EXTRACT',kinsectState:'DEPLOYED'}]){const changed={...conditions};if(state)changed.insectGlaiveState=state;else delete changed.insectGlaiveState;const input=w.captureComboInputs(rows,null,{conditions:changed}),v=w.evaluateCapturedComboRoute(rows,null,{capturedInput:input});assert.equal(v.damage,null);assert.equal(v.time,null);assert.equal(v.dps,null);}
 assert.deepEqual(errors,[]);
});
test('IG fixed fingerprint expires on revision MV element and hit count changes',t=>{
 const needle='"IG_DIAGONAL_SLASH":',start=html.indexOf(needle)+needle.length;assert.ok(start>needle.length);const end=html.indexOf(',"IG_',start),raw=html.slice(start,end),record=JSON.parse(raw);
 for(const change of [r=>r.revision++,r=>r.hits[0].mv++,r=>r.hits[0].elementModifier=.9,r=>r.hits.push({...r.hits[0]})]){const changed=JSON.parse(raw);change(changed);const source=html.slice(0,start)+JSON.stringify(changed)+html.slice(end);const {w}=igSetup(t,source);assert.equal(w.comboMove(igId).time,0);assert.equal(w.calcDps().time,null);}
});


const hbgId='canonical:HBG_NORMAL_AMMO_1',hbgKey='heavy-bowgun:'+hbgId,hbgAdoption='KAN17-66-HBG-NORMAL-LV1-CYCLE';
function hbgSetup(t,source=html){const x=setup(t,'heavy-bowgun',source);for(const [id,value] of Object.entries({powerHbgAmmoLevel:'1',powerHbgRange:'CRITICAL',powerHbgNormalMode:'0',powerHbgFullMagazine:'YES',powerHbgCapacity:'5',powerHbgShotOrdinal:'1',dHZ:'50'}))x.d.getElementById(id).value=value;x.w.addCombo(hbgId);return x;}
function hbgEvidence(e){assert.equal(e.adoptionId,hbgAdoption);assert.equal(e.adoptionRevision,1);assert.equal(e.measurement,null);assert.equal(e.measuredGameVersion,null);assert.equal(e.appliesToDbVersion,'1.042.00.02');assert.equal(e.scope,'SINGLE_NORMAL_LV1_SHOT_ALL_THREE_ASSUMED_NON_MOUNTED_NORMAL_MODE_0');assert.equal(e.cycleModel.totalFrames,87);assert.equal(e.cycleModel.conversionDivisor,60);assert.equal(e.cycleModel.adoptionAuthority,'PM_UNDER_OWNER_DELEGATION');assert.equal(e.cycleModel.frames,86);assert.equal(e.cycleModel.errorFrames,1);assert.equal(e.cycleModel.sourceRange,'Frame Data!A8:D9');assert.equal(e.cycleModel.sourceRow,'HBG Shooting / Normal');assert.equal(e.cycleModel.selection,'Main!J5=false selects Frames+Error; true selects Frames (Macro/Turbo)');assert.equal(e.cycleModel.cycleFormula,'Combo DPS Calculations!C39 converts the selected frame value to seconds by /60');assert.equal(e.cycleModel.reloadFormula,'Combo DPS Calculations!A29 = C5 + C9*G5; C5 reload frames, G5 magazine size');assert.equal(Object.hasOwn(e.cycleModel,'sourceFrameBreakdownVerification'),false);assert.equal(e.unconfirmed.includes('SOURCE_FRAME_BREAKDOWN'),false);assert.deepEqual(Array.from(e.unconfirmed),['MEASURED_GAME_VERSION','RECORDING_FPS','EXACT_TIME_BOUNDARIES','SOURCE_NON_MOUNTED_CONDITION']);assert.equal(e.cycleModel.nonMountedAdoptionAssumption,true);assert.equal(e.cycleModel.sourceNonMountedCondition,'UNCONFIRMED');assert.equal(e.cycleModel.reloadIncluded,false);assert.equal(e.cycleModel.liveGameVerification,'PENDING');}
test('HBG Lv1 reference uses one 87-frame period for three unrounded hits and preserves provenance',t=>{
 const {w,d,errors}=hbgSetup(t),r=w.calcDps();close(r.damage,200*.17*.50*3);assert.equal(r.time,87/60);close(r.dps,51/(87/60));assert.equal(r.dpsStatus,'CALCULATED');
 const report=w.createComboVerificationReport(),s=report.stages[0];assert.equal(s.hits.length,3);assert.equal(s.time,87/60);assert.equal(s.timingStatus,'OWNER_ADOPTED_REFERENCE');hbgEvidence(s.timingEvidence);assert.equal(s.rounding,'UNROUNDED_REFERENCE');for(const hit of s.hits){close(hit.physical,17);assert.equal(hit.element,0);}
 const a=r.calculationReceipt.techniques[0].timingAdoption;assert.equal(a.id,hbgAdoption);assert.equal(a.measurement,null);assert.equal(a.cycleModel.reloadIncluded,false);const ai=w.aiBuildData().step5;assert.equal(ai.comboEvaluation.time,87/60);assert.equal(ai.combo[0].timingEvidence.adoptionId,hbgAdoption);assert.doesNotMatch(d.getElementById('dpsOut').textContent,/OWNER_ADOPTED|PROVISIONAL/);assert.deepEqual(errors,[]);
});
test('HBG reference requires captured mode zero and one Lv1 row while valid measurement retains existing scope',t=>{
 const {w,d}=hbgSetup(t);
 for(const mode of ['','1','2']){d.getElementById('powerHbgNormalMode').value=mode;const r=w.createComboVerificationReport();assert.equal(r.summary.time,null);assert.equal(r.summary.dps,null);assert.equal(r.stages[0].timingStatus,'PENDING');}
 d.getElementById('powerHbgNormalMode').value='0';for(const other of ['canonical:HBG_NORMAL_AMMO_2','canonical:HBG_NORMAL_AMMO_3','canonical:HBG_WYVERN_AMMO'])assert.equal(w.comboMove(other).time,0);
 w.addCombo(hbgId);assert.equal(w.calcDps().time,null);close(w.calcDps().damage,102);d.querySelectorAll('.comboRow .del')[1].click();w.addCombo('canonical:HBG_NORMAL_AMMO_2');assert.equal(w.createComboVerificationReport().summary.time,null);d.querySelectorAll('.comboRow .del')[1].click();
 const direct=w.eval("evaluateComboRoute([{techniqueId:'canonical:HBG_NORMAL_AMMO_1'}],comboDamageContext(),{stats:calcState.stats,total:calcState.total||{}})");assert.equal(direct.time,null);
 assert.equal(w.saveCanonicalTiming('heavy-bowgun',hbgId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic test only'}).applied,true);assert.equal(w.calcDps().time,2);close(w.calcDps().dps,25.5);d.getElementById('powerHbgNormalMode').value='1';assert.equal(w.calcDps().time,2);d.getElementById('powerHbgNormalMode').value='0';w.addCombo(hbgId);assert.equal(w.calcDps().time,4);close(w.calcDps().damage,102);assert.equal(w.calcDps().calculationReceipt.techniques[0].timingAdoption,undefined);
});
test('HBG malformed and stale timing never falls back; explicit removal restores adoption',t=>{
 const {w}=hbgSetup(t);assert.equal(w.saveCanonicalTiming('heavy-bowgun',hbgId,{seconds:2,gameVersion:'1.042.00.02',note:'Synthetic test only'}).applied,true);const valid=JSON.parse(w.localStorage.getItem(key));
 for(const patch of [{fingerprint:'stale'},{gameVersion:'1.999.00.00'},{seconds:0},{seconds:-1},{note:''},{measurement:{method:'FRAMES',startFrame:0,endFrame:60,frameCount:60,fps:60,constantFrameRate:true}}]){const x=JSON.parse(JSON.stringify(valid));Object.assign(x.records[hbgKey],patch);w.localStorage.setItem(key,JSON.stringify(x));assert.equal(w.calcDps().time,null);}
 for(const bad of ['broken','null','{}','{"schemaVersion":2,"records":{}}','{"schemaVersion":1,"records":[]}',JSON.stringify({schemaVersion:1,records:{[hbgKey]:null}})]){w.localStorage.setItem(key,bad);assert.equal(w.calcDps().time,null);}
 assert.equal(w.removeCanonicalTiming('heavy-bowgun',hbgId).ok,true);assert.equal(w.calcDps().time,87/60);
});
test('HBG capture fixes timing state and storage and explicit comparison conditions override later UI',t=>{
 const {w,d}=hbgSetup(t),rows=[{techniqueId:hbgId}],conditions=JSON.parse(JSON.stringify(w.compareStep5Snapshot()));assert.equal(conditions.hz,'50');assert.equal(conditions.hbgState.normalModeLevel,0);
 const captured=w.captureComboInputs(rows,null,{conditions}),serialized=JSON.stringify(captured);d.getElementById('powerHbgNormalMode').value='2';w.localStorage.setItem(key,'broken');const replay=w.evaluateCapturedComboRoute(rows,null,{capturedInput:captured});assert.equal(replay.time,87/60);close(replay.damage,51);assert.equal(JSON.stringify(captured),serialized);w.localStorage.removeItem(key);
 const explicit=w.captureComboInputs(rows,null,{conditions});assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:explicit}).time,87/60);d.getElementById('powerHbgNormalMode').value='0';
 for(const mode of [undefined,null,'0',1,2]){const cond=JSON.parse(JSON.stringify(conditions));if(mode===undefined)delete cond.hbgState.normalModeLevel;else cond.hbgState.normalModeLevel=mode;const input=w.captureComboInputs(rows,null,{conditions:cond});assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:input}).time,null);}
 for(const ammoType of [undefined,'PIERCE']){const cond=JSON.parse(JSON.stringify(conditions));if(ammoType===undefined)delete cond.hbgState.ammoType;else cond.hbgState.ammoType=ammoType;const input=w.captureComboInputs(rows,null,{conditions:cond});assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:input}).time,null);}
 const altered=JSON.parse(serialized);altered.conditions.hbgState.normalModeLevel=1;assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:altered}).dps,null);
});
test('HBG fixed adoption fingerprint expires with ammo and reference rule changes',t=>{
 const needle='"HBG_NORMAL_AMMO_1":',start=html.indexOf(needle)+needle.length;assert.ok(start>needle.length);let depth=0,quoted=false,escaped=false,end=start;for(;end<html.length;end++){const c=html[end];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end++;break;}}const raw=html.slice(start,end);
 for(const change of [r=>r.revision++,r=>r.specialSourceValues.mvPerHit++,r=>r.specialSourceValues.hitCount=2]){const r=JSON.parse(raw);change(r);const {w}=hbgSetup(t,html.slice(0,start)+JSON.stringify(r)+html.slice(end));assert.equal(w.comboMove(hbgId).time,0);assert.equal(w.createComboVerificationReport().summary.time,null);}
 for(const [from,to] of [['...TECHNIQUE_DB_R119_HBG_NORMAL,revision:2','...TECHNIQUE_DB_R119_HBG_NORMAL,revision:3'],['normalMode:{0:1,1:1.1,2:1.2}','normalMode:{0:1,1:1.11,2:1.2}']]){const source=html.replace(from,to);assert.notEqual(source,html);const {w}=hbgSetup(t,source);assert.equal(w.comboMove(hbgId).time,0);assert.equal(w.createComboVerificationReport().summary.time,null);}
});
