'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,plan,clean,components,area}=require('./thunder-runtime.cjs');
test('all 71 GL cases preserve other results; exactly two originals become available',async()=>{
 const h=await load(),report={baselineProduct:'abe5963fe445fe16a81675b8db97adfddec3cb90',numericGameAccuracyVerified:false,cases:[]};let beforeResolved=0,afterResolved=0;try{
  for(const job of plan.cases){const input=h.capture({...job,techniqueIds:job.techniqueIds||(job.route==='EXPLICIT_SLAM_SWEEP'?['canonical:GL_SLAM','canonical:GL_SWEEP']:[])});
   if(job.conditionOverrides)input.conditions={...input.conditions,...job.conditionOverrides};
   if(job.route==='EXPLICIT_NORMAL_SHELL')input.gunlanceState={...input.gunlanceState,loadedRounds:6,shellingType:'NORMAL',shellingPower:'MEDIUM',fireHitzone:30};
   const a=clean(h.baseline.evaluateCurrent(h.copy(input))),b=clean(h.candidate.evaluateCurrent(h.copy(input))),target=['original:162:1:gunlance','original:162:2:gunlance'].includes(job.key);
   for(const ch of ['normal','maximum']){
    assert.deepEqual(components(a,ch).filter(p=>p.coefficientUnit!=='SHELLING'),components(b,ch).filter(p=>p.coefficientUnit!=='SHELLING'),'body unchanged '+job.key+':'+ch);
    if(target){assert.equal(a.channels[ch].metrics.comboTotalDamage.status,'unavailable');assert.equal(b.channels[ch].metrics.comboTotalDamage.status,'available');}
    else assert.deepEqual(b.channels,a.channels,'unchanged '+job.key);
   }
   if(job.key.startsWith('original:')){beforeResolved+=a.channels?.maximum?.metrics?.comboTotalDamage?.status==='available';afterResolved+=b.channels?.maximum?.metrics?.comboTotalDamage?.status==='available';}
   report.cases.push({key:job.key,status:'PASS',changed:target,bodyUnchanged:true,baselineTotal:a.channels?.maximum?.metrics?.comboTotalDamage,candidateTotal:b.channels?.maximum?.metrics?.comboTotalDamage});
  }
  assert.equal(report.cases.length,71);assert.equal(beforeResolved,31);assert.equal(afterResolved,33);report.counts={cases:71,beforeResolved,afterResolved,originalBlocked:0,newlyAvailable:2};report.status='PASS';
 }finally{h.close();fs.writeFileSync(area+'/regression-71.json',JSON.stringify(report,null,2));}
});
