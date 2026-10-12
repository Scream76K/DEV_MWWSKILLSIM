const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=require('./tools/legacy-ocr-source.cjs')();
assert(html.includes('code.textContent=') && html.includes('function recognizeEquipmentAll('), 'production embedded OCR integration must exist');
const a=html.indexOf('function supportBonus'); const b=html.indexOf('function cleanOCR',a);
assert(a>=0&&b>0,'Step 1.19 scoring functions missing');
const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(a,b)+';this.finalCandidateScore=finalCandidateScore;this.candidateDecision=candidateDecision;',ctx);
const {finalCandidateScore,candidateDecision}=ctx;
const score=x=>finalCandidateScore(x);
const cases=[
  [{avgNameScore:.58,support:1,total:1,supportRatio:1,confAvg:80,bestNameScore:.89},.65,'ambiguous'],
  [{avgNameScore:.63,support:1,total:1,supportRatio:1,confAvg:80,bestNameScore:.90},.69,'ambiguous'],
  [{avgNameScore:.665,support:1,total:1,supportRatio:1,confAvg:80,bestNameScore:.83},.72,'ambiguous'],
  [{avgNameScore:.65,support:2,total:3,supportRatio:.67,confAvg:60,bestNameScore:.80},.57,'auto'],
  [{avgNameScore:.60,support:1,total:3,supportRatio:.33,confAvg:40,bestNameScore:.50},.28,'ambiguous']
];
for(const [x,second,expected] of cases){x.totalScore=score(x).totalScore;assert.equal(candidateDecision(x,second).level,expected)}
console.log('Step 1.19 decision tests: 5/5 passed');

// Step 1.19: candidate gap must be 1st score minus 2nd score; no second candidate => null.
assert.equal(candidateDecision({totalScore:.92,avgNameScore:.89,confAvg:80,supportRatio:1}, .72).level, 'auto');
assert.equal(candidateDecision({totalScore:.92,avgNameScore:.89,confAvg:80,supportRatio:1}, null).level, 'auto');
console.log('Step 1.19 candidate-gap/title tests: passed');
