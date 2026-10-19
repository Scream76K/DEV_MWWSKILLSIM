const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function runBuildCompare('),end=html.indexOf('function aiBuildData(',start);
const source=html.slice(start,end);
function run(map,names){
 const out={textContent:'',innerHTML:''};let snapshotCalls=0,compareCalls=0;
 const context=vm.createContext({invalidateAIComparisonData(){},selectedPart(){return null},compareSelectedNames(){return names},savedBuildMap(){return map},$(){return out},buildSnapshot(){snapshotCalls++;return {}},compareStep5Snapshot(){return {}},compareSnapshot(){compareCalls++;return {}},applyBuildSnapshot(){},restoreStep5Snapshot(){},renderCompareTable(){return ''},JSON,Date});
 vm.runInContext(source,context);vm.runInContext('runBuildCompare()',context);
 return {out,snapshotCalls,compareCalls};
}
test('missing selected build aborts before mutating build state',()=>{const r=run({A:{weaponKind:'great-sword'}},['A','B']);assert.match(r.out.textContent,/保存ビルドが見つかりません/);assert.equal(r.snapshotCalls,0);assert.equal(r.compareCalls,0)});
test('null saved build aborts comparison',()=>{const r=run({A:null},['A']);assert.match(r.out.textContent,/保存ビルドが見つかりません/);assert.equal(r.compareCalls,0)});
test('prototype property is not a saved build',()=>{const r=run({},['toString']);assert.match(r.out.textContent,/保存ビルドが見つかりません/);assert.equal(r.compareCalls,0)});
test('valid saved build proceeds to snapshot and comparison',()=>{const r=run({A:{weaponKind:'great-sword'}},['A']);assert.equal(r.snapshotCalls,1);assert.equal(r.compareCalls,1)});
