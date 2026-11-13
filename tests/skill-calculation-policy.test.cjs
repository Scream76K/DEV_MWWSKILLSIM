const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../skill-calculation-policy.js');
test('keeps owner exclusions separate from standard-only and unsupported dispositions',()=>{
 assert.deepEqual(policy.owner.skills.map(x=>x.skillId),[67,75,82,171,174,133,152,129,85,8,103,138,160]);
 for(const s of policy.owner.skills)for(const name of s.names)for(let level=1;level<=(s.maxLevel??3);level++)assert.equal(policy.isOwnerExcluded({skillId:s.skillId,name,level}),true);
 assert.equal(policy.isStandardExcluded({skillId:163,name:'刃鱗研装',level:1},{standardEvaluation:true}),true);
 assert.equal(policy.isStandardExcluded({skillId:163,name:'刃鱗研装',level:1},{standardEvaluation:false}),false);
 for(const s of policy.owner.skills){assert.equal(policy.isOwnerExcluded({skillId:s.skillId,name:'forged',level:1}),false);for(const level of [0,-1,(s.maxLevel??3)+1,1.5,'1',null])assert.equal(policy.isOwnerExcluded({skillId:s.skillId,name:s.names[0],level}),false);}
 for(const level of [4,5])assert.equal(policy.isOwnerExcluded({skillId:75,name:'攻勢',level}),true);
 for(const id of [25,89,107,170,180])assert.equal(policy.isOwnerExcluded({skillId:id,name:'forged',level:1}),false,'set/group require activation validation');
 assert.equal(policy.isOwnerExcluded({skillId:99999,name:'攻勢',level:1}),false);
 assert.equal(policy.isOwnerExcluded({skillId:24,name:'チャージマスター',level:3}),false);
 for(const weaponKind of ['bow','light-bowgun','heavy-bowgun','great-sword'])assert.equal(policy.isOwnerExcluded({skillId:160,name:'刃鱗増装',level:1,weaponKind}),!['bow','light-bowgun'].includes(weaponKind));
 assert.equal(new Set(policy.owner.skills.map(x=>x.skillId)).size,13);
});
