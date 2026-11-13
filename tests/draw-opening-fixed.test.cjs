const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const P=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),clone=x=>JSON.parse(JSON.stringify(x));
test('draw skills standard opening only, normal off and unknown scope retained',()=>{
 const profiles=JSON.parse(fs.readFileSync(P+'/tests/fixtures/selected-hp-inputs.json')).profiles,data=JSON.parse(fs.readFileSync(P+'/tests/fixtures/offset-maximum-inputs.json')).data,rows=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://draw.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 let captured;const original=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...original,evaluateCurrent(input){captured=input;return original.evaluateCurrent(input);}};
 const run=(input,label)=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));rows.push({label,input,result});return result;};
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
 try{w.__pack=data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 for(const p of profiles){const make=(id,lv)=>({...clone(p.input),charmCustom:{skills:lv?[{name:id===8?'抜刀術【力】':'抜刀術【技】',level:lv,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}}),off=run(make(8,0),p.kind+' baseline');
 for(const id of [8,103])for(const lv of [1,2,3]){const on=run(make(id,lv),`${p.kind} ${id} ${lv}`),supported=['great-sword','lance'].includes(p.kind);
 for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].metrics.comboTotalDamage.status,'available');const a=off.channels[ch].components,b=on.channels[ch].components;if(!supported||ch==='normal')near(on.channels[ch].metrics.comboTotalDamage.value,off.channels[ch].metrics.comboTotalDamage.value);else{assert.equal(a.length,b.length);let expected=0;for(let i=0;i<a.length;i++){let v=a[i].value;if(i===0&&a[i].coefficientUnit==='MV')v*=id===8?(215+[0,3,5,7][lv])/215:(1+(-10+[0,50,75,100][lv])/100*.25)/.975;near(b[i].value,v);expected+=v;}near(on.channels[ch].metrics.comboTotalDamage.value,expected);assert.ok(on.channels.maximum.diagnostics.drawOpening);}}
 if(!supported)for(const r of on.routes?Object.values(on.routes):[on])assert.ok(r.channels.maximum.diagnostics.ignoredSkillEffects.some(x=>x.skillId===id&&x.reason==='DRAW_STANDARD_OPENING_ELIGIBILITY_PENDING'));else assert.match(w.document.getElementById('buildSummary').textContent,/納刀から固定始動/);
 const snap=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.deepEqual(run(snap,'snapshot '+p.kind+id+lv),on);
 }
 assert.deepEqual(run(make(8,0),p.kind+' restore'),off);
 }
 const gs=profiles.find(p=>p.kind==='great-sword').input,active={...clone(gs),charmCustom:{skills:[{name:'抜刀術【力】',level:3,type:'weapon'},{name:'抜刀術【技】',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}};
 const both=run(active,'both skills'),base=run(gs,'GS control');
 near(both.channels.maximum.components[0].value,base.channels.maximum.components[0].value*222/215*1.225/.975);
 run(active,'capture');const direct=captured,ids=direct.techniqueIds;
 const map=Object.fromEntries(ids.map((id,i)=>[id,[i===0]]));
 const explicit={...direct,conditions:{...direct.conditions,standardEvaluation:false,punishingDrawHits:{normal:map,maximum:map},criticalDrawHits:{normal:map,maximum:map}}};
 const ex=original.evaluateCurrent(explicit);rows.push({label:'explicit retained',result:ex});assert.equal(ex.channels.maximum.metrics.comboTotalDamage.status,'available');near(ex.channels.normal.metrics.comboTotalDamage.value,base.channels.normal.metrics.comboTotalDamage.value);
 const missing=original.evaluateCurrent({...explicit,conditions:{...explicit.conditions,punishingDrawHits:{normal:null,maximum:map}}});rows.push({label:'explicit missing map',result:missing});assert.equal(missing.channels.normal.metrics.comboTotalDamage.status,'available');near(missing.channels.normal.metrics.comboTotalDamage.value,base.channels.normal.metrics.comboTotalDamage.value);assert.equal(missing.channels.normal.execution.executed.length,3);assert.equal(missing.channels.maximum.metrics.comboTotalDamage.status,'available');

 const variants=[['absent',undefined],['null',null],['valid',map],['false',Object.fromEntries(ids.map(id=>[id,[false]]))],['bad-shape',[]],['bad-count',Object.fromEntries(ids.map(id=>[id,[]]))],['bad-boolean',Object.fromEntries(ids.map(id=>[id,[1]]))],['unknown-technique',{...map,FAKE:[true]}]];
 for(const [id,key] of [[8,'punishingDrawHits'],[103,'criticalDrawHits']])for(const channel of ['normal','maximum'])for(const [label,value] of variants){
  const conditions={...explicit.conditions,[key]:{...explicit.conditions[key],[channel]:value}},input={...explicit,conditions};const before=JSON.stringify(input.conditions);const r=original.evaluateCurrent(input);assert.equal(JSON.stringify(input.conditions),before);
  rows.push({label:`map-boundary ${id} ${channel} ${label}`,result:r});
  for(const ch of ['normal','maximum']){assert.equal(r.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(r.channels[ch].execution.executed.length,3);assert.equal(r.channels[ch].execution.status,'complete');}
  near(r.channels.normal.metrics.comboTotalDamage.value,base.channels.normal.metrics.comboTotalDamage.value);
  const valid=label==='valid',active=channel==='normal'||valid;
  const expected=active?both.channels.maximum.metrics.comboTotalDamage.value:base.channels.maximum.metrics.comboTotalDamage.value-base.channels.maximum.components[0].value+base.channels.maximum.components[0].value*(id===8?1.225/.975:222/215);
  near(r.channels.maximum.metrics.comboTotalDamage.value,expected);
  if(channel==='maximum'&&!['valid','false'].includes(label))assert.ok(r.channels.maximum.diagnostics.ignoredSkillEffects.some(x=>x.skillId===id&&x.reason.startsWith('DRAW_')));
 }
 for(const standardEvaluation of [false,true])for(const trigger of ['mounted','dismountAttack','sneakAttack']){const r=original.evaluateCurrent({...explicit,conditions:{...explicit.conditions,standardEvaluation,[trigger]:true}});rows.push({label:`trigger ${standardEvaluation} ${trigger}`,result:r});for(const ch of ['normal','maximum']){assert.equal(r.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(r.channels[ch].execution.executed.length,3);near(r.channels[ch].metrics.comboTotalDamage.value,base.channels[ch].metrics.comboTotalDamage.value);}}
 for(const level of [4,.5,-1]){const invalid=clone(active);invalid.charmCustom.skills=[{name:'抜刀術【力】',level,type:'weapon'}];const r=run(invalid,'invalid '+level);assert.ok(!r.channels||r.channels.normal.metrics.comboTotalDamage.status!=='available');}
 run(active,'save A');w.eval("buildName.value='drawA';saveNamedBuild();");run(gs,'save B');w.eval("buildName.value='drawB';saveNamedBuild();");const bytes=w.eval('JSON.stringify(savedBuildMap())');w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");assert.equal(w.eval('JSON.stringify(savedBuildMap())'),bytes);assert.match(w.document.getElementById('compareOut').textContent,/納刀から固定始動/);rows.push({label:'comparison',result:JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows)'))});
 assert.deepEqual(errors,[]);
 }finally{if(process.env.DRAW_RESULTS)fs.writeFileSync(process.env.DRAW_RESULTS,JSON.stringify({rows,errors},null,2));w.close();}
});
