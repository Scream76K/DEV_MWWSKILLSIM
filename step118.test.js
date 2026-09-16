const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf('function finalCandidateScore'); const b=html.indexOf('function cleanOCR',a);
assert(a>=0&&b>0,'Step 1.18 scoring functions missing');
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
console.log('Step 1.18 decision tests: 5/5 passed');
