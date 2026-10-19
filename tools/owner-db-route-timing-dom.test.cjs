const {test}=require('node:test'),assert=require('node:assert/strict');const {JSDOM,VirtualConsole}=require('jsdom');const html=require('./dom-test-setup.cjs').readSimulatorHtml();
function setup(t,kind='lance',source=html){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(source,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.addEventListener('error',e=>errors.push(e.message));w.fetch=()=>Promise.reject(new Error('OFFLINE_TEST_NO_EXTERNAL_REQUESTS'));}});t.after(()=>dom.window.close());const w=dom.window,d=w.document;w.eval(`clearWeaponBuckets();weaponIndexByKind[API_WEAPON_KIND[${JSON.stringify(kind)}]]=[{id:987,kind:${JSON.stringify(kind)},name:'Test weapon',damage:{raw:200,display:200},slots:[],skills:[],affinity:0,specials:[],sharpness:{red:10,orange:10,yellow:10,green:100,blue:0,white:0,purple:0}}];document.getElementById('weaponKind').value=${JSON.stringify(kind)};document.getElementById('weapon').innerHTML='<option value="987">Test weapon</option>';document.getElementById('weapon').value='987';calcState.stats={attackTrue:200,affinity:0,maxAffinity:0,element:100,elementType:'fire'};DB.monsters=[{id:'fixture',name:'Fixture',parts:[{id:'fixture-part',name:'Part',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2}}]}];`);w.renderMonsters();d.getElementById('monster').value='fixture';w.renderMonsterParts();d.getElementById('monsterPart').value='fixture-part';for(const [id,value] of Object.entries({dSharp:'1',dESharp:'1',dCB:'0',dECrit:'0',uptime:'100',uptimeMode:'0'}))d.getElementById(id).value=value;w.renderComboForWeapon();return {w,d,errors};}
const ids=['I','II','III'].map(s=>'canonical:DB_DEMON_DANCE_'+s),key='mhwilds-canonical-timing-v1';
const adoptionId='KAN17-66-DB-DEMON-DANCE-I-II-III';
// Independent canonical hit tuples; raw200, green1.05, slash50, displayed fire100, fire20.
const tuples=[[[18,1],[18,1],[6,.6],[6,.6],[10,.6],[10,.6],[4,.8],[4,.8],[20,.8],[20,.8],[11,.8],[11,.8]],[[16,.6],[16,.6],[6,.8],[25,.8]],[[22,.6],[8,.6],[5,.6],[22,.6],[5,.8],[14,.8],[18,.8],[8,.8],[18,.8],[36,.8],[36,.8]]];
const round=x=>Math.round((x+Number.EPSILON)*100)/100,damage=tuples.flat().reduce((s,[mv,e])=>s+round(200*mv/100*.5*1.05)+round(100/10*e*.2),0);
const close=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${a} != ${b}`),copy=x=>JSON.parse(JSON.stringify(x));
function db(t,source=html){const x=setup(t,'dual-blades',source);ids.forEach(id=>x.w.addCombo(id));return x;}
function setRows(w,d,rows){while(d.querySelector('#combo .del'))d.querySelector('#combo .del').click();rows.forEach(id=>w.addCombo(id));}
function save(w,id,seconds){assert.equal(w.saveCanonicalTiming('dual-blades',id,{seconds,gameVersion:'1.042.00.02',note:'Synthetic fixture only; not game evidence'}).applied,true);}
function evidence(e){assert.equal(e.adoptionId,adoptionId);assert.equal(e.adoptionRevision,1);assert.equal(e.seconds,5.39);assert.equal(e.measurement,null);assert.equal(e.measuredGameVersion,null);assert.equal(e.appliesToDbVersion,'1.042.00.02');assert.equal(e.timingStatus,'OWNER_ADOPTED_REFERENCE');assert.deepEqual(Array.from(e.sequence),ids.map(x=>x.slice(10)));assert.equal(typeof e.fingerprint,'string');assert.ok(e.fingerprint.length>0);assert.deepEqual(copy(e.stateAssumptions),{demonMode:true,requiredDemonGaugeAvailable:true,liveStateVerified:false});assert.equal(e.scope,'EXACT_DEMON_DANCE_I_II_III_ASSUMED_DEMON_MODE_AND_GAUGE');assert.equal(e.timingModel.sourceSection,'4.4 Blade Dance');assert.equal(e.timingModel.sourceGameVersion,'1.020.01.00');assert.equal(e.timingModel.recordingFps,null);assert.equal(e.timingModel.hitstop,null);assert.equal(e.timingModel.liveGameVerification,'PENDING');for(const x of ['TARGET_VERSION_MATCH','EXACT_TIME_BOUNDARIES','RECORDING_FPS','HITSTOP','LIVE_DEMON_MODE_AND_GAUGE'])assert.ok(e.unconfirmed.includes(x));}

test('exact DB route resolves total only and exports distinct stage and route evidence',t=>{
 const {w,d,errors}=db(t),r=w.calcDps();close(r.damage,damage);assert.equal(r.time,5.39);close(r.dps,damage/5.39);assert.equal(r.dpsStatus,'CALCULATED');assert.equal(r.practicalDps,null);assert.equal(r.oneMinute,null);
 assert.deepEqual(Array.from(r.pendingTimeTechniqueIds),ids);assert.ok(r.stages.every(s=>s.time===null&&s.move.time===0&&s.move.timingStatus==='PENDING'));assert.ok(r.calculationReceipt.techniques.every(s=>s.seconds===null));evidence(r.calculationReceipt.routeTimingEvidence);
 const report=w.createComboVerificationReport();assert.equal(report.summary.time,5.39);evidence(report.summary.routeTimingEvidence);assert.deepEqual(Array.from(report.stages,s=>s.hits.length),[12,4,11]);assert.ok(report.stages.every(s=>s.time===null&&s.timingStatus==='PENDING'));close(report.summary.damage,damage);
 assert.match(d.getElementById('dpsOut').textContent,/5\.39/);assert.doesNotMatch(d.getElementById('dpsOut').textContent,/DPSは算出できません|OWNER_ADOPTED|PROVISIONAL/);
 d.getElementById('aiPrompt').value='inspect timing';const ai=w.makeAIPrompt().currentBuild.step5;assert.equal(ai.comboEvaluation.time,5.39);assert.equal(ai.comboTimingStatus,'OWNER_ADOPTED_REFERENCE');evidence(ai.comboEvaluation.routeTimingEvidence);assert.ok(ai.combo.every(s=>s.time===null));assert.deepEqual(errors,[]);
});

test('permutations omissions duplicates and extra stages never receive the exact route total',t=>{
 const {w,d}=db(t);for(const rows of [[ids[0]],[ids[0],ids[1]],[ids[1],ids[0],ids[2]],[ids[0],ids[2],ids[1]],[ids[0],ids[1],ids[1]],[...ids,ids[0]],[...ids,...ids]]){setRows(w,d,rows);const r=w.createComboVerificationReport();assert.equal(r.summary.time,null);assert.equal(r.summary.dps,null);assert.equal(r.summary.calculationReceipt,null);assert.ok(r.summary.damage>0);}
 setRows(w,d,ids);assert.equal(w.calcDps().time,5.39);
});

test('partial measured times suppress adoption, all three win, and only deleting all restores it',t=>{
 const {w}=db(t);save(w,ids[0],1);assert.equal(w.calcDps().time,null);save(w,ids[1],2);assert.equal(w.calcDps().time,null);save(w,ids[2],3);const r=w.calcDps();assert.equal(r.time,6);close(r.dps,damage/6);assert.ok(r.calculationReceipt.routeTimingEvidence==null);assert.ok(r.stages.every(s=>s.move.timingStatus==='USER_MEASURED_REFERENCE'));
 w.removeCanonicalTiming('dual-blades',ids[0]);assert.equal(w.calcDps().time,null);w.removeCanonicalTiming('dual-blades',ids[1]);assert.equal(w.calcDps().time,null);w.removeCanonicalTiming('dual-blades',ids[2]);assert.equal(w.calcDps().time,5.39);
});

test('invalid saved timing or storage must not silently recover the owner route total',t=>{
 const {w}=db(t);save(w,ids[0],1);const valid=copy(JSON.parse(w.localStorage.getItem(key)));
 for(const patch of [{seconds:0},{seconds:-1},{note:''},{fingerprint:'old'},{gameVersion:'1.999.00.00'},{measurement:{method:'FRAMES',startFrame:0,endFrame:60,frameCount:60,fps:60,constantFrameRate:true}}]){const data=copy(valid);Object.assign(data.records['dual-blades:'+ids[0]],patch);w.localStorage.setItem(key,JSON.stringify(data));assert.equal(w.calcDps().time,null);}
 for(const raw of ['broken','null','{}','{"schemaVersion":2,"records":{}}','{"schemaVersion":1,"records":[]}',JSON.stringify({schemaVersion:1,records:{['dual-blades:'+ids[2]]:null}})]){w.localStorage.setItem(key,raw);assert.equal(w.calcDps().time,null);}
 w.localStorage.removeItem(key);assert.equal(w.calcDps().time,5.39);
});

test('route evidence and rejection are captured once and signature protected',t=>{
 const {w,d}=db(t),rows=ids.map(techniqueId=>({techniqueId}));const captured=w.captureComboInputs(rows,null),before=JSON.stringify(captured);evidence(captured.routeTimingEvidence);assert.deepEqual(JSON.parse(captured.signature).routeTimingEvidence,copy(captured.routeTimingEvidence));
 setRows(w,d,[ids[0]]);w.localStorage.setItem(key,'broken');const replay=w.evaluateCapturedComboRoute(rows,null,{capturedInput:captured});assert.equal(replay.time,5.39);close(replay.damage,damage);assert.equal(JSON.stringify(captured),before);
 const rejected=w.captureComboInputs(rows,null);assert.equal(rejected.routeTimingEvidence,null);w.localStorage.removeItem(key);assert.equal(w.evaluateCapturedComboRoute(rows,null,{capturedInput:rejected}).time,null);
 const altered=copy(captured);altered.routeTimingEvidence.seconds=5;const bad=w.evaluateCapturedComboRoute(rows,null,{capturedInput:altered});assert.equal(bad.dps,null);assert.equal(bad.status,'BLOCKED');
});

test('fixed ordered DB fingerprint fails closed on each stage and state contract changes',t=>{
 for(const id of ids.map(x=>x.slice(10))){const needle='"'+id+'":',start=html.indexOf(needle)+needle.length;assert.ok(start>needle.length);let depth=0,quoted=false,escaped=false,end=start;for(;end<html.length;end++){const c=html[end];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end++;break;}}const record=JSON.parse(html.slice(start,end));
  for(const mutate of [r=>r.revision++,r=>r.hits[0].mv++,r=>r.hits[0].elementModifier=.123,r=>r.hits.push({...r.hits[0]}),r=>r.stateRequirement={...r.stateRequirement,qaChanged:true}]){const changed=copy(record);mutate(changed);const source=html.slice(0,start)+JSON.stringify(changed)+html.slice(end);const {w}=db(t,source);assert.equal(w.createComboVerificationReport().summary.time,null,id);}
 }
});

test('comparison accepts signed whole-route receipt but rejects forged aggregate or stage evidence',t=>{
 const {w}=db(t),rows=ids.map(techniqueId=>({techniqueId})),r=w.evaluateCapturedComboRoute(rows,null),value={...r,stages:r.stages.map(s=>({...s,techniqueId:s.id}))},row={kind:'dual-blades',stats:{element:100,elementType:'fire'},dps:r.dps,dpsStatus:r.dpsStatus,comboVerification:value};close(w.comparisonDpsValue(row),damage/5.39);
 for(const mutate of [x=>x.comboVerification.calculationReceipt.routeTimingEvidence.seconds=5,x=>x.comboVerification.calculationReceipt.routeTimingEvidence.fingerprint='forged',x=>x.comboVerification.calculationReceipt.routeTimingEvidence.sequence.reverse(),x=>x.comboVerification.calculationReceipt.routeTimingEvidence.stateAssumptions.liveStateVerified=true,x=>x.comboVerification.calculationReceipt.techniques[0].seconds=5.39,x=>x.comboVerification.calculationReceipt.signature+='x',x=>x.comboVerification.stages.reverse()]){const bad=copy(row);mutate(bad);assert.equal(w.comparisonDpsValue(bad),null);}
 for(const mutate of [x=>x.rows.reverse(),x=>x.moves[0].time=5.39,x=>x.moves[0].handler='RangedReferenceHandler',x=>x.routeTimingEvidence.fingerprint='forged',x=>x.weapon.id=12345]){const bad=copy(row),input=JSON.parse(bad.comboVerification.calculationReceipt.signature);mutate(input);const signature=JSON.stringify(input);bad.comboVerification.calculationReceipt.signature=signature;bad.comboVerification.inputReceipt.signature=signature;assert.equal(w.comparisonDpsValue(bad),null);}
});
