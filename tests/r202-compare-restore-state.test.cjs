const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('function runBuildCompare('),html.indexOf('function aiBuildData(',html.indexOf('function runBuildCompare(')));
function scenario({buildChanged=false,conditionsChanged=false,checkThrows=false}={}){
 const calls=[],out={textContent:'',innerHTML:''};let buildReads=0,conditionReads=0;
 const ctx=vm.createContext({invalidateAIComparisonData(){},selectedPart(){return null},compareSelectedNames(){return ['A']},savedBuildMap(){return {A:{weaponKind:'great-sword'}}},$(){return out},buildSnapshot(){buildReads++;if(checkThrows&&buildReads>1)throw Error('read failed');return {weaponId:buildChanged&&buildReads>1?'other':'original'}},compareStep5Snapshot(){conditionReads++;return {original:!(conditionsChanged&&conditionReads>1)}},compareSnapshot(){calls.push('compare');return {name:'A'}},applyBuildSnapshot(){calls.push('restore')},restoreStep5Snapshot(){calls.push('conditions')},buildSnapshotMatches(a,b){return a.weaponId===b.weaponId},renderCompareTable(){calls.push('render');return 'table'},JSON,Date});
 vm.runInContext(source,ctx);assert.doesNotThrow(()=>vm.runInContext('runBuildCompare()',ctx));return {calls,out};
}
test('matching restored build and conditions allow comparison',()=>{const r=scenario();assert.deepEqual(r.calls,['compare','restore','conditions','render'])});
test('silent build restore mismatch blocks comparison',()=>{const r=scenario({buildChanged:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/元に戻っていません/)});
test('silent condition restore mismatch blocks comparison',()=>{const r=scenario({conditionsChanged:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/元に戻っていません/)});
test('post-restore state read error blocks comparison',()=>{const r=scenario({checkThrows:true});assert.deepEqual(r.calls,['compare','restore','conditions']);assert.match(r.out.textContent,/read failed/)});
