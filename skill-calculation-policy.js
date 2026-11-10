(function(root){'use strict';
// Current-release owner scope, 2026-10-30. Keep DB coefficients for future weapon/sharpness reevaluation.
root.MHOwnerCalculationExclusion=Object.freeze({skills:Object.freeze([Object.freeze({skillId:129,names:Object.freeze(['破壊王','Partbreaker']),maxLevel:3}),Object.freeze({skillId:85,names:Object.freeze(['鈍器使い','Bludgeoner'])}),Object.freeze({skillId:8,names:Object.freeze(['抜刀術【力】','Punishing Draw'])}),Object.freeze({skillId:103,names:Object.freeze(['抜刀術【技】','抜刀術[技]','Critical Draw'])}),Object.freeze({skillId:138,names:Object.freeze(['研鑽','Everlasting']),maxLevel:1}),Object.freeze({skillId:160,names:Object.freeze(['刃鱗増装','Bladescale Loading']),maxLevel:1})]),reason:'ユーザー指定により今回の火力計算対象外（装備・保存は保持）',status:'OWNER_EXCLUDED_CURRENT_RELEASE'});
root.MHIsOwnerExcludedCalculationSkill=(entry)=>{const p=root.MHOwnerCalculationExclusion;return p.skills.some(x=>Number(entry?.skillId)===x.skillId&&x.names.includes(entry?.name)&&Number.isInteger(entry?.level)&&entry.level>=1&&entry.level<=(x.maxLevel??3));};
root.MHStandardCalculationExclusion=Object.freeze({skillId:163,names:Object.freeze(['刃鱗研装','Bladescale Honing']),level:1,reason:'ユーザー指定により標準比較のみ火力計算対象外（明示経路・装備・保存は保持）',status:'OWNER_EXCLUDED_STANDARD_COMPARISON'});
root.MHIsStandardExcludedCalculationSkill=(entry,conditions)=>{const p=root.MHStandardCalculationExclusion;return conditions?.standardEvaluation===true&&Number(entry?.skillId)===p.skillId&&p.names.includes(entry?.name)&&entry?.level===p.level;};

const api=Object.freeze({owner:root.MHOwnerCalculationExclusion,standard:root.MHStandardCalculationExclusion,isOwnerExcluded:root.MHIsOwnerExcludedCalculationSkill,isStandardExcluded:root.MHIsStandardExcludedCalculationSkill});
root.MHWCalculationExclusionPolicy=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
