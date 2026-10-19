const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');const source=require('../tools/legacy-ocr-source.cjs');
const realWave=require('../tools/dark-arts-vm-test-setup.cjs');require('node:test').after(()=>realWave.close());
function load(names,c){vm.createContext(realWave.register(require('../tools/element-vm-test-setup.cjs').register(c)));names=['affinityDisplay','weaponNumericPendingReason',...names];const h=source();if(h.includes('function comparisonDpsValue('))names=['comparisonDpsValue',...names];vm.runInContext(names.map(n=>source.functionSource(h,n)).join('\n'),c);return c;}
test('reference timing keeps damage and duration but cannot produce formal DPS',()=>{
 const c=load(['evaluateComboRoute'],{bonusDamagePendingReason:()=>null,comboMove:()=>({name:'reference',time:2,timingStatus:'USER_MEASURED_REFERENCE'}),comboTechniqueDamage:()=>({total:100,hits:[]})});
 // Actual product helper/identity/policy must remain usable for an active wave too.
 const active=require('../tools/official-bonus-fixture.cjs').effect(172);
 assert.equal(c.MHSeriesGroupIdentity.resolveEffect(active).status,'IDENTIFIED');
 const wave=c.darkArtsWaveForTechnique('great-sword','GS_CHARGED_SLASH_3',{activeBonusEffects:[active]},{},{hz:80,dragonHz:30,sharp:1.32,esharp:1.15,cb:0,eCrit:0},{attack:200,affinity:0});
 assert.ok(Math.abs(wave.total-(200*.30*1.32*.80+600/10*1.15*.30))<1e-9);assert.equal(wave.verificationStatus,'UNVERIFIED');
 const r=c.evaluateComboRoute([{techniqueId:'fixture'}],{},{stats:{activeBonusEffects:[]},capturedInput:{kind:'great-sword',weapon:{id:236},moves:[c.comboMove()],conditions:{hz:80,ehz:30,dragonHz:30,sharp:1.32,esharp:1.15,cb:0,eCrit:0}}});assert.equal(r.damage,100);assert.equal(r.time,2);assert.equal(r.status,'REFERENCE_ONLY');assert.equal(r.theoreticalDps,null);assert.equal(r.practicalDps,null);assert.equal(r.oneMinute,null);assert.equal(r.dpsStatus,'UNVERIFIED');assert.equal(r.dpsReason,'COMBO_DPS_UNVERIFIED');
});
const row=(name,dps)=>({name,kind:'great-sword',power:{profileId:'fixture'},dps,attack:100,attackTrue:100,affinity:0,maxAffinity:0,element:0,elementType:'—',damage:10});
function comparison(){const rows=[row('A',123.4),row('B',246.8)];return load(['comparisonDpsIndex','comparisonDisplayNumber','renderCompareTableChunk','referenceComboChange','createBuildComparisonReport'],{lastBuildComparisonRows:rows,lastBuildComparisonContext:{conditions:{}},lastBuildComparisonBaselineIndex:0,TECHNIQUE_DB_SPEC:{gameVersion:'fixture'},esc:String,comparisonPowerIndex:()=>null,comparisonPowerChange:()=>null,comparisonChangeText:()=>'',comparisonCoverageSummary:()=>({}),comparisonReasonText:r=>r});}
test('legacy cached DPS without verification is hidden in comparison and derived indices',()=>{
 const c=comparison(),rows=c.lastBuildComparisonRows;assert.equal(c.comparisonDpsIndex(rows[1],rows[0]),null);
 const html=c.renderCompareTableChunk(rows,rows);const line=html.match(/data-comparison-metric="dps"[\s\S]*?<\/tr>/)[0];assert.doesNotMatch(line,/123\.4|246\.8/);assert.match(line,/未検証|UNVERIFIED|—/);
});
test('comparison JSON clears unverified cached DPS and includes status and reason',()=>{
 const c=comparison(),before=JSON.stringify(c.lastBuildComparisonRows),r=c.createBuildComparisonReport();assert.equal(r.results[0].dps,null);assert.equal(r.results[0].dpsIndex,null);assert.equal(r.results[0].dpsChangePercent,null);assert.equal(r.results[0].dpsStatus,'UNVERIFIED');assert.equal(r.results[0].dpsReason,'COMBO_DPS_UNVERIFIED');assert.equal(JSON.stringify(c.lastBuildComparisonRows),before);
});
test('saved comparison retains DPS verification state and reason instead of an object as numeric DPS',()=>{
 const c=load(['compareSnapshot'],{applyBuildSnapshot:()=>{},calcState:{stats:{}},damageForStats:()=>10,dpsForStats:()=>({dps:null,dpsStatus:'UNVERIFIED',dpsReason:'COMBO_DPS_UNVERIFIED'}),document:{querySelector:()=>true},bonusDamagePendingReason:()=>null,canonicalWeaponKind:()=> 'great-sword',selectedWeapon:()=>({}),standardPowerForStats:()=>({}),skillLevel:()=>0});const r=c.compareSnapshot('A',{},{});assert.equal(r.dps,null);assert.equal(r.dpsStatus,'UNVERIFIED');assert.equal(r.dpsReason,'COMBO_DPS_UNVERIFIED');
});
test('readiness includes reason for numeric cached DPS without verification',()=>{
 const c=load(['comparisonReadinessHtml'],{comparisonPowerIndex:()=>({maximum:100}),comparisonReasonText:r=>r,esc:String});const r=row('cached',123.4);assert.match(c.comparisonReadinessHtml([r],r),/DPS：COMBO_DPS_UNVERIFIED/);
});
test('proposal cached DPS cannot be displayed or ranked without verification',()=>{
 const c=load(['groupProposalRenderCandidate','groupProposalDpsCompare'],{DB:{armor:[]},$:()=>null,esc:String,comparisonReasonText:r=>r});const a={armor:{},skills:[],damage:10,dps:123.4,baseDps:10},b={...a,dps:246.8};const h=c.groupProposalRenderCandidate(a,0);assert.doesNotMatch(h,/123\.40|113\.40/);assert.match(h,/未算出/);assert.equal(c.groupProposalDpsCompare(a,b),0);
});

test('calculated DPS requires matching captured route damage timing and identity receipts; bare cache stays hidden',()=>{
 const c=load(['comparisonDpsValue'],{}),value=73.33333333333333,signature='independent 176/2.4 fixture',techniques=[{techniqueId:'gs_charge3',numericOrigin:'CANONICAL_DB',seconds:2.4,timingStatus:'LEGACY_REFERENCE_ONLY'}];
 const valid={kind:'great-sword',element:0,elementType:'none',dps:value,dpsStatus:'CALCULATED',comboVerification:{dpsStatus:'CALCULATED',dps:value,damage:176,time:2.4,stages:[{techniqueId:'gs_charge3'}],inputReceipt:{signature},calculationReceipt:{schemaVersion:1,source:'CAPTURED_COMBO_DAMAGE_TIME_V1',kind:'great-sword',signature,damage:176,time:2.4,techniques}}};
 assert.equal(c.comparisonDpsValue(valid),value);
 for(const change of [r=>delete r.comboVerification,r=>r.comboVerification.inputReceipt.signature='different',r=>r.comboVerification.time=3,r=>r.comboVerification.stages[0].techniqueId='canonical:GS_CHARGED_SLASH_3',r=>r.comboVerification.calculationReceipt.techniques[0].seconds=3,r=>r.comboVerification.calculationReceipt.kind='bow']){const r=JSON.parse(JSON.stringify(valid));change(r);assert.equal(c.comparisonDpsValue(r),null);}
});
