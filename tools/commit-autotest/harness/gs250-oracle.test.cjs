'use strict';
const assert=require('node:assert/strict'),{compareExpectedCase}=require('./gs250-oracle.cjs');
// Invented arithmetic checks comparator behavior, not MH Wilds expectations.
const expected={key:'synthetic-comparator-control',expected:{
 before:{physical:'10',element:'2',total:'12'},
 after:{physical:'10',element:'3',total:'13'},
 delta:{physical:'0',element:'1',total:'1'}
}};
const values=Object.fromEntries(Object.entries(expected.expected).map(([k,v])=>[k,Object.fromEntries(Object.entries(v).map(([component,n])=>[component,Number(n)]))]));
const observed={channels:{normal:structuredClone(values),maximum:structuredClone(values)}};
const good=compareExpectedCase(expected,observed,1e-9);assert.equal(good.scalarComparisons,18);assert.equal(good.mismatches,0);
const wrong=structuredClone(observed);wrong.channels.normal.after.element+=1;const bad=compareExpectedCase(expected,wrong,1e-9);assert.equal(bad.mismatches,1);
const wrongDelta=structuredClone(observed);wrongDelta.channels.maximum.delta.total=0;assert.equal(compareExpectedCase(expected,wrongDelta,1e-9).mismatches,1);
const missing=structuredClone(observed);delete missing.channels.normal;assert.equal(compareExpectedCase(expected,missing,1e-9).mismatches,9);
console.log(JSON.stringify({status:'PASS',scope:'COMPARATOR_CONTROLS_NOT_PRODUCT_MUTATION',positiveScalarChecks:18,wrongElementRejected:true,wrongDeltaRejected:true,missingChannelRejected:true}));
