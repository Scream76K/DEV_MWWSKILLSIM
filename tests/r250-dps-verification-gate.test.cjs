const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');const source=require('../tools/legacy-ocr-source.cjs');
function load(names,c){vm.createContext(require('../tools/element-vm-test-setup.cjs').register(c));names=['weaponNumericPendingReason',...names];const h=source();if(h.includes('function comparisonDpsValue('))names=['comparisonDpsValue',...names];vm.runInContext(names.map(n=>source.functionSource(h,n)).join('\n'),c);return c;}
test('reference timing keeps damage and duration but cannot produce formal DPS',()=>{
 const c=load(['evaluateComboRoute'],{bonusDamagePendingReason:()=>null,comboMove:()=>({name:'reference',time:2,timingStatus:'USER_MEASURED_REFERENCE'}),comboTechniqueDamage:()=>({total:100,hits:[]})});
 const r=c.evaluateComboRoute([{techniqueId:'fixture'}],{},{});assert.equal(r.damage,100);assert.equal(r.time,2);assert.equal(r.status,'REFERENCE_ONLY');assert.equal(r.theoreticalDps,null);assert.equal(r.practicalDps,null);assert.equal(r.oneMinute,null);assert.equal(r.dpsStatus,'UNVERIFIED');assert.equal(r.dpsReason,'COMBO_DPS_UNVERIFIED');
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
