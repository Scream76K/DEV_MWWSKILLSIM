// Missing equipment element is not a confirmed zero. This module contains no game numerics.
(function(root){'use strict';
const ELEMENT_TYPES=new Set(['fire','water','thunder','ice','dragon']);
const STATUS_TYPES=new Set(['poison','paralysis','sleep','blast']);
function numeric(value){
  if(value===null||value===undefined||typeof value==='boolean'||(typeof value!=='number'&&typeof value!=='string')||typeof value==='string'&&!value.trim())return null;
  const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;
}
function type(value){const t=typeof value==='string'?value.trim().toLowerCase():'';return ELEMENT_TYPES.has(t)||STATUS_TYPES.has(t)||t==='none'?t:'';}
function unknown(elementType='',reason='ELEMENT_VALUE_MISSING'){
  const t=type(elementType);return {element:null,elementType:t,elementKnown:false,typeKnown:!!t,elementStatus:'UNKNOWN',elementReason:reason};
}
function fromValue(value,elementType){
  const t=type(elementType),n=numeric(value);
  if(!t)return unknown('', 'ELEMENT_TYPE_UNKNOWN');
  if(n===null)return unknown(t);
  if(t==='none'&&n!==0)return unknown(t,'ELEMENT_NONE_VALUE_CONFLICT');
  return {element:n,elementType:t,elementKnown:true,typeKnown:true,elementStatus:t==='none'?'CONFIRMED_NONE':'KNOWN',elementReason:null};
}
function fromRecord(record,options={}){
  const w=record&&typeof record==='object'?record:{},selected=type(options.type);
  if(options.type!=null&&options.type!==''&&!selected)return unknown('','ELEMENT_TYPE_UNKNOWN');
  if(['specials','elements'].some(k=>Object.prototype.hasOwnProperty.call(w,k)&&!Array.isArray(w[k])))return unknown(selected,'ELEMENT_RECORD_SHAPE_INVALID');
  const specials=Array.isArray(w.specials)?w.specials:null,elements=Array.isArray(w.elements)?w.elements:null;
  const candidates=[];
  for(const row of specials||[]){
    if(row?.kind==='element'&&!ELEMENT_TYPES.has(type(row.element))||row?.kind==='status'&&!STATUS_TYPES.has(type(row.status||row.element)))return unknown(selected,'ELEMENT_TAG_TYPE_CONFLICT');
    if(row?.kind==='element')candidates.push({elementType:type(row.element),element:row.damage?.display,rawOnly:row.damage?.display==null&&row.damage?.raw!=null});
    else if(row?.kind==='status')candidates.push({elementType:type(row.status||row.element),element:row.damage?.display,rawOnly:row.damage?.display==null&&row.damage?.raw!=null});
  }
  for(const row of elements||[])candidates.push({elementType:type(row?.element||row?.type||row?.elementType),element:row?.damage&&typeof row.damage==='object'?row.damage.display:row?.damage??row?.value,rawOnly:row?.damage&&typeof row.damage==='object'&&row.damage.display==null&&row.damage.raw!=null});
  if(options.confirmedNone===true&&typeof options.evidence==='string'&&options.evidence.trim()){
    if(candidates.some(x=>x.elementType!=='none'||numeric(x.element)!==0))return unknown(selected,'ELEMENT_NONE_EVIDENCE_CONFLICT');
    return fromValue(0,'none');
  }
  const filtered=selected?candidates.filter(x=>x.elementType===selected):candidates;
  if(filtered.length){
    const values=filtered.map(x=>fromValue(x.element,x.elementType));
    if(values.some(x=>!x.elementKnown))return unknown(selected||filtered[0].elementType,filtered.some(x=>x.rawOnly)?'ELEMENT_DISPLAY_VALUE_MISSING':'ELEMENT_VALUE_MISSING');
    if(values.some(x=>x.elementType!==values[0].elementType||x.element!==values[0].element))return unknown(selected,'ELEMENT_MULTIPLE_CANDIDATES');
    return values[0];
  }
  if(!options.artia&&!selected&&specials&&specials.length===0&&(!elements||elements.length===0))return fromValue(0,'none');
  return unknown(selected,selected&&candidates.length?'ELEMENT_SELECTED_TYPE_NOT_RECORDED':'ELEMENT_VALUE_MISSING');
}
function pendingReason(state={}){
  if(state.elementKnown===false||state.elementStatus==='UNKNOWN')return state.elementReason||'ELEMENT_VALUE_MISSING';
  if(state.typeKnown===false)return state.elementReason||'ELEMENT_TYPE_UNKNOWN';
  // Legacy callers with a real finite element can remain compatible; null is never zero.
  if(numeric(state.element)===null)return state.elementReason||'ELEMENT_VALUE_MISSING';
  return null;
}
function applySkill(state,skill={mult:1,add:0}){
  if(pendingReason(state))return {...state,element:null,elementKnown:false,elementStatus:'UNKNOWN',elementReason:pendingReason(state)};
  if(state.elementType==='none'||STATUS_TYPES.has(state.elementType))return {...state};
  const mult=numeric(skill.mult),add=numeric(skill.add);
  if(mult===null||add===null)return unknown(state.elementType,'ELEMENT_SKILL_COMPONENTS_INVALID');
  return fromValue(state.element*mult+add,state.elementType);
}
function hpElement(state){return pendingReason(state)?null:STATUS_TYPES.has(state.elementType)?0:state.element;}
const api=Object.freeze({fromValue,fromRecord,applySkill,pendingReason,hpElement,unknown});
if(typeof module==='object'&&module.exports)module.exports=api;
root.MHWElementState=api;
})(typeof globalThis!=='undefined'?globalThis:this);
