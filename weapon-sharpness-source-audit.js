// r185: inspect nested MHDB sharpness payloads, preserving provenance and refusing inferred maxima.
(function(root){'use strict';
const MAX_ROWS=100000, MAX_DEPTH=5, MAX_NODES=1000;
function audit(weapons){
 if(!Array.isArray(weapons)||weapons.length>MAX_ROWS)throw new TypeError('MHDB weapon array required (max 100000)');
 const paths=new Map(), explicit=[], invalid=[], truncated=[];
 for(let i=0;i<weapons.length;i++){
  const w=weapons[i];if(!w||typeof w!=='object'||Array.isArray(w)){invalid.push(i);continue;}
  const seen=new WeakSet();let nodes=0;
  const walk=(obj,prefix,depth,underSharpness)=>{
   if(!obj||typeof obj!=='object'||seen.has(obj))return;
   if(depth>MAX_DEPTH||++nodes>MAX_NODES){truncated.push(i);return;}
   seen.add(obj);
   for(const [key,val] of Object.entries(obj)){
    const path=prefix?prefix+'.'+key:key;
    const relevant=underSharpness||/sharp|斬れ味/i.test(key);
    if(relevant){
     const type=Array.isArray(val)?'array':val===null?'null':typeof val;
     const rec=paths.get(path)||{path,count:0,types:new Set(),samples:new Set()};
     rec.count++;rec.types.add(type);
     if(val===null||typeof val==='string'||typeof val==='number'||typeof val==='boolean'){
      if(rec.samples.size<3)rec.samples.add(String(val).slice(0,80));
     }else if(Array.isArray(val)&&rec.samples.size<3)rec.samples.add('array(length='+val.length+')');
     paths.set(path,rec);
    }
    if(val&&typeof val==='object'&&depth<MAX_DEPTH){
     if(Array.isArray(val)){
      // One representative object is sufficient to discover array item structure.
      const sample=val.find(x=>x&&typeof x==='object');
      if(sample)walk(sample,path+'[]',depth+1,relevant);
     }else walk(val,path,depth+1,relevant);
    }
   }
  };
  walk(w,'',0,false);
  if(typeof w.maxSharpness==='string'&&typeof w.maxSharpnessEvidenceRef==='string'&&w.maxSharpnessEvidenceRef.trim())explicit.push(Object.freeze({index:i,id:w.id??null,maxSharpness:w.maxSharpness}));
 }
 return Object.freeze({status:'MHDB_SHARPNESS_SCHEMA_AUDIT_ONLY',total:weapons.length,explicitSourceRecords:Object.freeze(explicit),invalidIndices:Object.freeze(invalid),truncatedIndices:Object.freeze([...new Set(truncated)]),candidatePaths:Object.freeze([...paths.values()].map(p=>Object.freeze({path:p.path,count:p.count,types:Object.freeze([...p.types].sort()),samples:Object.freeze([...p.samples])})).sort((a,b)=>b.count-a.count||a.path.localeCompare(b.path))),inferredMaxSharpnessCount:0,verified:false});
}
function format(report){return ['MHDB武器データの斬れ味フィールド調査（読取専用）','武器件数：'+report.total,'根拠付きmaxSharpness登録：'+report.explicitSourceRecords.length,'斬れ味候補フィールド（入れ子構造を含む）：',...report.candidatePaths.map(p=>'・'+p.path+' '+p.count+'件 ['+p.types.join('/')+']'+(p.samples.length?' 例：'+p.samples.join(' / '):'')),'構造解析の上限到達：'+report.truncatedIndices.length+'件','※フィールド名・配列順・数値の大小から最大斬れ味を推測しません。強化段階・アーティア設定は別途確認が必要です。'].join('\n');}
const api=Object.freeze({audit,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWWeaponSharpnessSourceAudit=api;
})(typeof window!=='undefined'?window:globalThis);
