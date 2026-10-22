'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const a=s.indexOf('function comparisonPowerIndex(');
const b=s.indexOf('function comparisonPowerChange(',a);
assert.ok(a>=0&&b>a,'production comparisonPowerIndex unavailable');
const make=(adapter)=>new Function('equipmentElementPendingReason','window',s.slice(a,b)+';return comparisonPowerIndex;')(()=>null,{MHBuildRelativeComparison:adapter});
const base={kind:'great-sword',elementType:'fire',power:{profileId:'STANDARD',normal:{comparisonPower:100},maximum:null}};
const row={kind:'great-sword',elementType:'fire',power:{profileId:'STANDARD',normal:{comparisonPower:125},maximum:null}};
test('missing maximum comparison retains normal index',()=>{
  const compare=make({compare:(a,b)=>{if(b.total==null)throw Error('MAX_UNAVAILABLE');return {metrics:{total:{index:125}}};}});
  assert.deepEqual(compare(row,base),{normal:125,maximum:null});
});
test('invalid normal comparison remains blocked',()=>{
  const compare=make({compare:()=>({metrics:{total:{index:null}}})});
  assert.equal(compare(row,base),null);
});
