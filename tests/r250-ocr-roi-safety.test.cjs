const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
const keys=['weaponMain','head','chest','arm','waist','leg','charm'];
const valid=()=>({gameArea:{x:0,y:0,w:1600,h:900},rois:Object.fromEntries(keys.map((key,i)=>[key,{key,x:64,y:100+i*90,w:165,h:24}]))});
function context(extra={}){
 const elements=new Map(),ctx={window:{equipmentROIResult:valid()},console,performance:{now:()=>0},TARGET_EQUIPMENTS:keys.map(key=>({key})),
 $:id=>{if(!elements.has(id))elements.set(id,id==='img'?{src:'image-a',naturalWidth:1600,naturalHeight:900}:{textContent:'',disabled:false});return elements.get(id)},...extra};
 vm.createContext(ctx);vm.runInContext(['equipmentNameCropRectV312','clampRectToImage','equipmentROIValidation','calculateEquipmentROI','recognizeEquipmentAll'].map(n=>source.functionSource(html,n)).join('\n'),ctx);return ctx;
}
test('physical name ROI w/h stays the identical source pixel band without refinement',()=>{
 const c=context(),r=c.equipmentNameCropRectV312({x:64,y:111,w:165,h:24,refined:false},1600,900);
 assert.deepEqual([r.x,r.y,r.width,r.height],[64,111,165,24]);
});
test('invalid ROI is rejected with old ROI cleared before drawing or recognition',()=>{
 const c=context({calculateEquipmentROIsRefined:()=>({...valid(),rois:{head:{x:-1,y:0,w:2,h:2}}}),drawEquipmentROIs:()=>{throw Error('invalid ROI was drawn')},renderEquipmentROIResult:()=>{}});
 assert.equal(c.calculateEquipmentROI(),null);assert.equal(c.window.equipmentROIResult,null);assert.match(c.$('equipmentROIStatus').textContent,/エラー|検証NG/);
});
test('ROI calculation exception clears old image result and returns failure',()=>{
 const c=context({calculateEquipmentROIsRefined:()=>{throw Error('decode failure')}});assert.equal(c.calculateEquipmentROI(),null);assert.equal(c.window.equipmentROIResult,null);
});
test('direct recognition cannot call Tesseract with incomplete or nonpositive ROI',async()=>{
 let calls=0;const c=context({Tesseract:{createWorker:()=>{calls++;throw Error('recognition must not begin')}}});
 c.window.equipmentROIResult={...valid(),rois:{head:{x:64,y:111,w:0,h:24}}};
 assert.equal(await c.recognizeEquipmentAll(),false);assert.equal(calls,0);assert.equal(c.window.equipmentROIResult,null);
});
test('image changed while worker starts cannot publish old recognition',async()=>{
 let terminated=0;const c=context({weaponDBReady:true,armorReady:true,charmReady:true,weaponDB:[],armorDB:[],charmDB:[],setEquipmentDBStatus:()=>{},Tesseract:{createWorker:async()=>{c.$('img').src='image-b';return {terminate:async()=>terminated++,setParameters:()=>{throw Error('old image must stop before recognition')}}}}});
 assert.equal(await c.recognizeEquipmentAll(),false);assert.equal(c.window.lastEquipmentOCR.length,0);assert.equal(terminated,1);
});
function workflow(extra){
 const c=context({setTimeout:f=>f(),setAnalysisProgress:()=>{},renderProductionEquipment:()=>{},refreshFinalBuildPreview:()=>{},...extra});
 Object.assign(c,extra);c.$('file').files=[{}];
 const a=html.indexOf("if($('workflowEquipmentOCR'))$('workflowEquipmentOCR').onclick=async()=>{");
 const b=html.indexOf("\nif($('workflowDecorationOCR'))",a);
 assert.ok(a>0&&b>a);vm.runInContext(html.slice(a,b),c);return c;
}
test('public workflow stops after failed ROI and leaves retry button enabled',async()=>{
 let calls=0;const c=workflow({calculateEquipmentROI:()=>null,recognizeEquipmentAll:async()=>{calls++;return true}});
 assert.equal(await c.$('workflowEquipmentOCR').onclick(),false);assert.equal(calls,0);assert.equal(c.$('workflowEquipmentOCR').disabled,false);assert.doesNotMatch(c.$('workflowEquipmentStatus').textContent,/解析が完了/);
});
test('public workflow does not announce completion after recognition error',async()=>{
 const c=workflow({calculateEquipmentROI:()=>valid(),recognizeEquipmentAll:async()=>false});
 assert.equal(await c.$('workflowEquipmentOCR').onclick(),false);assert.equal(c.$('workflowEquipmentOCR').disabled,false);assert.doesNotMatch(c.$('workflowEquipmentStatus').textContent,/解析が完了/);
});

test('ROI retry failure invalidates previous confirmed rows and reflection context',()=>{
 const c=context({calculateEquipmentROIsRefined:()=>{throw Error('decode failure')}});c.window.lastEquipmentOCR=[{resolutionStatus:'manual_confirmed'}];c.window.equipmentContext={head:{id:700}};
 assert.equal(c.calculateEquipmentROI(),null);assert.equal(c.window.lastEquipmentOCR.length,0);assert.equal(c.window.equipmentContext,null);
});
