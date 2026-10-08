'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const match=html.match(/function gunlanceStandardComparisonAdapter\(snapshotA,snapshotB=null,cond=\{\}\)\{[\s\S]*?\n\}/);
assert.ok(match,'gunlance adapter exists');
const sandbox={resolveSnapshotStatsForComparison:x=>x,genericStatsFromCalcState:x=>x,gunlanceBodyComponents:x=>({physical:x.p,element:x.e,comparisonPower:x.p+x.e}),gunlanceEvidenceReady:()=>false,GUNLANCE_STANDARD_PROFILE:{id:'GL_TEST'},GUNLANCE_EVIDENCE:{}};
vm.createContext(sandbox);vm.runInContext(match[0]+';this.run=gunlanceStandardComparisonAdapter',sandbox);
function partial(a,b){try{sandbox.run(a,b)}catch(e){assert.match(e.message,/EVIDENCE_PENDING/);return e.partial}assert.fail('must remain gated')}
test('GL A/B body diagnostic reports only known components',()=>{const p=partial({p:100,e:20},{p:110,e:30});assert.equal(p.bodyDiagnostic.physicalDelta,10);assert.equal(p.bodyDiagnostic.elementDelta,10);assert.equal(p.bodyDiagnostic.bodyPowerDelta,20);assert.equal(p.bodyDiagnostic.scope,'BODY_ONLY_NOT_STANDARD');assert.deepEqual(Array.from(p.excludedFromComparisonPower),['SHELLING','WYRMSTAKE'])});
test('GL single snapshot does not fabricate B',()=>{const p=partial({p:100,e:0},null);assert.equal(p.verifiedBodyB,null);assert.equal(p.bodyDiagnostic,null)});
test('GL zero baseline does not fabricate percentage',()=>{const p=partial({p:0,e:0},{p:10,e:0});assert.equal(p.bodyDiagnostic.bodyPowerPercent,null)});
test('GL invalid B state is rejected',()=>{sandbox.gunlanceBodyComponents=x=>{if(x.bad)throw Error('INVALID_B');return {physical:x.p,element:x.e,comparisonPower:x.p+x.e}};assert.throws(()=>sandbox.run({p:10,e:0},{bad:true}),/INVALID_B/)});
