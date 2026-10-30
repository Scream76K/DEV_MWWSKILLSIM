const fs=require('fs'),path=require('path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const jobs=[
 {file:'tools/conversion-black-eclipse-proof.cjs',old:"[['infected','INFECTED',false],['overcome','OVERCOME',false],['missing','',false],['dragon','OVERCOME',true]]",selected:"[['overcome','OVERCOME',false],['missing','',false]]",cut:'let comparison;',extra:"for(const key of ['components','metrics','execution','effectPlan'])assert.deepEqual(cases[1].real.channels.maximum[key],cases[0].real.channels.maximum[key]);"},
 {file:'tools/conversion-seregios-proof.cjs',old:"[['no-series',0,1,false,210],['both',1,1,false,220],['no-rush',1,0,false,200],['dragon',1,1,true,220]]",selected:"[['both',1,1,false,220]]",cut:'let comparison,negative;',extra:''}
];
const results=[];
for(const j of jobs){let source=fs.readFileSync(j.file,'utf8');assert.ok(source.includes(j.old));source=source.replace(j.old,j.selected).split(j.cut)[0]+j.extra+"\nconsole.log(JSON.stringify({cases}));w.close();\n";source=source.replace("if(label==='infected')w.eval(`buildName.value='infected';saveNamedBuild();`);",'').replace("if(!dragon&&mode!=='before'&&label!=='no-rush')w.eval(`buildName.value='${label}';saveNamedBuild();`);",'');
 const filename=path.resolve(j.file),bootstrap=`process.argv[2]='after';const Module=require('module');const m=new Module(${JSON.stringify(filename)});m.filename=${JSON.stringify(filename)};m.paths=Module._nodeModulePaths(${JSON.stringify(path.dirname(filename))});m._compile(${JSON.stringify(source)},${JSON.stringify(filename)});`;
 const r=cp.spawnSync(process.execPath,['-e',bootstrap],{encoding:'utf8',maxBuffer:32*1024*1024});results.push({file:j.file,originalHash:sha(fs.readFileSync(j.file)),selectedCases:j.selected,derivedSourceHash:sha(source),exitCode:r.status,stderr:r.stderr,output:r.status===0?JSON.parse(r.stdout):r.stdout});if(r.status!==0){console.log(JSON.stringify({results},null,2));process.exit(1);}
}
const reused=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/conversion-sourai-after.raw.json'));
for(const file of ['index.html','hope-hammer-browser-adapter.js'])assert.equal(reused.hashes[file],sha(fs.readFileSync(file)));
console.log(JSON.stringify({scope:'3 selected current-source contract cases; final-source sourai evidence reused, not rerun. No legal equipment claim or all-suite PASS.',results,reusedEvidence:'conversion-sourai-after.raw.json',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(f=>[f,sha(fs.readFileSync(f))]))},null,2));
