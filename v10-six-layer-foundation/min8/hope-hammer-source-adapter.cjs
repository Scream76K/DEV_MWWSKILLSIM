'use strict';
const sharpnessApi=require('../../weapon-max-sharpness.js');

const SOURCE=Object.freeze({
 namespace:'github.com/LartTyler/mhdb-wilds-data',
 commit:'e5676f8d69f9e1c10922bbe5506ba77f6304a941',
 locator:'output/merged/weapons/Hammer.json#L2-L72',
 weaponKind:'hammer',gameId:1,sourceGameVersion:null,
 attackRaw:90,affinity:0,specials:Object.freeze([]),skills:Object.freeze({}),
 sharpness:Object.freeze({red:50,orange:60,yellow:50,green:40,blue:0,white:0,purple:0}),
 handicraft:Object.freeze([50])
});
const sourceUrl=`https://${SOURCE.namespace}/blob/${SOURCE.commit}/${SOURCE.locator}`;

function resolveHopeHammerI(){
 const colors=sharpnessApi.colors;
 const maxSharpness=[...colors].reverse().find(color=>SOURCE.sharpness[color]>0);
 if(!maxSharpness)throw Error('HOPE_HAMMER:SHARPNESS_UNRESOLVED');
 return Object.freeze({
  weapon:Object.freeze({
   sourceNamespace:SOURCE.namespace,sourceCommit:SOURCE.commit,sourceLocator:SOURCE.locator,
   weaponKind:SOURCE.weaponKind,gameId:SOURCE.gameId,sourceGameVersion:SOURCE.sourceGameVersion,
   attackRaw:SOURCE.attackRaw,affinity:SOURCE.affinity,specials:SOURCE.specials,skills:SOURCE.skills,
   sharpness:SOURCE.sharpness,handicraft:SOURCE.handicraft,
   maxSharpness,maxSharpnessEvidenceRef:sourceUrl
  }),
  provenance:Object.freeze({sourceUrl,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:'1.042.00.02'})
 });
}

module.exports={resolveHopeHammerI};
