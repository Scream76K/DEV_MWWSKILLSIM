// r161: verified JSON capture buttons. No automatic equipment verification is implied.
(function(root){'use strict';
function init(doc){const get=id=>doc.getElementById(id);if(!get('glCaptureA'))return null;
 const store=root.MHWGunlanceResultCapture.createCapture();const output=get('glCaptureOutput');
 const status=()=>{const s=store.status();output.textContent='保存状態 A：'+(s.A?s.A.evidenceId:'未登録')+' / B：'+(s.B?s.B.evidenceId:'未登録');};
 for(const side of ['A','B']){
  get('glCapture'+side).addEventListener('click',()=>{try{const data=JSON.parse(get('glGeneric'+side).value);const saved=store.put(side,data);status();output.textContent+='\n'+side+' 保存成功：DPS '+saved.dps.toFixed(1);}catch(e){output.textContent=side+' 保存拒否：'+e.message;}});
  get('glRestore'+side).addEventListener('click',()=>{try{const data=JSON.parse(get('glGeneric'+side).value);store.put(side,data);status();}catch(e){output.textContent=side+' 再検証失敗：'+e.message;}});
  get('glClear'+side).addEventListener('click',()=>{store.clear(side);status();});
 }
 get('glCaptureCompare').addEventListener('click',()=>{try{const r=store.compare();const fmt=n=>n===null?'未確定':n.toFixed(1);output.textContent='保存済み比較：A DPS '+fmt(r.a.dps)+' / B DPS '+fmt(r.b.dps)+'\n差 '+fmt(r.deltaDps)+' / B÷A '+fmt(r.relativeDpsPercent)+'%';}catch(e){output.textContent='比較保留：'+e.message;}});
 root.MHWGunlanceCaptureStore=store;status();return store;
}
if(typeof module!=='undefined'&&module.exports)module.exports={init};else if(root.document)init(root.document);
})(typeof window!=='undefined'?window:globalThis);
