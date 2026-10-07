(function(root){
 'use strict';
 function number(n,min,max){if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('入力値を確認してください');return n;}
 function observed(o,engine){
  if(!o||!engine||typeof engine.get!=='function')throw Error('技DBが必要です');
  const record=engine.get('great-sword','GS_DARK_ARTS_WAVE'),v=record?.specialSourceValues;
  if(record?.calculationScope!=='SPECIAL_SOURCE_REFERENCE_ONLY'||v?.status!=='SOURCE_CONFIRMED'||v.weaponElementUsed!==false||!v.physicalCrit||!v.physicalSharpness||!v.elementSharpness)throw Error('衝撃波の資料値が未確認です');
  if(o.otherBuffs!=null&&(!Array.isArray(o.otherBuffs)||o.otherBuffs.length))throw Error('他の属性・追加強化との併用は照合中です');
  const attack=number(o.attack,0,10000),affinity=number(o.affinity,-100,100),criticalMultiplier=number(o.criticalMultiplier,1,2),sharp=number(o.sharpness,0.01,2),esharp=number(o.elementSharpness,0.01,2),hz=number(o.physicalHitzone,0,100),dhz=number(o.dragonHitzone,0,100),level=number(o.dragonAttack,0,3),count=number(o.count,0,10000);
  if(!Number.isInteger(level)||!Number.isInteger(count))throw Error('スキル段階・追撃回数は整数を入力してください');
  if(dhz===0)throw Error('龍肉質0の最低ダメージ処理は照合中です');
  const mv=number(v.motionValue,0,10000),base=number(v.dragonDisplayedValue,0,100000),mult=number(v.dragonAttackMultipliers?.[level],1,2),flat=number(v.dragonAttackAdds?.[level],0,10000);
  const crit=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*0.25;
  const dragonDisplayedValue=base*mult+flat,perPhysical=attack*mv/100*sharp*hz/100*crit,perElement=dragonDisplayedValue/10*esharp*dhz/100;
  return {status:'SOURCE_REFERENCE',techniqueId:record.techniqueId,count,physical:perPhysical*count,element:perElement*count,total:(perPhysical+perElement)*count,perEvent:perPhysical+perElement,dragonDisplayedValue,damageIncluded:false,scope:record.sourceFormula.scope,rounding:'UNROUNDED_REFERENCE',evidence:record.sourceFormula,liveGameVerification:record.liveGameVerification};
 }
 const api=Object.freeze({observed});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DarkArtsReference=api;
})(typeof window!=='undefined'?window:globalThis);
