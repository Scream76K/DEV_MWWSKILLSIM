const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('Step 1.23'),'title must be Step 1.23');
assert(html.includes('総合スコア'),'display must expose total score');
const a=html.indexOf('function supportBonus'); const b=html.indexOf('function renderCandidates',a);
const ctx={}; vm.createContext(ctx); vm.runInContext(html.slice(a,b)+';this.supportBonus=supportBonus;this.finalCandidateScore=finalCandidateScore;this.totalCandidateScore=totalCandidateScore;this.candidateDecision=candidateDecision;this.summarizeCandidateEvidence=summarizeCandidateEvidence;',ctx);
const {supportBonus,finalCandidateScore,candidateDecision}=ctx;
const x={avgNameScore:.63,confAvg:50,bestNameScore:.90,support:3,total:3};
const s=finalCandidateScore(x);
assert(s && typeof s==='object','final score must expose components');
assert('charScore' in s && 'supportBonus' in s && 'ocrConfidence' in s && 'totalScore' in s,'score components missing');
assert(Math.abs(s.charScore-.576)<.001,'character component mismatch');
assert(Math.abs(s.supportBonus-.12)<.001,'support component mismatch');
assert(Math.abs(s.ocrConfidence-.075)<.001,'OCR component mismatch');
assert(Math.abs(s.totalScore-.771)<.001,'total score mismatch');
assert(Math.abs(finalCandidateScore({avgNameScore:.89,confAvg:88,bestNameScore:.89,support:1,total:1}).supportBonus-.04)<.001);
const d=candidateDecision({totalScore:.81,avgNameScore:.60,confAvg:60},null); assert(d.level==='auto','high-confidence single candidate should auto-confirm');
const d2=candidateDecision({totalScore:.81,avgNameScore:.60,confAvg:30},null); assert(d2.level==='confirm','low OCR confidence should require confirmation');
console.log('Step 1.22 baseline regression expectations reached');

// Step 1.23 RED: aggregate evidence must average ALL supporting OCR rows,
// and support bonus must be derived from support/total rather than omitted.
assert.strictEqual(typeof ctx.summarizeCandidateEvidence,'function','candidate evidence summarizer must exist');
const ev=ctx.summarizeCandidateEvidence({
  support:4,total:4,
  topRows:[
    {rank:0,nameScore:.25,score:.33,conf:50},
    {rank:0,nameScore:.65,score:.64,conf:47},
    {rank:0,nameScore:.70,score:.70,conf:57},
    {rank:0,nameScore:.90,score:.87,conf:56}
  ],
  bestNameScore:.90
});
assert(Math.abs(ev.avgNameScore-.625)<.001,'average name score must include all four rows');
assert(Math.abs(ev.confAvg-52.5)<.001,'OCR confidence average must include all four rows');
assert(Math.abs(ev.supportBonus-.12)<.001,'4/4 support bonus must be +12pt');
assert(Math.abs(ev.totalScore-finalCandidateScore({...ev,support:4,total:4}).totalScore)<.001,'display and scoring must use same evidence');
console.log('Step 1.23 RED expectations reached');
assert(Math.abs(ctx.supportBonus(1,1)-0.04)<.001);
assert(Math.abs(ctx.supportBonus(2,2)-0.08)<.001);
assert(Math.abs(ctx.supportBonus(2,3)-0.06)<.001);
assert(Math.abs(ctx.supportBonus(3,3)-0.12)<.001);
assert(Math.abs(ctx.supportBonus(5,6)-0.10)<.001);
assert(Math.abs(ctx.supportBonus(6,6)-0.12)<.001);
const ev2=ctx.summarizeCandidateEvidence({
  support:1,total:6,
  topRows:[
    {rank:0,nameScore:.71,score:.66,conf:31},
    {rank:1,nameScore:.99,score:.95,conf:99},
    {rank:2,nameScore:.98,score:.94,conf:98}
  ],bestNameScore:.71
});
assert(Math.abs(ev2.avgNameScore-.71)<.001,'non-supporting top-3 rows must not alter average character score');
assert(Math.abs(ev2.confAvg-31)<.001,'non-supporting top-3 rows must not alter OCR confidence average');
assert(Math.abs(ev2.supportBonus)<.001,'1/6 must not receive a staged support bonus');
console.log('Step 1.23 regression expectations reached');
