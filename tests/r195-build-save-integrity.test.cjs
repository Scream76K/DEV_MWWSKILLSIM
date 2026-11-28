const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function normalizeSelectedHp(');
const end=html.indexOf('function savedBuildMap()',begin);
assert.ok(begin>0&&end>begin);
// Run the pure HP normalizer, not the following browser-only listeners.
const hpEnd=html.indexOf('\n',begin);
const snapshotBegin=html.indexOf('function buildSnapshotComparable(',hpEnd);
assert.ok(hpEnd>begin&&snapshotBegin>hpEnd&&end>snapshotBegin);
const ctx=vm.createContext({JSON});
vm.runInContext(html.slice(begin,hpEnd)+'\n'+html.slice(snapshotBegin,end),ctx);
const same=(a,b)=>vm.runInContext('buildSnapshotMatches(a,b)',vm.createContext({...ctx,a,b}));
const base={version:'r194',savedAt:'old',weaponId:'weapon1',weaponKind:'bow',armor:{head:'a'},charmCustom:{skills:[1]},artia:{bonus:'x'},decos:{head:['gem']},combo:{moves:[{techniqueId:'shot'}]}};
test('save roundtrip retains combat-relevant fields',()=>assert.equal(same(base,JSON.parse(JSON.stringify(base))),true));
test('save metadata changes do not alter comparison',()=>assert.equal(same(base,{...base,version:'r195',savedAt:'new'}),true));
for(const [field,value] of [['weaponId','other'],['weaponKind','great-sword'],['armor',{head:'b'}],['charmCustom',{skills:[2]}],['artia',{bonus:'y'}],['decos',{head:['other']}],['combo',{moves:[{techniqueId:'other'}]}]]){
 test('save roundtrip detects '+field+' change',()=>assert.equal(same(base,{...base,[field]:value}),false));
}
test('missing saved snapshot fails integrity check',()=>assert.equal(same(null,base),false));
test('save handler verifies full snapshot instead of mere presence',()=>assert.match(html,/buildSnapshotMatches\(JSON\.parse\(verify\)\[name\],m\[name\]\)/));

// Exercise the real HP normalizer added to the production snapshot contract.
test('legacy HP omission and explicit FULL_HP compare equal',()=>assert.equal(same(base,{...base,selectedHp:'FULL_HP'}),true));
for(const [field,value] of [['selectedHp','AT_OR_BELOW_30_PERCENT'],['combatBuffs',{meal:'fixture-meal',charm:null,otherBuffs:null}],['target',{monsterId:'other-monster',partId:'other-part'}]]){
 test('save integrity includes '+field,()=>assert.equal(same(base,{...base,[field]:value}),false));
}
