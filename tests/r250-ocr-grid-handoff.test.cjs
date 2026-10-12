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
