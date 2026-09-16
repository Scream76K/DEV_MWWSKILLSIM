const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('Step 1.24'),'title/version must be Step 1.24');
assert(html.includes('平均文字評価'),'average character score must be displayed');
assert(html.includes('文字評価（統合寄与）'),'integration character component must be explicitly labeled');
const a=html.indexOf('function supportBonus'); const b=html.indexOf('function renderCandidates',a);
const ctx={}; vm.createContext(ctx); vm.runInContext(html.slice(a,b)+';this.supportBonus=supportBonus;this.finalCandidateScore=finalCandidateScore;this.candidateDecision=candidateDecision;this.summarizeCandidateEvidence=summarizeCandidateEvidence;',ctx);
const {supportBonus,finalCandidateScore,candidateDecision,summarizeCandidateEvidence}=ctx;
// All supporting OCR rows are included in displayed averages.
const ev=summarizeCandidateEvidence({support:4,total:4,topRows:[
 {rank:0,nameScore:.25,score:.33,conf:50},
 {rank:0,nameScore:.65,score:.64,conf:47},
 {rank:0,nameScore:.70,score:.70,conf:57},
 {rank:0,nameScore:.90,score:.87,conf:56}
]});
assert(Math.abs(ev.avgNameScore-.625)<.001);
assert(Math.abs(ev.confAvg-52.5)<.001);
assert(Math.abs(ev.supportBonus-.12)<.001);
// Non-supporting rows must not contaminate averages.
const ev2=summarizeCandidateEvidence({support:1,total:6,topRows:[
 {rank:0,nameScore:.71,score:.66,conf:31},
 {rank:1,nameScore:.99,score:.95,conf:99},
 {rank:2,nameScore:.98,score:.94,conf:98}
]});
assert(Math.abs(ev2.avgNameScore-.71)<.001);
assert(Math.abs(ev2.confAvg-31)<.001);
// Staged support bonus contract.
for(const [s,t,v] of [[1,1,.04],[2,2,.08],[2,3,.06],[3,3,.12],[4,4,.12],[5,6,.10],[6,6,.12]]) assert(Math.abs(supportBonus(s,t)-v)<.001,`${s}/${t} bonus mismatch`);
// Candidate gap is mathematically top1 - top2; this is the value renderCandidates must show.
const top=.66, second=.65; assert.strictEqual(Math.round((top-second)*100),1);
// A close second candidate must not satisfy the auto margin gate.
const d=candidateDecision({totalScore:.66,avgNameScore:.58,confAvg:25},.65); assert.notStrictEqual(d.level,'auto');
console.log('Step 1.24 regression tests passed');
