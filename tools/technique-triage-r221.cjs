'use strict';
const {engine,kinds}=require('../tests/r220-technique-audit.cjs');
const VERSION='1.042.00.02';
const VERSION_REASONS=new Set(['OFFICIAL_BASELINE_VERSION_AUDIT_PENDING','SOURCE_TABLE_HISTORY_CONFLICT']);
const HANDLER_REASONS=new Set(['SPECIAL_HANDLER_REQUIRED']);
const DATA_REASONS=new Set(['NUMERIC_SOURCE_MISSING','HIT_COUNT_AND_MODIFIER_MAPPING_MISSING','BLUNT_ELEMENT_AND_SHARPNESS_RULE_PENDING']);
function triage(){const records=[];for(const kind of kinds)for(const t of Object.values(engine.db[kind])){
 let calculable=false;try{calculable=engine.hits(kind,t.techniqueId).length>0}catch{}
 if(calculable)continue;
 const reasons=[...new Set(t.unresolvedReasons||[])];
 const route=reasons.some(r=>VERSION_REASONS.has(r))?'SOURCE_VERSION_REVIEW':reasons.some(r=>HANDLER_REASONS.has(r))?'HANDLER_REVIEW':reasons.some(r=>DATA_REASONS.has(r))?'SOURCE_NUMERIC_REVIEW':'SOURCE_REVIEW';
 records.push({weaponKind:kind,techniqueId:t.techniqueId,techniqueName:t.techniqueName,route,numericStatus:t.numericStatus||null,reasons,sourceVersion:t.sourceVersion||null,referenceGameVersion:VERSION,decision:'PENDING_SOURCE_REVIEW',measurementRequested:false});
 }
 const routes={};for(const r of records)routes[r.route]=(routes[r.route]||0)+1;
 return {referenceGameVersion:VERSION,policy:['SOURCE_REVIEW','USER_DECISION','MEASUREMENT_ONLY_IF_STILL_UNKNOWN'],note:'Routing is an initial priority, not evidence that a source was verified or a measurement is needed. No records are automatically promoted.',total:records.length,routes,records};}
if(require.main===module)console.log(JSON.stringify(triage(),null,2));
module.exports={triage};
