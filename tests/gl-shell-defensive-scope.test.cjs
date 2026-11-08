const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../hope-hammer-browser-adapter.js'),'utf8');
const predicate=source.match(/  const shellDefensiveOnlyResolved=x=>\{[\s\S]*?\n  \};/)[0];
function accepted(x,allSkills=[x],stats={defense:1}){return vm.runInNewContext(predicate+'shellDefensiveOnlyResolved(allSkills[0])',{allSkills,stats});}
let n=0;
for(const [id,name,skillKey,max] of [[118,'防御','unknown',7],[156,'雷耐性','thunderResistance',3]])for(let level=1;level<=max;level++){
 const x={skillId:id,name,level,skillKey};assert.equal(accepted(x),true);n++;
 for(const patch of [{skillId:999},{name:'Unknown'},{level:0},{level:max+1},{level:1.5},{level:NaN},{skillKey:'attack'}]){assert.equal(accepted({...x,...patch}),false);n++;}
 for(const extra of [{...x},{...x,skillId:999},{...x,name:'Unknown'},{skillId:165},{skillId:181},{skillKey:'resistanceConversionThunder'},{skillKey:'resistanceConversionWater'},{name:'耐性変換【雷】'},{name:'耐性変換【水】'}]){assert.equal(accepted(x,[x,extra]),false);n++;}
 for(const defense of [NaN,Infinity,undefined,'1']){assert.equal(accepted(x,[x],{defense}),false);n++;}
}
console.log(JSON.stringify({assertions:n,status:'PASS',scope:'actual candidate predicate; not full adapter malformed-input integration'}));
