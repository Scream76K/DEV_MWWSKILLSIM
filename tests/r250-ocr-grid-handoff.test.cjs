const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
const ctx={imgW:1340};vm.createContext(ctx);
vm.runInContext(['v400RegionsFromGrid','equipmentNameCropRectV312','clampRectToImage'].map(n=>source.functionSource(html,n)).join('\n'),ctx);
test('OCR grid overlay band survives adapter and is the exact recognition crop',()=>{
 const row={row:0,key:'mainWeapon',label:'メイン武器',icon:{x:26,y:111,w:45,h:45},ocr:{x:71,y:134,w:315,h:45},anchor:{x:71,y:156}};
 const region=ctx.v400RegionsFromGrid({armorPitch:65,topPitch:66,rows:[row]})[0];
 const crop=ctx.equipmentNameCropRectV312(region,1340,760);
 assert.deepEqual([crop.x,crop.y,crop.width,crop.height],[71,134,315,45]);
});
test('refined band still wins over an icon grid band',()=>{
 const crop=ctx.equipmentNameCropRectV312({sourceType:'icon-anchor',icon:{x:26,y:111,w:45,h:45},ocr:{x:71,y:134,w:315,h:45},refined:true,nameAnchor:{x:75,y:138,width:280,height:20}},1340,760);
 assert.deepEqual([crop.x,crop.y,crop.width,crop.height],[75,138,280,20]);
 assert.equal(crop.source,'v4.5.1-refined-name-band');
});

test('failed decoration grid recovers one corroborated interior boundary without changing strong grids',()=>{
 const rules=source.functionSource(html,'recoverDecorationBoundaries');
 const boundaries=Array.from({length:25},(_,i)=>80+25*i);
 const narrow={best:{meanPitch:25,pitchSD:1.75,boundaries}};
 let called=0;
 const rescue=vm.runInNewContext('('+rules+')',{
  detectDecorationBoundariesFromImage:(_canvas,_area,left,right)=>{
   assert.deepEqual([left,right],[.100,.193]);called++;return narrow;
  }
 });
 const wide={expectedPitch:25,candidates:boundaries.filter((_,i)=>i!==14).map(y=>({y}))};
 assert.equal(rescue({}, {}, {...wide,best:{}}),null);
 assert.equal(called,0);
 assert.equal(rescue({}, {}, wide),narrow);
 assert.equal(rescue({}, {}, {...wide,candidates:wide.candidates.slice(1)}),null);
 assert.equal(rescue({}, {}, {...wide,candidates:wide.candidates.map((p,i)=>i===6?{y:p.y+5}:p)}),null);
 narrow.best.pitchSD=4;
 assert.equal(rescue({}, {}, wide),null);
});

test('decoration-grid rescue abstains unless all eight physical groups verify',()=>{
 const pipeline=source.functionSource(html,'calculateDecorationSlots');
 assert.match(pipeline,/recovered && \(grouped\.groups\.length!==DECORATION_GROUP_ORDER\.length \|\|\s*grouped\.groups\.some\(g=>!g\.physicalMappingVerified\)\)/);
});
