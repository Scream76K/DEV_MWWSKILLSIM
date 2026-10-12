'use strict';
// Evidence intake is separate from numeric Technique DB and never verifies automatically.
const {manifest}=require('./capture-manifest.cjs');
const known=new Set(manifest().entries.map(x=>x.id));
const required=['weaponId','gameVersion','videoFile','equipmentRecorded','targetRecorded','skillLevelsRecorded','hitNumbersReadable','conditionsRecorded'];
function inspectEvidence(record){
 const errors=[];
 if(!record || typeof record!=='object'||Array.isArray(record)) return {ready:false,errors:['record must be an object'],verificationStatus:'UNVERIFIED'};
 for(const key of required) if(!(key in record)) errors.push(`missing ${key}`);
 if(record.weaponId && !known.has(record.weaponId)) errors.push('unknown weaponId');
 if(record.gameVersion && record.gameVersion!==manifest().gameVersion) errors.push('game version mismatch');
 if(record.videoFile && (typeof record.videoFile!=='string'|| !/\.(mp4|mov|webm)$/i.test(record.videoFile))) errors.push('invalid video filename');
 for(const key of ['equipmentRecorded','targetRecorded','skillLevelsRecorded','hitNumbersReadable','conditionsRecorded']) if(key in record && record[key]!==true) errors.push(`incomplete ${key}`);
 return {ready:errors.length===0,errors,verificationStatus:'UNVERIFIED'};
}
function blankEvidence(weaponId){
 if(!known.has(weaponId)) throw new Error('unknown weaponId');
 return {weaponId,gameVersion:manifest().gameVersion,videoFile:'',equipmentRecorded:false,targetRecorded:false,skillLevelsRecorded:false,hitNumbersReadable:false,conditionsRecorded:false,notes:'',verificationStatus:'UNVERIFIED'};
}
module.exports={inspectEvidence,blankEvidence};
