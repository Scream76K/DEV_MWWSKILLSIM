const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('Step 1.19'),'title must be Step 1.19');
const a=html.indexOf('function finalCandidateScore'); const b=html.indexOf('function cleanOCR',a);
assert(a>=0&&b>0,'Step 1.19 scoring functions missing');
const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(a,b)+';this.finalCandidateScore=finalCandidateScore;this.candidateDecision=candidateDecision;',ctx);
const {finalCandidateScore,candidateDecision}=ctx;
const score=x=>finalCandidateScore(x);
const cases=[
  [{avgNameScore:.58,supportRatio:1,confAvg:80,bestNameScore:.89},.65,'auto'],
  [{avgNameScore:.63,supportRatio:1,confAvg:80,bestNameScore:.90},.69,'auto'],
  [{avgNameScore:.665,supportRatio:1,confAvg:80,bestNameScore:.83},.72,'auto'],
  [{avgNameScore:.65,supportRatio:.67,confAvg:60,bestNameScore:.80},.57,'confirm'],
  [{avgNameScore:.60,supportRatio:.33,confAvg:40,bestNameScore:.50},.28,'ambiguous']
];
for(const [x,second,expected] of cases){x.final=score(x);assert.equal(candidateDecision(x,second).level,expected)}
console.log('Step 1.19 decision tests: 5/5 passed');

// Step 1.19: candidate gap must be 1st score minus 2nd score; no second candidate => null.
assert.equal(candidateDecision({final:.92,avgNameScore:.89,supportRatio:1}, .72).level, 'auto');
assert.equal(candidateDecision({final:.92,avgNameScore:.89,supportRatio:1}, null).level, 'auto');
console.log('Step 1.19 candidate-gap/title tests: passed');
