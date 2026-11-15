const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{JSDOM,VirtualConsole}=require('jsdom');const P=process.env.PRODUCT_ROOT||path.resolve(__dirname,'..'),rows=[],probes=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://gl1084.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const adapter=w.MHWRealOneHitBrowserAdapter,contexts=[],saved={};w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(i){contexts.push(i);return adapter.evaluateCurrent(i);}};
try{w.__pack=require(P+'/tests/fixtures/offset-maximum-inputs.json').data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
for(const input of require('./fixtures/gl1084-id163-inputs.json')){contexts.length=0;w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));saved[input.weaponId]=contexts[0];rows.push({input,inputHash:crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'),contexts:JSON.parse(JSON.stringify(contexts)),result});}

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const baseline=process.env.BASELINE_FILE?JSON.parse(fs.readFileSync(process.env.BASELINE_FILE)):null;
for(const row of rows)for(const ch of ['normal','maximum']){
 const c=row.result.channels[ch],shell=c.components.find(x=>x.id.includes(':shelling:'));
 const attack=row.input.weaponId==='1084'?220:215;
 near(shell.details.physical,attack*.09);near(shell.details.element,80/10*.30);near(shell.value,attack*.09+2.4);
 assert.equal(shell.details.adoptionStatus,'SOURCE_BACKED_PROVISIONAL_CANDIDATE');assert.equal(shell.details.sourceCandidate.ownerApproval,false);
 if(baseline)assert.deepEqual(c.components.filter(x=>x.techniqueId==='GL_SLAM'),baseline.rows.find(x=>x.input.weaponId===row.input.weaponId).result.channels[ch].components.filter(x=>x.techniqueId==='GL_SLAM'));
 if(row.input.weaponId==='1084'&&ch==='maximum')assert.ok(c.diagnostics.ignoredSkillEffects.some(x=>x.skillId===163));
}
// Synthetic shell-boundary inputs, not legal equipment evidence.
assert.equal(crypto.createHash('sha256').update(JSON.stringify(w.TechniqueDBEngine.get('gunlance','GL_SHELL_NORMAL_MEDIUM'))).digest('hex'),'2793bc61ddbced65632979ca6b1ba19f675e0ceae3b2a1ec42434a8fa76f052d','MEDIUM must equal clean087118b runtime record');
const engine=w.TechniqueDBEngine,generic=w.MHWGenericProfileDamage,handler=w.GunlanceShellReference;
const input={action:'NORMAL',weaponBaseAttack:200,state:{shellingType:'NORMAL',shellingPower:'HIGH',loadedRounds:6,chargedRounds:2,fireHitzone:30},unreviewedSkills:[]};
for(const [label,change,reason] of [
 ['charged',{action:'CHARGED'},'SOURCE_VERSION_OR_POWER_PENDING'],['fullBurst',{action:'FULL_BURST'},'SOURCE_VERSION_OR_POWER_PENDING'],['stake',{action:'STAKE'},'SOURCE_VERSION_OR_POWER_PENDING'],
 ['long',{state:{...input.state,shellingType:'LONG'}},'SOURCE_VERSION_OR_POWER_PENDING'],['empty',{state:{...input.state,loadedRounds:0}},'LOADED_ROUNDS_PENDING'],
 ['otherPending',{unreviewedSkills:['independent-pending']},'UNREVIEWED_MODIFIER'],['metadata',{weaponShellMetadata:{type:'WIDE'}},'WEAPON_TYPE_CONFLICT']]){
 let message;try{handler.calculate({...input,...change},engine,generic);}catch(e){message=e.message;}assert.ok(message?.includes(reason),label+': '+message);probes.push({label,message});
}
for(const [type,power,mv,fire,rounds] of [['NORMAL','MEDIUM',8,70,6],['LONG','MEDIUM',11,150,3],['WIDE','HIGH',21,110,2]]){
 const r=handler.calculate({...input,state:{...input.state,shellingType:type,shellingPower:power,loadedRounds:rounds}},engine,generic);
 near(r.physical,200*mv/100);near(r.element,fire/10*.30);assert.equal(r.sourceCandidate,null);probes.push({label:type+'_'+power,result:r});
}
for(const field of ['unparenthesizedValue','parenthesizedValue']){
 const altered={get(k,id){const r=engine.get(k,id);return id==='GL_SHELL_NORMAL_HIGH'?{...r,specialSourceValues:{...r.specialSourceValues,[field]:999}}:r;}};
 assert.throws(()=>handler.calculate(input,altered,generic),/SOURCE_VERSION_OR_POWER_PENDING/);probes.push({label:'invalid-source-'+field,rejected:true});
}
const noCandidate={get(k,id){const r=engine.get(k,id);if(id!=='GL_SHELL_NORMAL_HIGH')return r;const copy={...r};delete copy.normalHighCandidate;return copy;}};
assert.throws(()=>handler.calculate(input,noCandidate,generic),/SOURCE_VERSION_OR_POWER_PENDING/);probes.push({label:'missing-candidate-gate',rejected:true});
assert.deepEqual(errors,[]);for(const row of rows)for(const ch of ['normal','maximum']){const c=row.result.channels[ch];assert.equal(c.metrics.comboTotalDamage.status,'available');assert.equal(c.execution.status,'complete');assert.equal(c.finalState.gunlance.loadedRounds,5);const shell=c.components.find(x=>x.id.includes('reference:gl_NORMAL'));assert.ok(shell);assert.equal(shell.status,'available');assert.ok(Math.abs(c.metrics.comboTotalDamage.value-c.components.reduce((a,x)=>a+x.value,0))<1e-9);}
}finally{if(process.env.RESULT_FILE)fs.writeFileSync(process.env.RESULT_FILE,JSON.stringify({rows,probes,errors},null,2));w.close();}
