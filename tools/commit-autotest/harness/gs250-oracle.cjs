'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function loadOracle(databaseSha256){
 const file=__dirname+'/oracle/gs250/expected-values.json',bytes=fs.readFileSync(file),oracle=JSON.parse(bytes),contractBytes=fs.readFileSync(__dirname+'/oracle/gs250/source-contract.json');
 assert.equal(oracle.databaseSha256,databaseSha256,'GS250 oracle fixed DB mismatch');assert.equal(hash(contractBytes),oracle.sourceContractSha256,'GS250 source contract mismatch');assert.equal(oracle.status,'ADOPTED_COEFFICIENT_SOURCE_FORMULA_MATCH_UNROUNDED_ONLY');assert.equal(Number(oracle.absoluteTolerance),1e-9);assert.equal(oracle.cases.length,8);
 return {...oracle,expectedValuesSha256:hash(bytes),sourceContract:JSON.parse(contractBytes)};
}
function compareExpectedCase(expected,comparison,tolerance){
 assert.ok(expected?.expected,'Missing source-derived expectation');assert.equal(tolerance,1e-9);
 const channels={};let scalarComparisons=0,mismatches=0,maxAbsoluteError=0;
 for(const channel of ['normal','maximum']){
  const checks=[];
  for(const stage of ['before','after','delta'])for(const component of ['physical','element','total']){
   const expectedText=expected.expected[stage][component],expectedValue=Number(expectedText),observed=comparison.channels?.[channel]?.[stage]?.[component];assert.ok(Number.isFinite(expectedValue),'Nonfinite expected value');
   const error=Number.isFinite(observed)?Math.abs(observed-expectedValue):null,match=error!==null&&error<=tolerance;
   scalarComparisons++;if(!match)mismatches++;if(error!==null)maxAbsoluteError=Math.max(maxAbsoluteError,error);
   checks.push({stage,component,expected:expectedText,observed:Number.isFinite(observed)?observed:null,absoluteErrorAsJavaScriptNumber:error,match});
  }
  channels[channel]={match:checks.every(c=>c.match),checks};
 }
 return {status:mismatches?'ADOPTED_SOURCE_FORMULA_MISMATCH':'ADOPTED_COEFFICIENT_SOURCE_FORMULA_MATCH_UNROUNDED_ONLY',key:expected.key,coefficient:expected.coefficient,expectedFactor:expected.expectedFactor,absoluteTolerance:tolerance,scalarComparisons,mismatches,maxAbsoluteErrorAsJavaScriptNumber:maxAbsoluteError,channels,numericAccuracyVerified:false,gameActivationObserved:false};
}
module.exports={loadOracle,compareExpectedCase};
