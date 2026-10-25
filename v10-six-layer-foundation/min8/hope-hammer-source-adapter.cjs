'use strict';
const sharpnessApi=require('../../weapon-max-sharpness.js');

const SOURCE=Object.freeze({
 namespace:'api.wilds.mhdb.io',
 endpoint:'https://wilds.mhdb.io/en/weapons',
 sourceGameVersion:null
});

function resolveHopeHammerI(record,{apiVersion='UNKNOWN',retrievedAt='UNKNOWN'}={}){
 if(!record||record.id!==387||record.gameId!==1||record.kind!=='hammer'||record.name!=='Hope Hammer I')throw Error('HOPE_HAMMER:API_RECORD_IDENTITY_MISMATCH');
 if(!record.damage||!Number.isFinite(record.damage.raw)||!Number.isFinite(record.damage.display))throw Error('HOPE_HAMMER:ATTACK_FIELDS_UNRESOLVED');
 if(!Number.isFinite(record.affinity)||!Array.isArray(record.specials)||!Array.isArray(record.skills))throw Error('HOPE_HAMMER:COMBAT_FIELDS_UNRESOLVED');
 const sharpness=record.sharpness;
 if(!sharpness||!sharpnessApi.colors.some(color=>Number(sharpness[color])>0))throw Error('HOPE_HAMMER:SHARPNESS_UNRESOLVED');
 const colors=sharpnessApi.colors;
 const maxSharpness=[...colors].reverse().find(color=>Number(sharpness[color])>0);
 if(!maxSharpness)throw Error('HOPE_HAMMER:SHARPNESS_UNRESOLVED');
 const sourceUrl=`${SOURCE.endpoint}?q=%7B%22name%22%3A%22Hope%20Hammer%20I%22%7D&limit=1`;
 return Object.freeze({
  weapon:Object.freeze({
   apiId:record.id,sourceNamespace:SOURCE.namespace,sourceEndpoint:SOURCE.endpoint,
   weaponKind:record.kind,gameId:record.gameId,sourceGameVersion:SOURCE.sourceGameVersion,
   attackRaw:record.damage.raw,attackDisplay:record.damage.display,affinity:record.affinity,
   specials:Object.freeze([...record.specials]),skills:Object.freeze([...record.skills]),
   sharpness:Object.freeze({...sharpness}),handicraft:Object.freeze([...(record.handicraft||[])]),
   maxSharpness,maxSharpnessEvidenceRef:sourceUrl
  }),
  provenance:Object.freeze({sourceUrl,apiVersion,retrievedAt,sourceGameVersion:'UNKNOWN',adoptionStatus:'OWNER_APPROVED_PROVISIONAL',targetGameVersion:'1.042.00.02'})
 });
}

module.exports={resolveHopeHammerI};
