const MHWElementState=require('../element-state.js');
// Synthetic VERIFIED fixture tests independent diagnostics, not a production verification source.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const source=html.slice(html.indexOf('function comparisonCoverageReason(row,baseline,metric){'),html.indexOf('\nfunction comparisonCoverageSummary',html.indexOf('function comparisonCoverageReason(row,baseline,metric){')));
const gate=html.slice(html.indexOf('function comparisonDpsValue('),html.indexOf('function comparisonDpsIndex('));
const reason=vm.runInNewContext(gate+source+'\ncomparisonCoverageReason',require('../tools/element-vm-test-setup.cjs').context());
const build=(normal,dps)=>({...MHWElementState.fromValue(0,'none'),kind:'greatsword',power:{profileId:'GS_STANDARD',normal:{comparisonPower:normal},maximum:{comparisonPower:130}},dpsStatus:'VERIFIED',dps});
test('r248 DPS remains comparable when baseline STANDARD power is unavailable',()=>{assert.equal(reason(build(null,50),build(null,100),'dps'),null);});
test('r248 DPS failure is diagnosed from DPS, not normal power',()=>{assert.equal(reason(build(null,null),build(null,100),'dps'),'COMBO_DAMAGE_OR_TIMING_PENDING');assert.equal(reason(build(null,50),build(null,100),'normal'),'BASELINE_NORMAL_POWER_UNAVAILABLE');});
test('r248 profile mismatch still blocks DPS',()=>{const row=build(null,50);row.power.profileId='OTHER';assert.equal(reason(row,build(null,100),'dps'),'STANDARD_PROFILE_MISMATCH');});
