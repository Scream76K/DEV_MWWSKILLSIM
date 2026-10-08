'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function boot(){
 const nodes=Object.fromEntries(['weapon','baseline','variant','result','template','compare','save','load'].map(id=>[id,{value:id==='weapon'?'gunlance':'',textContent:'',innerHTML:'',onclick:null,onchange:null}]));
 const document={getElementById:id=>nodes[id]};
 const ctx={document,window:{},JSON,Number,Object,Array,String,Math,Error,RegExp,Blob:class {},URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},setTimeout:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'evidence-review.js'),'utf8'),ctx);
 return {nodes,api:ctx.window.__evidenceReview};
}
test('browser page is linked from simulator',()=>{assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/href="evidence-review.html"/)});
test('browser diagnostic computes typed component deltas',()=>{const {api}=boot();const a=api.template('gunlance',false),b=api.template('gunlance',true);a.equipmentId='build-A';b.equipmentId='build-B';a.techniqueId=b.techniqueId='GL_SLAM';a.moveSequence=b.moveSequence='GL_SLAM';a.hits=[10,20];b.hits=[10,25];a.observedComponents={physicalBody:10,elementalBody:0,shelling:20,wyrmstake:0};b.observedComponents={physicalBody:10,elementalBody:0,shelling:25,wyrmstake:0};const r=api.compare(a,b);assert.equal(r.comparable,true);assert.equal(r.components.shelling.delta,5);assert.equal(r.dpsReady,false)});
test('browser diagnostic rejects mismatched conditions and totals',()=>{const {api}=boot();const a=api.template('gunlance',false),b=api.template('gunlance',true);b.targetPart='tail';assert.equal(api.compare(a,b).comparable,false);b.targetPart=a.targetPart;b.hits=[10];assert.equal(api.compare(a,b).comparable,false)});
test('browser diagnostic rejects incompatible phial type',()=>{const {api}=boot();const a=api.template('charge-blade',false),b=api.template('charge-blade',true);b.phialType='ELEMENT';assert.equal(api.compare(a,b).comparable,false)});
