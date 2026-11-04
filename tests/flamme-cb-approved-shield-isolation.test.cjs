'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {APPROVED_SHIELD, MISMATCH, validateApprovedPowerHShield} =
  require('../v10-six-layer-foundation/min8/cb-approved-shield-contract.cjs');

const exact = () => ({
  weaponType: 'charge-blade',
  phialType: 'POWER_ELEMENT',
  routeScope: APPROVED_SHIELD.scope,
  techniqueId: 'CB_SHIELD_THRUST',
  resourceContractId: 'CB_H_PREFIX_RESOURCE',
  phialReferenceStatus: 'OWNER_APPROVED_PROVISIONAL',
  phialExplosionHits: 1,
  consumedPhials: 0,
  ownerDecision: {...APPROVED_SHIELD}
});

test('only the exact owner-approved shield contract passes', () => {
  assert.deepEqual(validateApprovedPowerHShield(exact()), {ok:true, reason:null});
});

test('incorrect scope, phial type, weapon type, and technique fail closed', () => {
  for (const [key, value] of [
    ['weaponType','great-sword'], ['phialType','IMPACT'],
    ['routeScope','CB_H_GENERAL'], ['techniqueId','CB_AXE_TO_SWORD_MORPH'],
    ['resourceContractId','CB_DISCHARGE_RESOURCE']
  ]) {
    assert.deepEqual(validateApprovedPowerHShield({...exact(), [key]:value}),
      {ok:false, reason:MISMATCH}, key);
  }
});

test('missing phial source status fails closed', () => {
  for (const phialReferenceStatus of [undefined,null,'UNKNOWN','GAME_MEASURED']) {
    assert.equal(validateApprovedPowerHShield({...exact(),phialReferenceStatus}).ok,false);
  }
});

test('missing, nonzero or altered phial hits and resource cost fail closed', () => {
  for (const key of ['phialExplosionHits','consumedPhials']) {
    for (const value of [undefined, null, 2, -1, '0']) {
      assert.equal(validateApprovedPowerHShield({...exact(), [key]:value}).ok,
        false, key+':'+String(value));
    }
  }
});

test('provisional or altered decision metadata never silently promotes', () => {
  for (const [key, value] of [
    ['status','OWNER_APPROVED_PROVISIONAL'],
    ['scope','CB_H_ALL'],
    ['verificationStatus','GAME_MEASURED'],
    ['phialExplosionHits',2],
    ['consumedPhials',1],
    ['decisionDate','2026-11-05']
  ]) {
    assert.equal(validateApprovedPowerHShield({
      ...exact(), ownerDecision:{...APPROVED_SHIELD,[key]:value}
    }).ok, false, key);
  }
  assert.equal(validateApprovedPowerHShield({...exact(),ownerDecision:null}).ok,false);
  assert.equal(validateApprovedPowerHShield(null).ok,false);
});

test('approval object is immutable and not an in-game measurement claim', () => {
  assert.equal(Object.isFrozen(APPROVED_SHIELD),true);
  assert.equal(APPROVED_SHIELD.verificationStatus,
    'OWNER_SPEC_CONFIRMED_GAME_MEASUREMENT_NOT_CLAIMED');
});

test('public build entrypoint remains fail closed for POWER_ELEMENT H route', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = fs.readFileSync(path.join(__dirname,'..','hope-hammer-browser-adapter.js'),'utf8');
  assert.ok(source.includes("if(officialPhialType!=='IMPACT'||chargeBladeState.phialType!=='IMPACT')return fail('REAL_SLICE:CB_H_IMPACT_ONLY')"));
  assert.ok(!source.includes('CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH'),
    'this isolation branch must not secretly contain PR #1 production wiring');
});

