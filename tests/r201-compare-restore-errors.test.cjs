const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function runBuildCompare('),html.indexOf('function aiBuildData(',html.indexOf('function runBuildCompare(')));
function scenario({compareFails=false,restoreFails=false,conditionsFail=false}={}){
 const calls=[],out={textContent:'',innerHTML:''};
 const ctx=vm.createContext({invalidateAIComparisonData(){},selectedPart(){return null},compareSelectedNames(){return ['A']},savedBuildMap(){return {A:{weaponKind:'great-sword'}}},$(){return out},buildSnapshot(){return {weaponId:'original'}},compareStep5Snapshot(){return {original:true}},compareSnapshot(){calls.push('compare');if(compareFails)throw Error('compare failed');return {name:'A'}},applyBuildSnapshot(){calls.push('restore');if(restoreFails)throw Error('restore failed')},restoreStep5Snapshot(){calls.push('conditions');if(conditionsFail)throw Error('conditions failed')},buildSnapshotMatches(a,b){return a.weaponId===b.weaponId},renderCompareTable(){calls.push('render');return 'table'},JSON,Date});
 vm.runInContext(source,ctx);assert.doesNotThrow(()=>vm.runInContext('runBuildCompare()',ctx));return {calls,out};
}
test('normal comparison renders only after both restores',()=>{const r=scenario();assert.deepEqual(r.calls,['compare','restore','conditions','render'])});
test('comparison error prevents rendering and restores both states',()=>{const r=scenario({compareFails:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/compare failed/)});
test('original build restoration failure is displayed without uncaught exception',()=>{const r=scenario({restoreFails:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/restore failed/)});
test('condition restoration failure is displayed without uncaught exception',()=>{const r=scenario({conditionsFail:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/conditions failed/)});
test('both restore failures still attempt both restorations',()=>{const r=scenario({restoreFails:true,conditionsFail:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/restore failed/)});
