'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {legacyReportRow}=require('../tools/legacy-comparison-report-test-helper.cjs');
const scope='LEGACY_STANDARD_AND_DPS_NOT_CURRENT_ROUTE';
function fixture(){return {schemaVersion:3,calculationScope:'CURRENT_CONSUMER_NORMAL_MAXIMUM',legacyReference:{schemaVersion:2,calculationScope:scope},results:[{name:'A',powerIndex:111,legacyReference:{name:'A',calculationScope:scope,powerIndex:222}}]};}
test('historical report assertions select explicitly archived values, not current principal values',()=>{assert.equal(legacyReportRow(fixture()).powerIndex,222);});
test('historical report selector rejects old schemas and missing declared scopes',()=>{for(const mutate of [r=>r.schemaVersion=2,r=>delete r.calculationScope,r=>delete r.legacyReference,r=>r.legacyReference.schemaVersion=3,r=>delete r.legacyReference.calculationScope]){const r=fixture();mutate(r);assert.throws(()=>legacyReportRow(r));}});
test('historical report selector rejects missing rows and archives without root-value fallback',()=>{for(const mutate of [r=>r.results=[],r=>delete r.results[0].legacyReference,r=>r.results[0].legacyReference=null]){const r=fixture();mutate(r);assert.throws(()=>legacyReportRow(r));}});
test('historical report selector rejects row-scope and build-identity mismatch',()=>{for(const mutate of [r=>r.results[0].legacyReference.calculationScope='CURRENT',r=>r.results[0].legacyReference.name='B']){const r=fixture();mutate(r);assert.throws(()=>legacyReportRow(r));}});
