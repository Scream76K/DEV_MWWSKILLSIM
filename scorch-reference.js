(function(root){
 'use strict';
 const evidence=Object.freeze({url:'https://kuroyonhon.com/mhwilds/program/skill.php',motionUrl:'https://kuroyonhon.com/mhwilds/memo/32.php',accessedAt:'2026-10-07',sourceVersion:'POST_1.03',referenceGameVersion:'1.042.00.02',status:'SOURCE_CONFIRMED_NOT_LIVE_VERIFIED',procProbability:1/3,cooldownSeconds:2,whiteFlameCooldown:'SOURCE_CONFLICT',zeroFireHitzone:'PENDING_MINIMUM_ELEMENT_RULE'});
 function number(n,min,max){if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('入力値を確認してください');return n;}
 function damage(o){
  if(!o||o.rank!=null&&o.rank!=='upper')throw Error('上位のみ対応しています');
  const level=number(o.level,1,2),skill=number(o.fireAttack,0,3),hz=number(o.fireHitzone,0,100);
  if(!Number.isInteger(level)||!Number.isInteger(skill))throw Error('スキル段階を確認してください');
  if(hz===0)throw Error('火肉質0の最低ダメージ処理は照合中です');
  const base=level===1?60:120,fixed=level===1?20:40,mult=[1,1,1.1,1.2][skill],flat=[0,4,5,6][skill],element=(base*mult+flat)*hz/100;
  return {status:'SOURCE_REFERENCE',fixed,element,total:fixed+element,level,fireHitzone:hz,fireAttack:skill,rounding:'UNROUNDED_REFERENCE',scope:'UPPER_SCORCH_ONLY_NO_OTHER_BUFFS',evidence};
 }
 function observed(o){const d=damage(o),count=number(o.count,0,1000000);if(!Number.isInteger(count))throw Error('追撃回数は0以上の整数を入力してください');return {...d,count,fixed:d.fixed*count,element:d.element*count,total:d.total*count,perEvent:d.total};}
 function expected(o){
  const d=damage(o),times=o.eligibleHitTimes;
  if(!Array.isArray(times)||times.length>2000)throw Error('対象Hitの時刻一覧が必要です（最大2000Hit）');
  for(let i=0;i<times.length;i++){number(times[i],0,86400);if(i&&times[i]<times[i-1])throw Error('対象Hitの時刻は昇順にしてください');}
  // Exact distribution over the last successful proc. A failed roll does not start cooldown.
  let states=new Map([[-Infinity,1]]),events=0;
  for(const t of times){const next=new Map(),add=(key,p)=>next.set(key,(next.get(key)||0)+p);for(const [last,p] of states){if(t-last<evidence.cooldownSeconds){add(last,p);continue;}const success=p*evidence.procProbability;events+=success;add(last,p-success);add(t,success);}states=next;}
  return {...d,initialState:'READY',eligibleHitCount:times.length,expectedEvents:events,fixed:d.fixed*events,element:d.element*events,total:d.total*events,perEvent:d.total,status:'SOURCE_EXPECTATION_REFERENCE'};
 }
 function forRoute(o,engine){
  if(!o||!Array.isArray(o.techniqueIds)||!o.techniqueIds.length||!engine||typeof engine.scorchPlan!=='function')throw Error('SCORCH_ROUTE:コンボの技と対象判定が必要です');
  if(!Array.isArray(o.hitTimes))throw Error('SCORCH_ROUTE:全Hitの時刻が必要です');
  const plan=engine.scorchPlan(o.weaponType,o.techniqueIds,o.hitTimes);
  if(plan.status!=='SOURCE_TIMELINE_REFERENCE'||!Array.isArray(plan.eligibleHitTimes))throw Error('SCORCH_ROUTE:発動対象が未確認の技を含んでいます');
  const result=expected({...o,eligibleHitTimes:plan.eligibleHitTimes});
  return {status:'SOURCE_ROUTE_EXPECTATION_REFERENCE',plan,result,damageIncluded:false,scope:'SCORCH_ONLY_NO_BODY_DAMAGE_NO_AUTOMATIC_DPS'};
 }
 const api=Object.freeze({evidence,damage,observed,expected,forRoute});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ScorchReference=api;
})(typeof window!=='undefined'?window:globalThis);
