'use strict';
const assert=require('node:assert/strict');
// Historical assertions explicitly select archived schema-2 diagnostics.
// A current result or missing archive is never a substitute.
function legacyReportRow(report,index=0){
  assert.equal(report?.schemaVersion,3,'current comparison report must declare schema 3');
  assert.equal(report.calculationScope,'CURRENT_CONSUMER_NORMAL_MAXIMUM');
  assert.equal(report.legacyReference?.schemaVersion,2,'archived report schema must remain explicit');
  assert.equal(report.legacyReference.calculationScope,'LEGACY_STANDARD_AND_DPS_NOT_CURRENT_ROUTE');
  const row=report.results?.[index];assert.ok(row,'requested current result must exist');
  assert.ok(Object.hasOwn(row,'legacyReference'),'explicit archived row required');
  const legacy=row.legacyReference;assert.equal(legacy?.calculationScope,'LEGACY_STANDARD_AND_DPS_NOT_CURRENT_ROUTE');
  assert.equal(legacy.name,row.name,'archived and current build identities must match');
  return legacy;
}
module.exports={legacyReportRow};
