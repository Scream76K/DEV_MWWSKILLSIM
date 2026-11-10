'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {input,raw,accepted,rejected,load}=require('../input-guard-regression/synthetic.cjs');
test('valid explicit target reaches skill guards then nonnumeric sentinel',()=>{const a=input();accepted(a);rejected(raw(input(),{skill:{id:999999,name:'通常弾・通常矢強化'},level:1}),/SKILL_IDENTITY_MISMATCH/);});
test('invalid target never impersonates a passed skill guard',()=>{const a=input();a.target={monster:'SYNTHETIC_INGRESS_SENTINEL',part:'SYNTHETIC_PART'};rejected(a,/TARGET_ID_INVALID$/);});
test('invalid hitzone refuses before damage and preserves inputs',()=>{const a=input();a.trainingRoom.parts[0].multipliers.fire='0';const before=JSON.stringify(a),h=load();const result=h.evaluate(a);assert.equal(result.reason,'REAL_SLICE:TARGET_HITZONE_INVALID');assert.equal(h.calls.pipeline,0);assert.equal(JSON.stringify(a),before);});
