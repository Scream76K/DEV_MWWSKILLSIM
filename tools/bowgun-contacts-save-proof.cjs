'use strict';
const fs=require('fs'),Module=require('module'),path=require('path');
const kind=process.argv[2];if(!['hbg','lbg'].includes(kind))throw Error('kind required');
const prefix=fs.readFileSync(path.join(__dirname,kind+'-element-skill-proof.cjs'),'utf8').split('try{\nfor(')[0];
const policy=kind==='hbg'?'powerHbgContactPolicy':'comboLBGContactPolicy',count=kind==='hbg'?'powerHbgContactCount':'comboLBGContactCount',key=kind==='hbg'?'hbgReferenceState':'lightBowgunState';
const body=`
const policy='${policy}',count='${count}',key='${key}';
const setCount=n=>{w.document.getElementById(policy).value='EXPLICIT_CONTACTS';w.document.getElementById(count).value=String(n);w.calcBuild();};
try{
 for(const [name,n,level] of [['A',2,0],['B',3,2]]){setCount(n);w.eval(\`build.decos=\${level?"{w0:'35'}":"{}"};calcBuild();buildName.value='\${name}';saveNamedBuild();\`);const r=take();out.cases.push({name,n,...r});assert.equal(r.snapshot.combo[key].contactCount,n);for(const ch of ['normal','maximum']){assert.equal(r.real.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify(r.real));assert.equal(r.real.channels[ch].components[0].details.contacts.length,n);}assert.ok(r.summary.includes('明示命中列総計'));assert.ok(JSON.parse(r.real.conditionKey).commonConditions);}
 w.document.querySelector('[data-build-load="A"]').click();out.loadedA=take();assert.equal(w.document.getElementById(count).value,'2');assert.deepEqual(out.loadedA.real.channels,out.cases[0].real.channels);
 setCount(3);out.sharedA=take();
 w.document.querySelector('[data-build-load="B"]').click();out.loadedB=take();assert.equal(w.document.getElementById(count).value,'3');assert.deepEqual(out.loadedB.real.channels,out.cases[1].real.channels);
 out.before=take();w.eval(\`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();\`);out.rows=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));out.after=take();assert.equal(out.rows.length,2);for(const row of out.rows){const expected=row.name==='A'?out.sharedA:out.loadedB;assert.deepEqual(row.real.channels,expected.real.channels);assert.deepEqual(JSON.parse(row.real.conditionKey).contacts,JSON.parse(expected.real.conditionKey).contacts);assert.equal(row.real.conditionKey,out.rows[0].real.conditionKey);}assert.deepEqual(out.after,out.before);
 const old=JSON.parse(JSON.stringify(out.cases[0].snapshot));delete old.combo[key].contactCount;w.__old=old;w.eval('applyBuildSnapshot(window.__old);calcBuild();');out.oldMissing=take();assert.equal(w.document.getElementById(count).value,'');assert.match(JSON.stringify(out.oldMissing.real),/CONTACT_COUNT_REQUIRED/);
 assert.deepEqual(errors,[]);out.checks.push({pass:true});
}catch(e){out.checks.push({pass:false,error:e.stack});}
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.checks.some(c=>!c.pass)?1:0;
`;
const m=new Module(__filename);m.filename=__filename;m.paths=module.paths;m._compile(prefix+body,__filename);
