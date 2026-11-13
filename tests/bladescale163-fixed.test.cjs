const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const P=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),clone=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`),targets=['long-sword','sword-and-shield','dual-blades','hammer','lance','gunlance','switch-axe','charge-blade','insect-glaive'];
test('ID163 fixed comparison replaces each adopted sharpness component, never the total',()=>{
 const profiles=JSON.parse(fs.readFileSync(P+'/tests/fixtures/selected-hp-inputs.json')).profiles,data=JSON.parse(fs.readFileSync(P+'/tests/fixtures/offset-maximum-inputs.json')).data,rows=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://blade163.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const run=(input,label)=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));rows.push({label,input,result});return result;};
 const comps=(r,ch)=>r.routes?Object.values(r.routes).flatMap(x=>x.channels[ch].components):r.channels[ch].components;
 // Independent coefficient replacement: white physical1.32 ->1.4, element1.15 ->1.25.
 // Shells, intrinsic stake/fire and phials do not use the body's ordinary sharpness.
 const ratio=(kind,c)=>!targets.includes(kind)?1:kind==='gunlance'&&['GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'].includes(c.techniqueId)&&Number(c.id.split(':').at(-1))>=2?1:c.id.includes(':phial:')?1:c.coefficientUnit==='MV'?1.4/1.32:c.coefficientUnit==='ELEMENT_MODIFIER'?1.25/1.15:1;
 try{w.__pack=data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 for(const p of profiles)for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT']){
  const input=lv=>({...clone(p.input),selectedHp:hp,charmCustom:{skills:lv?[{name:'刃鱗研装',level:lv,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}}),off=run(input(0),p.kind+hp+' off'),on=run(input(1),p.kind+hp+' on');
  for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].metrics.comboTotalDamage.status,'available');near(off.channels[ch].metrics.comboTotalDamage.value,p.K+p.J);const a=comps(off,ch),b=comps(on,ch);assert.equal(b.length,a.length);let expected=0;for(let i=0;i<a.length;i++){assert.equal(b[i].id,a[i].id);const v=a[i].value*(ch==='maximum'?ratio(p.kind,a[i]):1);near(b[i].value,v);expected+=v;}near(on.channels[ch].metrics.comboTotalDamage.value,expected);}
  if(targets.includes(p.kind)){assert.match(w.document.getElementById('buildSummary').textContent,/特殊斬れ味.*全コンボ/);const snapshot=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.deepEqual(run(snapshot,p.kind+hp+' snapshot'),on);}
  assert.deepEqual(run(input(0),p.kind+hp+' restored'),off);
 }
 const ls=profiles.find(p=>p.kind==='long-sword').input;
 for(const [id,physical,element] of [[881,1,.75],[841,1.05,1],[842,1.2,1.0625]]){
  const input=lv=>({...clone(ls),weaponId:String(id),artia:null,charmCustom:{skills:lv?[{name:'刃鱗研装',level:lv,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}}),off=run(input(0),'nonwhite '+id+' off'),on=run(input(1),'nonwhite '+id+' on');
  for(const ch of ['normal','maximum']){assert.equal(on.channels[ch].metrics.comboTotalDamage.status,'available');const a=comps(off,ch),b=comps(on,ch);assert.equal(a.length,b.length);for(let i=0;i<a.length;i++)near(b[i].value,a[i].value*(ch==='normal'?1:a[i].coefficientUnit==='MV'?1.4/physical:a[i].coefficientUnit==='ELEMENT_MODIFIER'?1.25/element:1));}
 }
 const cb=profiles.find(p=>p.kind==='charge-blade').input,active={...clone(cb),charmCustom:{skills:[{name:'刃鱗研装',level:1,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}};
 const saved=run(active,'saved CB on'),snapshot=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));w.eval("buildName.value='blade163A';saveNamedBuild();");run(cb,'saved CB off');w.eval("buildName.value='blade163B';saveNamedBuild();");const bytes=w.eval('JSON.stringify(savedBuildMap())');w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");assert.equal(w.eval('JSON.stringify(savedBuildMap())'),bytes);assert.match(w.document.getElementById('compareOut').textContent,/特殊斬れ味.*全コンボ/);rows.push({label:'comparison',result:JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows)'))});assert.deepEqual(run(snapshot,'individual restore CB'),saved);
 for(const level of [2,.5]){const r=run({...clone(ls),charmCustom:{skills:[{name:'刃鱗研装',level,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}},'invalid '+level);assert.ok(!r.channels||r.channels.normal.metrics.comboTotalDamage.status!=='available');}
 const counts={'long-sword':7,'sword-and-shield':4,'dual-blades':27,hammer:4,lance:6,'switch-axe':5,'insect-glaive':15};
 for(const [kind,n] of Object.entries(counts)){const r=rows.find(x=>x.label===kind+'FULL_HP on').result;assert.equal(r.channels.maximum.components.filter(c=>c.coefficientUnit==='MV').length,n);}
 const ig=rows.find(x=>x.label==='insect-glaiveFULL_HP on').result,events=ig.channels.maximum.execution.executed;assert.equal(events.filter(x=>Number(x.split(':')[0])<3).length,9);assert.equal(events.filter(x=>Number(x.split(':')[0])===3).length,6);
 assert.deepEqual(errors,[]);
 }finally{if(process.env.BLADE163_RESULTS)fs.writeFileSync(process.env.BLADE163_RESULTS,JSON.stringify({rows,errors},null,2));w.close();}
});
