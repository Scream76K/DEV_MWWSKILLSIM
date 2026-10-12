const {test}=require('node:test'),assert=require('node:assert/strict');
const source=require('./legacy-ocr-source.cjs');const {chromium}=require('playwright');
const code=['clampNumber','clampRectToImage','equipmentNameCropRectV312','equipmentNameCropRect','dynamicOCRScale','addPaddingCustom','prepareEquipmentOCRCanvas'].map(n=>source.functionSource(source(),n)).join('\n');
// Constructed truth only. These coordinates do not calibrate production detection.
const fixtures=[{name:'fullscreen',width:960,height:540,x:0,y:0},{name:'top-bottom-bars',width:960,height:660,x:0,y:60},{name:'framed-photo',width:1100,height:700,x:70,y:80}];
for(const fixture of fixtures)test(`synthetic ${fixture.name}: physical crop preserves nine row identity independent of CSS size`,async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());const page=await browser.newPage();
 const result=await page.evaluate(async({code,f})=>{
  const canvas=document.createElement('canvas');canvas.width=f.width;canvas.height=f.height;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
  const rows=Array.from({length:9},(_,i)=>({x:f.x+100,y:f.y+i*60+10,w:240,h:24,refined:false}));
  rows.forEach((r,i)=>{ctx.fillStyle=`rgb(${20+i*20},${200-i*10},${40+i*10})`;ctx.fillRect(r.x,r.y,r.w,r.h)});
  const img=new Image();img.src=canvas.toDataURL();await img.decode();img.style.width='240px';document.body.append(img);
  const api=new Function('$','imgW','imgH',code+'\nreturn {crop:equipmentNameCropRect,prepare:prepareEquipmentOCRCanvas};')(()=>img,f.width,f.height);
  return rows.map((r,i)=>{const actual=api.crop(r,f.width,f.height),out=api.prepare(r,'raw_color');const pixel=Array.from(out.getContext('2d').getImageData(Math.floor(out.width/2),Math.floor(out.height/2),1,1).data);return {i,expected:r,actual,pixel,normalized:{x:(r.x-f.x)/960,y:(r.y-f.y)/540,w:r.w/960,h:r.h/540}}});
 },{code,f:fixture});
 for(const row of result){assert.deepEqual([row.actual.x,row.actual.y,row.actual.width,row.actual.height],[row.expected.x,row.expected.y,row.expected.w,row.expected.h]);assert.deepEqual(row.pixel,[20+row.i*20,200-row.i*10,40+row.i*10,255]);assert.equal(row.normalized.x,100/960);}
 assert.equal(result.length,9);
});
