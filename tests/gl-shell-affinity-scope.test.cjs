const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../hope-hammer-browser-adapter.js'),'utf8');
const rules=source.match(/ const CONDITIONAL_AFFINITY_SKILLS=Object.freeze\(\{[\s\S]*?\n \}\);/)[0];
const predicate=source.match(/  const shellAffinityOnlyResolved=x=>\{[\s\S]*?\n  \};/)[0];
function accepted(x,allSkills=[x],stats={affinity:0,maxAffinity:50}){return vm.runInNewContext(rules+predicate+'shellAffinityOnlyResolved(allSkills[0])',{allSkills,stats});}
let n=0;
for(const [id,name] of [[57,'弱点特効'],[57,'Weakness Exploit'],[142,'力の解放'],[142,'Latent Power']])for(let level=1;level<=5;level++){const x={skillId:id,name,level,skillKey:'conditionalAffinity'};assert.equal(accepted(x),true);n++;for(const patch of [{skillId:999},{name:'Unknown'},{level:0},{level:6},{level:1.5},{level:NaN},{skillKey:'unknown'}]){assert.equal(accepted({...x,...patch}),false);n++;}assert.equal(accepted(x,[x,{...x}]),false);assert.equal(accepted(x,[x],{affinity:NaN,maxAffinity:50}),false);n+=2;}
for(const id of [39,99,103,156]){assert.equal(accepted({skillId:id,name:'力の解放',level:1,skillKey:'conditionalAffinity'}),false);n++;}
console.log(JSON.stringify({assertions:n,status:'PASS',scope:'actual candidate predicate extracted and executed; not full adapter malformed-input integration'}));
