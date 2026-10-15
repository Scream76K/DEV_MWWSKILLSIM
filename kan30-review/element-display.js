/* KAN20 presentation only: never changes calculation keys, state or JSON. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MHWElementDisplay=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const LABELS=Object.freeze({fire:'火',water:'水',thunder:'雷',ice:'氷',dragon:'龍',poison:'毒',paralysis:'麻痺',sleep:'睡眠',blast:'爆破'});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
function label(key){return Object.prototype.hasOwnProperty.call(LABELS,key)?LABELS[key]:null;}
function render(state,options={}){
 const s=state&&typeof state==='object'?state:{};
 const none=s.elementStatus==='CONFIRMED_NONE'&&s.elementKnown===true&&s.element===0;
 const knownType=s.typeKnown===true&&label(s.elementType)!==null;
 const knownValue=s.elementKnown===true&&valid(s.element)&&s.elementStatus!=='UNKNOWN';
 const name=none?'無属性':knownType?label(s.elementType):'属性種別未確認';
 const value=knownValue?String(s.element):'未算出';
 const reasons=[];
 if(!none&&!knownType)reasons.push('属性種別を特定できていません');
 if(!knownValue)reasons.push(s.elementReason?String(s.elementReason):'属性値が未確認です');
 const accessible=[name,value,...reasons].join(' ');
 const icon=!none&&knownType?'<img class="element-icon" src="assets/element-icons/'+s.elementType+'.png" width="22" height="22" alt="" aria-hidden="true">':'';
 const visibleLabel=options.detail||(!none&&!knownType)?'<span class="element-label">'+escape(name)+'</span>':'';
 return '<span class="element-display" role="img" aria-label="'+escape(accessible)+'"'+(reasons.length?' title="'+escape(reasons.join(' / '))+'"':'')+'>'+icon+visibleLabel+'<span class="element-value">'+escape(value)+'</span></span>';
}
return Object.freeze({label,render,labels:LABELS});
});
