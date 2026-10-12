const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function runBuildCompare('),end=html.indexOf('function aiBuildData(',start);
const source=html.slice(start,end);
function scenario({compareFails=false,restoreFails=false}={}){
 const calls=[];const output={textContent:'',innerHTML:''};
 const context=vm.createContext({
  invalidateAIComparisonData(){},compareSelectedNames(){return ['A']},savedBuildMap(){return {A:{weaponKind:'great-sword'}}},
  $(){return output},buildSnapshot(){if(!calls.includes('snapshot'))calls.push('snapshot');return {weaponId:'original'}},compareStep5Snapshot(){if(!calls.includes('conditions'))calls.push('conditions');return {original:true}},
  compareSnapshot(){calls.push('compare');if(compareFails)throw Error('compare failed');return {name:'A'}},
  applyBuildSnapshot(x){calls.push('restore');assert.equal(x.weaponId,'original');if(restoreFails)throw Error('restore failed')},
  restoreStep5Snapshot(x){calls.push('restore conditions');assert.equal(x.original,true)},buildSnapshotMatches(a,b){return a.weaponId===b.weaponId},renderCompareTable(){calls.push('render');return 'table'},JSON,Date
 });vm.runInContext(source,context);
 let error=null;try{vm.runInContext('runBuildCompare()',context)}catch(e){error=e}
 return {calls,output,error};
}
test('successful comparison restores original build and conditions before rendering',()=>{const r=scenario();assert.deepEqual(r.calls,['snapshot','conditions','compare','restore','restore conditions','render']);assert.equal(r.error,null)});
test('failed comparison restores original build and conditions without showing a table',()=>{const r=scenario({compareFails:true});assert.deepEqual(r.calls,['snapshot','conditions','compare','restore','restore conditions']);assert.match(r.output.textContent,/compare failed/);assert.equal(r.error,null)});
test('condition restoration runs even if original build restoration fails',()=>{const r=scenario({restoreFails:true});assert.deepEqual(r.calls,['snapshot','conditions','compare','restore','restore conditions']);assert.equal(r.error,null);assert.match(r.output.textContent,/restore failed/)});
