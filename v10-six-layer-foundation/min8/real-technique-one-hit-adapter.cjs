'use strict';
// Narrow real-Technique-DB bridge candidate; intentionally NOT wired to production.
// Source of all normative values: caller's existing Technique DB record.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion,elementContext,allowUnresolvedElement=false}={}){
  if(!weaponType||!techniqueId||!dbVersion)throw Error('REAL_SLICE:IDENTITY_REQUIRED');
  if(!record||record.techniqueId!==techniqueId||(record.weaponType!==undefined&&record.weaponType!==weaponType))throw Error('REAL_SLICE:DB_IDENTITY_MISMATCH');
  if(!Number.isInteger(record.revision)||record.revision<1)throw Error('REAL_SLICE:REVISION_REQUIRED');
  if(record.hhModel){
   const m=record.hhModel;
   if(weaponType!=='hunting-horn'||m.id!=='HH_NORMAL_MELODY_PROVISIONAL'||m.status!=='OWNER_APPROVED_PROVISIONAL'||!m.techniques?.[techniqueId])throw Error('REAL_SLICE:HH_MODEL_INVALID');
   const n=m.input?.melodies?.length,b=m.input?.echoBubbles;
   if(!Number.isSafeInteger(n)||n<1||n>m.maxMelodies||!Number.isSafeInteger(b)||b<0||b>m.maxEchoBubbles||m.input.melodies.some(x=>x!=='SELF_IMPROVEMENT'&&!m.attackMelodies[x]))throw Error('REAL_SLICE:HH_MODEL_INPUT_INVALID');
   const adoption={status:m.status,verificationStatus:m.verificationStatus,source:m.source,approval:m.approval,scope:m.scope,updateOrder:m.updateOrder};
   const body={...record,hhModel:null,specialComponents:[],calculationStatus:'READY_BODY_COMPONENT',stateRequirement:{},adoption,hits:record.hits.map(h=>({...h,damageType:h.damageType??m.bodyDamageType,partModifier:h.partModifier??m.bodyPartModifier}))};
   const adapted=adaptOrdinaryPhysicalHit({weaponType,techniqueId,record:body,dbVersion,elementContext,allowUnresolvedElement});
   const events=[...adapted.events];let index=0;
   const add=(id,count)=>{if(count===0)return;const r=m.specialRecords[id];if(r?.sourceFormula?.status!=='SOURCE_CONFIRMED')throw Error('REAL_SLICE:HH_EVENT_SOURCE_PENDING');events.push({type:'hit',components:[{id:techniqueId+':reference:'+index,kind:'reference',unit:'REFERENCE',source:r.evidenceRefs[0],coefficient:1,parameters:{hitIndex:index++,referenceKind:'hunting-horn-model-event',hhRecord:r,hhCount:count,adoption,effectTargets:id==='HH_MELODY_COMPLETION_FIXED_10'?['fixed']:['physical','element'],effectStages:['attack','element']}}]});};
   if(m.action==='ordinary')add('HH_ECHO_BUBBLE_FOLLOWUP',b*m.echoPerTrigger);
   else{
    if(m.action==='encore')add('HH_MELODY_COMPLETION_FIXED_10',Math.max(n+m.fixedCountOffset,0));
    for(let i=0;i<n;i++){
     if(m.action==='performance')add('HH_PERFORMANCE_SHOCKWAVE',m.soundPerMelody);
     add('HH_ECHO_BUBBLE_MELODY_EVENT',b*m.echoPerTrigger);
     events.push({type:'transition',contract:'HH_MELODY_ESTABLISHED',operations:[{op:'add',path:['huntingHorn',m.input.melodies[i]==='SELF_IMPROVEMENT'?'selfImprovementLevel':'attackMelodyLevel'],amount:1,cap:m.input.melodies[i]==='SELF_IMPROVEMENT'?m.selfImprovementCap:m.attackMelodyCap}]});
    }
   }
   return Object.freeze({...adapted,events});
  }
  const shelling=Array.isArray(record.specialComponents)&&record.specialComponents.some(x=>String(x).includes('SHELL'));
  const reference=record.referenceKind==='bow'||record.referenceKind==='light-bowgun'||record.referenceKind==='heavy-bowgun'||record.referenceKind==='heavy-bowgun-element'||record.referenceKind==='light-bowgun-element'||record.referenceKind==='charge-blade-saed'||record.referenceKind==='hunting-horn-sound'||record.referenceKind==='heavy-bowgun-wyvern';
  if(shelling){
   const resource=record.shellingResource;
   if(resource&&(!(['NORMAL','CHARGED'].includes(record.shellingAction)&&resource.id==='GL_'+record.shellingAction+'_ROUNDS')||!Number.isInteger(resource.amount)||resource.amount<=0||!resource.source))throw Error('REAL_SLICE:GL_RESOURCE_CONTRACT_INVALID');
   if(record.weaponType!=='gunlance'||record.numericStatus!=='SOURCE_CONFIRMED'||!record.specialSourceValues)throw Error('REAL_SLICE:SHELLING_SOURCE_PENDING');
   const source=record.evidenceRefs[0];
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':shelling:0',kind:'shelling',unit:'SHELLING',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical'],effectStages:['attack'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),shellingSource:record.specialSourceValues,shellingAction:record.shellingAction,shellingInput:record.shellingInput,shellingResource:resource||null})}]},...(resource?[{type:'consume',contract:resource.id,source:resource.source,resourcePath:['gunlance','loadedRounds'],amount:resource.amount}]:[])]});
  }
  if(reference){
   const saed=record.phialReference;
  const kan21=record.referenceKind==='charge-blade-saed'&&['CB_SAED','CB_SAED_AED_DERIVED'].includes(techniqueId)
   &&record.calculationScope==='SAED_SOURCE_REFERENCE_ONLY'&&record.evidenceRefs?.includes('KAN21_SAED_SOURCE')
   &&saed?.status==='PROVISIONALLY_ADOPTED'&&saed.sourceConfirmed===true&&saed.liveGameVerification==='PENDING'
   &&saed.approvalRefs?.includes('KAN-21#10057')&&saed.approvalRefs?.includes('KAN-21#10058')
   &&saed.source==='https://kuroyonhon.com/mhwilds/memo/12.php'
   &&saed.sourceVersion===(techniqueId==='CB_SAED'?'AFTER_VER_1_011':'VER_1_02_ONWARD')
   &&saed.hitPolicy==='FULL_STOCK_FULL_HIT'&&saed.hitCount===5&&saed.eventCount===5&&saed.capacitySkillIncreasesStock===false
   &&JSON.stringify(record.hits?.map(h=>[h.mv,h.elementModifier]))==='[[16,1],[78,1],[45,1]]'
   &&['normal','enhanced'].every(k=>finite(saed.powerElement?.[k])&&saed.powerElement[k]>0)
   &&finite(saed.shieldElementMultiplier)&&finite(saed.shieldPhysicalBodyMultiplier);
  const wyvern=weaponType==='heavy-bowgun'&&techniqueId==='HBG_WYVERN_AMMO'&&record.referenceKind==='heavy-bowgun-wyvern'&&record.wyvernRules?.adoptionStatus==='PROVISIONAL'&&record.sourceScope==='OWNER_FIXED_TWO_HIT_PROVISIONAL_MODEL'&&record.evidenceRefs?.includes('KAN23_OWNER_TWO_HIT_FIX_22_CONDITIONS')&&record.hits?.length===2;
  if(record.numericStatus&&record.numericStatus!=='SOURCE_CONFIRMED'&&!kan21&&!wyvern)throw Error('REAL_SLICE:REFERENCE_SOURCE_PENDING');
   const source=record.evidenceRefs?.[0];if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
   if(weaponType==='light-bowgun'&&techniqueId==='LBG_NORMAL_RAPID_1'){
    const rule=record.rapidRule;if(rule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isInteger(rule.hitCount)||rule.hitCount<1||!Number.isInteger(rule.consumedRounds)||rule.consumedRounds<1)throw Error('LBG_RAPID:RULE_INVALID');
    const events=Array.from({length:rule.hitCount},(_,i)=>({type:'hit',components:[{id:techniqueId+':reference:'+i,kind:'reference',unit:'REFERENCE',source,coefficient:1,parameters:{hitIndex:i,effectTargets:['physical'],effectStages:['attack','affinity'],sourceTechniqueId:techniqueId,sourceRecord:record,referenceKind:record.referenceKind,referenceInput:record.referenceInput,rapidResource:rule.consumedRounds}}]}));
    events.push({type:'consume',contract:'LBG_RAPID_ROUND',resourcePath:['lightBowgun','loadedRounds'],amount:rule.consumedRounds,source});
    return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events});
   }
   return Object.freeze({id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',events:[{type:'hit',components:[{id:techniqueId+':reference:0',kind:'reference',unit:'REFERENCE',source,coefficient:1,parameters:Object.freeze({hitIndex:0,effectTargets:['physical','element'],effectStages:['attack','affinity','element'],sourceTechniqueId:techniqueId,sourceRecord:Object.freeze({...record}),referenceKind:record.referenceKind,referenceInput:record.referenceInput})}]}]});
  }
  if(!['VERIFIED','PARTIALLY_VERIFIED'].includes(record.verificationStatus))throw Error('REAL_SLICE:VERIFICATION_PENDING');
  if(!Array.isArray(record.evidenceRefs)||record.evidenceRefs.length===0)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  if(!Array.isArray(record.hits)||record.hits.length<1)throw Error('REAL_SLICE:HITS_REQUIRED');
  if((record.specialComponents?.length||0)>0)throw Error('REAL_SLICE:SPECIAL_ROUTE_PENDING');
  const provisionalHpOnly=record.techniqueId==='IG_ENHANCED_DIAGONAL_SLASH'&&record.hpOnlyProvisional==='IG_ENHANCED_DIAGONAL_SLASH_20261025'&&record.numericStatus==='SOURCE_CONFIRMED'&&record.verificationStatus==='PARTIALLY_VERIFIED'&&Array.isArray(record.hits)&&record.hits.length===2&&record.hits.every(hit=>finite(hit.mv)&&hit.mv>=0&&finite(hit.elementModifier)&&hit.elementModifier>=0)&&(!record.specialComponents||record.specialComponents.length===0);
  if(record.calculationStatus==='EVIDENCE_GATED'&&!provisionalHpOnly)throw Error('REAL_SLICE:EVIDENCE_GATED');
  const source=record.evidenceRefs[0];
  if(typeof source!=='string'||!source)throw Error('REAL_SLICE:EVIDENCE_REQUIRED');
  const elementResolved=elementContext?.displayElement===0&&elementContext?.effectsResolved===true&&Array.isArray(elementContext.activeElementEffects)&&elementContext.activeElementEffects.length===0;
  const events=[],excludedElements=[];
  const saMode=weaponType==='switch-axe'?(record.modeContract||(record.stateRequirement?.mode?{startMode:record.stateRequirement.mode,hitModes:record.hits.map(()=>record.stateRequirement.mode),endMode:record.stateRequirement.mode}:null)):null;
  if(saMode&&(!['SWORD','AXE'].includes(saMode.startMode)||!['SWORD','AXE'].includes(saMode.endMode)||saMode.hitModes?.length!==record.hits.length||saMode.hitModes.some(m=>!['SWORD','AXE'].includes(m))))throw Error('REAL_SLICE:SA_MODE_CONTRACT_INVALID');
  record.hits.forEach((hit,index)=>{
   if(saMode)events.push({type:'transition',contract:'SA_HIT_MODE',requiredMode:index?saMode.hitModes[index-1]:saMode.startMode,operations:[{op:'set',path:['switchAxe','mode'],value:saMode.hitModes[index]}]});
   if(!finite(hit.mv)||hit.mv<0||!finite(hit.elementModifier)||hit.elementModifier<0)throw Error('REAL_SLICE:HIT_FIELDS_PENDING:'+index);
   if(hit.elementModifier!==0&&!elementResolved&&!allowUnresolvedElement)throw Error('REAL_SLICE:ELEMENT_COMPONENT_PENDING:'+index);
   // Preserve the sourced part-durability modifier for provenance. The
   // canonical HP formula validates it but does not apply it to HP damage.
   const stateMetadata={excludedEffectIds:record.saAwakened?[record.saAwakened.elementEffectId]:[],saHitMode:saMode?.hitModes[index]??null,resourceContract:record.resourceContract||null,stateRequirement:record.stateRequirement&&Object.keys(record.stateRequirement).length?Object.freeze({...record.stateRequirement}):null,damageStateTransition:record.damageStateTransition?Object.freeze({...record.damageStateTransition}):null,damageStatsState:hit.damageStatsState??record.damageStateTransition?.damageStatsState??(provisionalHpOnly?'TRIPLE_EXTRACT':null),adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null};
   const partModifierKnown=finite(hit.partModifier);
   const hitSource=hit.componentSource??source;
   if(typeof hitSource!=='string'||!hitSource)throw Error('REAL_SLICE:HIT_SOURCE_REQUIRED:'+index);
   if(hit.shieldBoostAxeBody!==undefined&&typeof hit.shieldBoostAxeBody!=='boolean')throw Error('REAL_SLICE:HIT_SHIELD_SCOPE_INVALID:'+index);
   const components=[{id:techniqueId+':physical:'+index,kind:'physical',unit:'MV',source:hitSource,coefficient:hit.mv,parameters:Object.freeze({partModifier:partModifierKnown?hit.partModifier:null,partModifierStatus:partModifierKnown?'RESOLVED':'UNRESOLVED',partModifierSource:hit.partModifierSource??source,shieldBoostAxeBody:(hit.shieldBoostAxeBody??record.shieldBoostAxeBody)===true,elementModifier:hit.elementModifier,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})}];
   if(hit.elementModifier>0)components.push({id:techniqueId+':element:'+index,kind:'element',unit:'ELEMENT_MODIFIER',source:hitSource,coefficient:hit.elementModifier,parameters:Object.freeze({elementModifier:hit.elementModifier,elementSource:source,damageType:hit.damageType??null,hitIndex:index,...stateMetadata})});
   events.push({type:'hit',components});
   if(record.saAwakened&&saMode?.hitModes[index]==='SWORD'){
    const m=record.saAwakened,h=m.followupRecord?.hits?.[0],followIndex=record.hits.length+index;
    if(m.status!=='OWNER_APPROVED_PROVISIONAL'||!m.techniqueIds.includes(techniqueId)||!finite(h?.mv)||!finite(h?.elementModifier)||!finite(h?.partModifier))throw Error('REAL_SLICE:SA_AWAKENED_MODEL_INVALID');
    const parameters={...stateMetadata,hitIndex:followIndex,saFollowup:true,damageType:m.damageType,partModifier:h.partModifier,partModifierStatus:'RESOLVED',partModifierSource:m.source,elementModifier:h.elementModifier,excludedEffectIds:['rapid-morph-attack:'+techniqueId],adoption:m};
    events.push({type:'hit',components:[{id:techniqueId+':physical:'+followIndex,kind:'physical',unit:'MV',source:m.source,coefficient:h.mv,parameters},{id:techniqueId+':element:'+followIndex,kind:'element',unit:'ELEMENT_MODIFIER',source:m.source,coefficient:h.elementModifier,parameters}]});
   }
   if(elementResolved&&hit.elementModifier!==0)excludedElements.push({coefficient:hit.elementModifier,source,reason:'CONFIRMED_ZERO_ELEMENT_NO_EFFECTS',hitIndex:index});
  });
  if(saMode)events.push({type:'transition',contract:'SA_HIT_MODE',requiredMode:saMode.hitModes[saMode.hitModes.length-1],operations:[{op:'set',path:['switchAxe','mode'],value:saMode.endMode}]});
  if(record.phialReference?.status==='OBSERVED'&&Number.isInteger(record.phialReference.hitCount)&&record.phialReference.hitCount>0){
   const phialTarget=record.phialState?.phialType==='POWER_ELEMENT'?'element':'physical';
   events[0].components.push({id:techniqueId+':phial:0',kind:'phial',unit:'PHIAL',source:record.phialReference.sourceRefs?.[0]??source,coefficient:1,parameters:Object.freeze({hitIndex:0,phialCount:record.phialReference.hitCount,consumption:record.resourceContract?{kind:record.resourceContract.consumedPhialKind,amount:record.resourceContract.consumeNormalPhials,resourceKey:record.resourceContract.resourceKey}:null,phialReference:Object.freeze({...record.phialReference}),phialState:record.phialState?Object.freeze({...record.phialState}):null,excludedEffectIds:record.resourceContract?(record.resourceContract.rapidMorphExcludedEffectIds||[record.resourceContract.rapidMorphEffectId]):[],effectTargets:[phialTarget],effectStages:[phialTarget==='element'?'element':'attack'],sourceTechniqueId:techniqueId})});
  }
  if(record.resourceContract){
   const r=record.resourceContract;
   if(weaponType!=='charge-blade'||!['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'].includes(techniqueId)||r.id!=='CB_ED1_NORMAL_RESOURCE'||r.status!=='OWNER_APPROVED'||![0.5,1].includes(r.consumeNormalPhials)||!['normalPhials','enhancedPhials'].includes(r.resourceKey??'normalPhials'))throw Error('REAL_SLICE:CB_ED1_RESOURCE_CONTRACT_INVALID');
   events.push({type:'consume',contract:r.id,source:r.source,resourcePath:['chargeBlade',r.resourceKey??'normalPhials'],amount:r.consumeNormalPhials});
   events.push({type:'transition',contract:r.id,source:r.source,operations:[{op:'set',path:['chargeBlade','previousAction'],value:techniqueId}]});
  }
  return Object.freeze({
    id:techniqueId,revision:String(record.revision),dataVersion:dbVersion,definitionStatus:'defined',
    elementModifier:record.hits.map(hit=>hit.elementModifier),
    excludedElement:excludedElements.length?excludedElements:null,
    events,
    adoption:provisionalHpOnly?Object.freeze({status:'OWNER_APPROVED_PROVISIONAL',approvedAt:'2026-10-25',scope:'HP_DAMAGE_ONLY',sourceGameVersion:record.baselineGameVersion??null,officialVersionAudit:record.currentVersionAudit??'PENDING',unresolvedReasons:Array.isArray(record.unresolvedReasons)?[...record.unresolvedReasons]:[]}):record.adoption||null
  });
}
module.exports={adaptOrdinaryPhysicalHit};
