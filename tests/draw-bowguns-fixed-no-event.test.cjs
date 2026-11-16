const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const P=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),clone=x=>JSON.parse(JSON.stringify(x));
test('fixed Artia bowgun draw skills have no draw event; preserve explicit and other scenarios',()=>{
 const profiles=JSON.parse(fs.readFileSync(P+'/tests/fixtures/selected-hp-inputs.json')).profiles,data=JSON.parse(fs.readFileSync(P+'/tests/fixtures/offset-maximum-inputs.json')).data,rows=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://draw.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 let captured;const original=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...original,evaluateCurrent(input){captured=input;return original.evaluateCurrent(input);}};
 const run=(input,label)=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));rows.push({label,input,result});return result;};
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
 try{w.__pack=data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');

 for(const p of profiles.filter(p=>['light-bowgun','heavy-bowgun'].includes(p.kind))){
 const make=(id,lv)=>({...clone(p.input),charmCustom:{skills:lv?[{name:id===8?'抜刀術【力】':'抜刀術【技】',level:lv,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}}),off=run(make(8,0),'baseline');
 for(const id of [8,103])for(const lv of [1,2,3]){
 const on=run(make(id,lv),p.kind+id+lv),direct=captured;
 for(const ch of ['normal','maximum']){
 assert.equal(on.channels[ch].metrics.comboTotalDamage.status,'available');
 assert.deepEqual(on.channels[ch].components,off.channels[ch].components);
 assert.deepEqual(on.channels[ch].metrics,off.channels[ch].metrics);
 assert.deepEqual(on.channels[ch].execution,off.channels[ch].execution);
 assert.ok((on.channels[ch].diagnostics.excludedCalculationSkills||[]).some(x=>x.skillId===id&&x.status==='NOT_APPLICABLE'&&x.reason==='DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 assert.ok(!(on.channels[ch].diagnostics.ignoredSkillEffects||[]).some(x=>x.skillId===id));
 }
 const snap=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.deepEqual(run(snap,'restore'),on);
 for(const patch of [{criticalDrawHits:0},{criticalDrawHits:[]},{punishingDrawHits:false},{punishingDrawHits:[]},{drawAttack:true},{mounted:true},{dismountAttack:true},{sneakAttack:true},{standardEvaluation:false},{criticalDrawHits:{normal:null,maximum:{[direct.techniqueIds[0]]:[true]}}},{punishingDrawHits:{normal:null,maximum:{[direct.techniqueIds[0]]:[true]}}}]){
 const input={...direct,conditions:{...direct.conditions,...patch}},before=JSON.stringify(input.conditions),out=original.evaluateCurrent(input);
 assert.equal(JSON.stringify(input.conditions),before);
 assert.ok(!JSON.stringify(out).includes('DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 }
 const broken={...direct,techniqueDb:{...direct.techniqueDb,get(kind,tech){const t=direct.techniqueDb.get(kind,tech);return t?{...t,revision:999}:t;}}};
 assert.ok(!JSON.stringify(original.evaluateCurrent(broken)).includes('DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 const stateKey=p.kind==='light-bowgun'?'lightBowgunState':'hbgState';
 for(const patch of [{ammoType:'FIRE'},{shotMode:'OTHER'},{normalModeLevel:1}]){
 assert.ok(!JSON.stringify(original.evaluateCurrent({...direct,[stateKey]:{...direct[stateKey],...patch}})).includes('DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 }
 for(const patch of [{weapon:{...direct.weapon,id:999999}},{techniqueIds:[direct.techniqueIds[0],direct.techniqueIds[0]]},{weapon:{...direct.weapon,specials:[{kind:'element',element:'fire',damage:100}]}}]){
 assert.ok(!JSON.stringify(original.evaluateCurrent({...direct,...patch})).includes('DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 }
 }
 const savedOn=run(make(103,3),'save A');w.eval("buildName.value='drawGunA';saveNamedBuild();");
 run(make(8,0),'save B');w.eval("buildName.value='drawGunB';saveNamedBuild();");const bytes=w.eval('JSON.stringify(savedBuildMap())');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 assert.equal(w.eval('JSON.stringify(savedBuildMap())'),bytes);
 const compare=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows)'));assert.ok(JSON.stringify(compare).includes('DRAW_FIXED_NORMAL_SEQUENCE_HAS_NO_DRAW_EVENT'));
 assert.deepEqual(run(make(103,3),'saved active again'),savedOn);
 assert.deepEqual(run(make(8,0),'restore off'),off);
 }
 assert.deepEqual(errors,[]);
 }finally{if(process.env.DRAW_RESULTS)fs.writeFileSync(process.env.DRAW_RESULTS,JSON.stringify({rows,errors},null,2));w.close();}
});
