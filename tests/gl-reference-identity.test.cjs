'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const extract=(start,end)=>html.slice(html.indexOf('function '+start+'('),html.indexOf('function '+end+'('));
function setup(){
 const moves=Object.fromEntries(['NORMAL','CHARGED','FULL_BURST'].map(action=>['reference:gl_'+action,{id:'reference:gl_'+action,name:action,canonicalTechniqueId:'GL_SHELL_NORMAL_MEDIUM',handler:'GunlanceShellReferenceHandler',referenceAction:action}]));moves['canonical:GL_SLAM']={id:'canonical:GL_SLAM',name:'slam',canonicalTechniqueId:'GL_SLAM'};
 let received;const context={comboMove:id=>moves[id],comboKind:()=> 'gunlance',compareStep5Snapshot:()=>({}),$:()=>({value:'fixture'}),consumerDamageMetric:(row,ch)=>row.oneHitPipeline.channels[ch].metric,evaluateConsumerCombat(input){received=input;const components=input.moves.map((m,i)=>({status:'available',techniqueId:m.techniqueId,eventId:i+':event',value:10}));return {channels:Object.fromEntries(['normal','maximum'].map(c=>[c,{metric:{value:10*components.length,reason:null},components}]))};}};
 vm.createContext(context);vm.runInContext(extract('evaluateP0DamageRoute','calcP0Damage')+extract('referenceComboChange','createBuildComparisonReport'),context);return {context,get received(){return received;}};
}
for(const action of ['NORMAL','CHARGED','FULL_BURST'])test('P0 ingress preserves GL '+action+' execution identity and saved stage identity',()=>{
 const x=setup(),id='reference:gl_'+action,rows=[{techniqueId:id}],before=JSON.stringify(rows),r=x.context.evaluateP0DamageRoute(rows);
 assert.equal(x.received.moves[0].techniqueId,id);assert.equal(r.stages[0].id,id);assert.equal(r.stages[0].result.total,10);assert.equal(JSON.stringify(rows),before);
});
test('P0 ingress still resolves ordinary canonical IDs and rejects unresolved repetition',()=>{
 const x=setup(),r=x.context.evaluateP0DamageRoute([{techniqueId:'canonical:GL_SLAM'}]);assert.equal(x.received.moves[0].techniqueId,'GL_SLAM');assert.equal(r.stages[0].id,'GL_SLAM');
 const blocked=x.context.evaluateP0DamageRoute([{techniqueId:'reference:gl_NORMAL',count:2}]);assert.equal(blocked.damage,null);assert.match(blocked.blocked[0].reason,/ROW_REPEAT_NOT_ADOPTED/);
});
test('saved P0 comparison never treats normal and charged shelling as the same route',()=>{
 const x=setup(),row=action=>{const r=x.context.evaluateP0DamageRoute([{techniqueId:'reference:gl_'+action}]);return {kind:'gunlance',referenceCombo:{status:'PROVISIONAL_REFERENCE',damage:r.damage,stages:r.stages.map(s=>({techniqueId:s.id,canonicalTechniqueId:s.move?.canonicalTechniqueId??null}))}};};
 assert.equal(x.context.referenceComboChange(row('CHARGED'),row('NORMAL')),null);assert.equal(x.context.referenceComboChange(row('FULL_BURST'),row('NORMAL')),null);
});
test('saved P0 comparison permits the same preserved GL action without mutating rows',()=>{
 const x=setup(),r=x.context.evaluateP0DamageRoute([{techniqueId:'reference:gl_CHARGED'}]),row={kind:'gunlance',referenceCombo:{status:'PROVISIONAL_REFERENCE',damage:r.damage,stages:r.stages.map(s=>({techniqueId:s.id,canonicalTechniqueId:s.move?.canonicalTechniqueId??null}))}},before=JSON.stringify(row),change=x.context.referenceComboChange(row,row);assert.equal(change.index,100);assert.equal(JSON.stringify(row),before);
});
