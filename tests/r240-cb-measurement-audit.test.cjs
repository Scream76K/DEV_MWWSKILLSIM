const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('r240 audit enumerates phial moves without inventing counts',()=>{
  const start=src.indexOf('const CHARGE_BLADE_TECHNIQUES=');
  const end=src.indexOf('function chargeBladeEvidencePhialCount(',start);
  assert.ok(start>=0&&end>start);
  const context=vm.createContext({});
  vm.runInContext(src.slice(start,end)+';globalThis.audit=chargeBladePhialMeasurementAudit();',context);
  const audit=JSON.parse(JSON.stringify(context.audit));
  assert.equal(audit.length,5);
  assert.equal(audit.filter(x=>x.measurementNeeded).length,5);
  assert.ok(audit.every(x=>x.count===null&&x.countStatus==='MEASUREMENT_REQUIRED'&&x.source===null));
  assert.ok(audit.every(x=>x.coefficientStatus==='PROVISIONAL_EXISTING'));
});
