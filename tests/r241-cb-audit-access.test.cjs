const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('r241 phial audit requires valid base coefficients and prioritizes count capture',()=>{
  const start=src.indexOf('const CHARGE_BLADE_TECHNIQUES=');
  const end=src.indexOf('function chargeBladeEvidencePhialCount(',start);
  const context=vm.createContext({});
  vm.runInContext(src.slice(start,end)+`;globalThis.audit=chargeBladePhialMeasurementAudit();globalThis.fn=chargeBladePhialMeasurementAudit;`,context);
  const audit=JSON.parse(JSON.stringify(context.audit));
  assert.equal(audit.length,5);
  const byId=Object.fromEntries(audit.map(x=>[x.techniqueId,x]));
  assert.equal(byId.CB_SHIELD_THRUST.priority,'COUNT_FIRST');
  assert.equal(byId.CB_SHIELD_THRUST.measurementNeeded,true);
  for(const id of ['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED']){
    assert.equal(byId[id].priority,'COEFFICIENT_REVIEW');
    assert.equal(byId[id].measurementNeeded,false);
  }
  vm.runInContext(`CHARGE_BLADE_TECHNIQUES.CB_AED.phial.impactCoefficient=NaN`,context);
  assert.equal(JSON.parse(JSON.stringify(vm.runInContext('chargeBladePhialMeasurementAudit()',context))).find(x=>x.techniqueId==='CB_AED').coefficientStatus,'REVIEW_REQUIRED');
});
test('r241 public audit entry point exists',()=>assert.match(src,/window\.ChargeBladeEngine=\{phialMeasurementAudit:chargeBladePhialMeasurementAudit/));
