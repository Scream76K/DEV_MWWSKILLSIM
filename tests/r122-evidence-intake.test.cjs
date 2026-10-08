'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {inspectEvidence,blankEvidence}=require('../tools/evidence-intake.cjs');
test('all fourteen weapon forms default unverified',()=>{const {manifest}=require('../tools/capture-manifest.cjs');for(const w of manifest().entries){const r=blankEvidence(w.id);assert.equal(r.verificationStatus,'UNVERIFIED');assert.equal(inspectEvidence(r).ready,false)}});
test('complete metadata is ready for review but not verified',()=>{const r={...blankEvidence('heavy-bowgun'),videoFile:'A.mp4',equipmentRecorded:true,targetRecorded:true,skillLevelsRecorded:true,hitNumbersReadable:true,conditionsRecorded:true};assert.deepEqual(inspectEvidence(r),{ready:true,errors:[],verificationStatus:'UNVERIFIED'})});
test('invalid weapon and mismatched version rejected',()=>{const r={...blankEvidence('bow'),weaponId:'other',gameVersion:'0'};assert.equal(inspectEvidence(r).ready,false)});
test('missing record rejected safely',()=>assert.equal(inspectEvidence(null).ready,false));
