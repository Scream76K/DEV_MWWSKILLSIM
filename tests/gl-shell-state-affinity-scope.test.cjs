const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../hope-hammer-browser-adapter.js'),'utf8');
const predicate=source.match(/  const shellStateAffinityOnlyResolved=x=>\{[\s\S]*?\n  \};/)[0];
const accept=(x,allSkills=[x],stats={affinity:0,maxAffinity:25})=>vm.runInNewContext(predicate+'shellStateAffinityOnlyResolved(allSkills[0])',{allSkills,stats});let n=0;
for(const [id,name,key] of [[18,'無我の境地','unknown'],[39,'濡れ刃紋','explicitAffinity']])for(let level=1;level<=3;level++){
 const x={skillId:id,name,skillKey:key,level};assert.equal(accept(x),true);n++;
 for(const patch of [{skillId:999},{skillId:id===18?39:18},{name:'Unknown'},{skillKey:'affinity'},{level:0},{level:4},{level:1.5},{level:NaN}]){assert.equal(accept({...x,...patch}),false);n++;}
 for(const extra of [{...x},{...x,name:'Unknown'},{...x,skillId:999}]){assert.equal(accept(x,[x,extra]),false);n++;}
 for(const key of ['affinity','maxAffinity'])for(const value of [NaN,Infinity,undefined,'25']){assert.equal(accept(x,[x],{affinity:0,maxAffinity:25,[key]:value}),false);n++;}
}
console.log(JSON.stringify({status:'PASS',assertions:n,scope:'actual extracted predicate, not malformed-input end-to-end tests'}));
