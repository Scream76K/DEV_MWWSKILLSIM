const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('r240 audit enumerates phial moves without inventing counts',()=>{
  const start=src.indexOf('const CHARGE_BLADE_TECHNIQUES=');
  const end=src.indexOf('function chargeBladeEvidencePhialCount(',start);
  assert.ok(start>=0&&end>start);
  const context=vm.createContext({window:{}});
  vm.runInContext(src.slice(start,end)+';globalThis.audit=chargeBladePhialMeasurementAudit();',context);
  const audit=JSON.parse(JSON.stringify(context.audit));
  assert.equal(audit.length,5);
  // Four explicit owner-video counts are provisional, never silently VERIFIED.
  const known={CB_ELEMENT_DISCHARGE_1:1,CB_ELEMENT_DISCHARGE_2:2,CB_AED:2,CB_FOLLOWUP_AED:3};
  assert.equal(audit.filter(x=>x.measurementNeeded).length,1);
  for(const [id,count] of Object.entries(known)){const row=audit.find(x=>x.techniqueId===id);assert.ok(row,id);assert.equal(row.count,count);assert.equal(row.countStatus,'PROVISIONAL');assert.equal(row.measurementNeeded,false);assert.match(row.source,/^USER_VIDEO_OBSERVATION:/);assert.equal(row.priority,'COEFFICIENT_REVIEW');}
  const unknown=audit.find(x=>x.techniqueId==='CB_SHIELD_THRUST');assert.ok(unknown);assert.equal(unknown.count,null);assert.equal(unknown.countStatus,'MEASUREMENT_REQUIRED');assert.equal(unknown.source,null);assert.equal(unknown.priority,'COUNT_FIRST');
  assert.match(unknown.measurementInstruction,/distinguish body hits from phial hits/);
  assert.ok(audit.every(x=>x.coefficientStatus==='PROVISIONAL_EXISTING'));
});