test('shared adapter and both browser aliases validate approved shield without enabling full H', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname,'..');
  const product = fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'),'utf8');
  const bundle = fs.readFileSync(path.join(root,'himmel-real-browser-bundle.js'),'utf8');
  assert.ok(product.includes('CB_H_IMPACT_ONLY'));
  const shared = fs.readFileSync(path.join(root,'v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'),'utf8');
  assert.ok(shared.includes('validateApprovedPowerHShield({weaponType'));
  assert.equal((bundle.match(/validateApprovedPowerHShield\(\{weaponType/g)||[]).length,2);
  assert.equal((bundle.match(/define\("[./]+cb-approved-shield-contract\.cjs"/g)||[]).length,2);
  assert.equal((bundle.match(/require\('\.\/cb-approved-shield-contract\.cjs'\)/g)||[]).length,2);
  assert.equal((bundle.match(/r\.status==='OWNER_APPROVED'&&techniqueId==='CB_SHIELD_THRUST'/g)||[]).length,2);
  assert.ok(!product.includes('validateApprovedPowerHShield({weaponType'),
    'do not accidentally enable unreviewed POWER_ELEMENT H at product calcBuild entrypoint');
});

const {adaptOrdinaryPhysicalHit} =
  require('../v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs');

const shieldRecord = () => ({
  techniqueId:'CB_SHIELD_THRUST',
  weaponType:'charge-blade',
  revision:1,
  verificationStatus:'OWNER_APPROVED_PROVISIONAL',
  adoption:{approval:'Sentinel_b0338f54b160819183484aed19d41354'},
  evidenceRefs:['test:owner-approved-shield-contract'],
  hits:[{mv:12,elementModifier:0,partModifier:1,damageType:'blunt'}],
  phialReference:{status:'OWNER_APPROVED_PROVISIONAL',hitCount:1,
    sourceRefs:['test:owner-approved-phial-hit']},
  phialState:{phialType:'POWER_ELEMENT'},
  resourceContract:{
    id:'CB_H_PREFIX_RESOURCE',status:'OWNER_APPROVED',
    ownerDecision:{...APPROVED_SHIELD},consumeNormalPhials:0,
    resourceKey:'normalPhials',endMode:'SWORD',
    nextPreviousAction:'SHIELD_THRUST',source:'test:owner'
  }
});
const adaptShield = record => adaptOrdinaryPhysicalHit({
  weaponType:'charge-blade',techniqueId:'CB_SHIELD_THRUST',
  record,dbVersion:'test-isolated',elementContext:{
    displayElement:0,effectsResolved:true,activeElementEffects:[]
  }
});

test('shared adapter emits one real phial hit and a transition for exact shield', () => {
  const result=adaptShield(shieldRecord());
  assert.equal(result.events.length,2);
  assert.equal(result.events[0].type,'hit');
  const phials=result.events[0].components.filter(c=>c.kind==='phial');
  assert.equal(phials.length,1);
  assert.equal(phials[0].parameters.phialCount,1);
  assert.equal(phials[0].parameters.consumption.amount,0);
  assert.equal(result.events[1].type,'transition');
  assert.equal(result.events.some(e=>e.type==='consume'),false);
});

test('shared adapter rejects tampered approved-shield scope, count, cost and source', () => {
  const altered=[
    r=>{r.resourceContract.consumeNormalPhials=1;},
    r=>{r.phialReference.hitCount=2;},
    r=>{r.phialReference.status='UNKNOWN';},
    r=>{r.resourceContract.ownerDecision.scope='CB_H_ALL';},
    r=>{r.resourceContract.ownerDecision.status='OWNER_APPROVED_PROVISIONAL';},
    r=>{r.phialState.phialType='IMPACT';}
  ];
  for(const mutate of altered){
    const record=shieldRecord();
    mutate(record);
    assert.throws(()=>adaptShield(record),
      /REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID/);
  }
});

test('both browser bundle aliases emit the same exact approved shield event', () => {
  const fs=require('node:fs');
  const path=require('node:path');
  const vm=require('node:vm');
  const bundle=fs.readFileSync(path.join(__dirname,'..','himmel-real-browser-bundle.js'),'utf8');
  const marker="root.HimmelRealOneHitPipeline=requireModule('/real-one-hit-pipeline.cjs').createRealOneHitPipeline;";
  assert.ok(bundle.includes(marker));
  const probe=bundle.replace(marker,'root.__testRequireModule=requireModule;\n'+marker);
  const browser={};
  vm.runInNewContext(probe,{window:browser,structuredClone},
    {timeout:5000});
  const paths=['/real-technique-one-hit-adapter.cjs','./real-technique-one-hit-adapter.cjs'];
  for(const alias of paths){
    const fn=browser.__testRequireModule(alias).adaptOrdinaryPhysicalHit;
    const adapt=record=>fn({
      weaponType:'charge-blade',techniqueId:'CB_SHIELD_THRUST',
      record,dbVersion:'test-bundle',elementContext:{
        displayElement:0,effectsResolved:true,activeElementEffects:[]
      }
    });
    const result=adapt(shieldRecord());
    assert.deepEqual(Array.from(result.events,e=>e.type),['hit','transition'],alias);
    const phials=result.events[0].components.filter(c=>c.kind==='phial');
    assert.equal(phials.length,1,alias);
    assert.equal(phials[0].parameters.phialCount,1,alias);
    assert.equal(phials[0].parameters.consumption.amount,0,alias);
    assert.throws(()=>adapt({...shieldRecord(),resourceContract:{
      ...shieldRecord().resourceContract,consumeNormalPhials:1
    }}),/REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID/,alias);
  }
});

test('legacy provisional H prefix remains provisional and morph cannot borrow approval', () => {
  const provisional=shieldRecord();
  provisional.resourceContract.status='OWNER_APPROVED_PROVISIONAL';
  provisional.resourceContract.ownerDecision=null;
  const result=adaptShield(provisional);
  assert.equal(result.events[0].components.filter(c=>c.kind==='phial').length,1);
  assert.equal(provisional.resourceContract.status,'OWNER_APPROVED_PROVISIONAL');
  const wrong=shieldRecord();
  wrong.techniqueId='CB_AXE_TO_SWORD_MORPH';
  wrong.resourceContract.ownerDecision={...APPROVED_SHIELD,techniqueId:'CB_AXE_TO_SWORD_MORPH'};
  assert.throws(()=>adaptOrdinaryPhysicalHit({
    weaponType:'charge-blade',techniqueId:'CB_AXE_TO_SWORD_MORPH',
    record:wrong,dbVersion:'test-isolated',elementContext:{
      displayElement:0,effectsResolved:true,activeElementEffects:[]
    }
  }),/REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID/);
});

test('both browser aliases and Node adapter reject the same approval-boundary mutations', () => {
  const fs=require('node:fs');
  const path=require('node:path');
  const vm=require('node:vm');
  const bundle=fs.readFileSync(path.join(__dirname,'..','himmel-real-browser-bundle.js'),'utf8');
  const marker="root.HimmelRealOneHitPipeline=requireModule('/real-one-hit-pipeline.cjs').createRealOneHitPipeline;";
  assert.equal(bundle.split(marker).length,2,'browser entry marker must occur exactly once');
  const browser={};
  vm.runInNewContext(bundle.replace(marker,'root.__testRequireModule=requireModule;\n'+marker),
    {window:browser,structuredClone},{timeout:5000});
  const adapters=[
    ['node',adaptOrdinaryPhysicalHit],
    ['/alias',browser.__testRequireModule('/real-technique-one-hit-adapter.cjs').adaptOrdinaryPhysicalHit],
    ['./alias',browser.__testRequireModule('./real-technique-one-hit-adapter.cjs').adaptOrdinaryPhysicalHit]
  ];
  const cases=[
    ['wrong-weapon',r=>{r.weaponType='great-sword';}],
    ['wrong-technique',r=>{r.techniqueId='CB_AXE_TO_SWORD_MORPH';}],
    ['wrong-phial',r=>{r.phialState.phialType='IMPACT';}],
    ['wrong-hit-count',r=>{r.phialReference.hitCount=2;}],
    ['missing-source-status',r=>{delete r.phialReference.status;}],
    ['cost-one',r=>{r.resourceContract.consumeNormalPhials=1;}],
    ['wrong-decision-scope',r=>{r.resourceContract.ownerDecision.scope='CB_H_ALL';}],
    ['provisional-decision',r=>{r.resourceContract.ownerDecision.status='OWNER_APPROVED_PROVISIONAL';}]
  ];
  for(const [alias,adapt] of adapters){
    for(const [caseName,mutate] of cases){
      const record=shieldRecord();mutate(record);
      // Wrong weapon/technique is rejected at DB identity; all other mutations
      // are rejected by the scoped H prefix contract. No fabricated value.
      assert.throws(()=>adapt({
        weaponType:'charge-blade',techniqueId:'CB_SHIELD_THRUST',record,
        dbVersion:'test-negative-parity',elementContext:{
          displayElement:0,effectsResolved:true,activeElementEffects:[]
        }
      }),caseName==='wrong-weapon'||caseName==='wrong-technique'
        ?/REAL_SLICE:DB_IDENTITY_MISMATCH/
        :/REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID/,alias+':'+caseName);
    }
  }
});

test('shared and both browser aliases emit identical approved shield event payloads', () => {
  const fs=require('node:fs');
  const path=require('node:path');
  const vm=require('node:vm');
  const bundle=fs.readFileSync(path.join(__dirname,'..','himmel-real-browser-bundle.js'),'utf8');
  const marker="root.HimmelRealOneHitPipeline=requireModule('/real-one-hit-pipeline.cjs').createRealOneHitPipeline;";
  assert.equal(bundle.split(marker).length,2);
  const browser={};
  vm.runInNewContext(bundle.replace(marker,'root.__testRequireModule=requireModule;\n'+marker),
    {window:browser,structuredClone},{timeout:5000});
  const fnList=[
    adaptOrdinaryPhysicalHit,
    browser.__testRequireModule('/real-technique-one-hit-adapter.cjs').adaptOrdinaryPhysicalHit,
    browser.__testRequireModule('./real-technique-one-hit-adapter.cjs').adaptOrdinaryPhysicalHit
  ];
  const outputs=fnList.map(fn=>{
    const result=fn({
      weaponType:'charge-blade',techniqueId:'CB_SHIELD_THRUST',
      record:shieldRecord(),dbVersion:'test-payload-parity',
      elementContext:{displayElement:0,effectsResolved:true,activeElementEffects:[]}
    });
    return JSON.parse(JSON.stringify(result.events));
  });
  assert.deepEqual(outputs[1],outputs[0],'absolute bundle alias must match Node');
  assert.deepEqual(outputs[2],outputs[0],'relative bundle alias must match Node');
  const hit=outputs[0].find(e=>e.type==='hit');
  assert.equal(hit.components.filter(c=>c.kind==='phial').length,1);
  assert.equal(outputs[0].filter(e=>e.type==='consume').length,0);
});
