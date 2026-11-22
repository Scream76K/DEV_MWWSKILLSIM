const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..')),{JSDOM,VirtualConsole}=require('jsdom');
const f=JSON.parse(fs.readFileSync(P+'/tests/fixtures/selected-hp-inputs.json')),pack=JSON.parse(fs.readFileSync(P+'/tests/fixtures/offset-maximum-inputs.json')).data;
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('⑥ Dark Arts uses the selected body/wave target while preserving explicit route mechanics and stored builds',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(P+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark-auto.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const clone=x=>JSON.parse(JSON.stringify(x)),read=expr=>JSON.parse(w.eval('JSON.stringify('+expr+')')),doc=w.document,$=id=>doc.getElementById(id);
 const body=(x)=>x.channels.normal.components.filter(c=>c.componentSource!=='GS_DARK_ARTS_WAVE').reduce((n,c)=>n+c.value,0);
 const normal=x=>x.channels.normal;
 function save(x,label){w.applyBuildSnapshot(clone(x));$('buildName').value=label;$('saveBuild').click();}
 function compare(label){for(const e of doc.querySelectorAll('#compareBuilds input[data-compare-name]'))e.checked=e.dataset.compareName===label;$('runCompare').click();return read('lastBuildComparisonRows')?.[0]?.oneHitPipeline;}
 function select(monster,part){$('monster').value=String(monster);$('monster').dispatchEvent(new w.Event('change',{bubbles:true}));$('monsterPart').value=String(part);$('monsterPart').dispatchEvent(new w.Event('change',{bubbles:true}));}
 try{
  const zero={slash:.61,blunt:.52,pierce:.45,fire:.2,water:.1,thunder:.2,ice:.2,dragon:0};
  const absent={...zero};delete absent.dragon;
  const monster={id:99123,kind:'large',name:'テスト対象',parts:[{id:99124,name:'頭',monster:{id:99123},multipliers:zero},{id:99125,name:'尻尾',monster:{id:99123},multipliers:absent},{id:99126,name:'脚',monster:{id:99123},multipliers:{...zero,dragon:'bad'}}]};
  w.__pack={...clone(pack),armor:clone(f.armor),monsters:[...clone(pack.monsters||[]),monster,{id:20,kind:'large',name:'アルシュベルド',parts:[]}]};
  w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const base={...clone(f.profiles.find(x=>x.kind==='great-sword').input),armor:{head:653,chest:654},target:{monsterId:'training-room',partId:'training-front'}};
  save(base,'wave');save({...base,armor:{}},'plain');save({...base,combo:{moves:[{techniqueId:'canonical:GS_CHARGED_SLASH_3'}]}},'explicit');
  const saves=read('savedBuildMap()');
  select('training-room','training-back');$('powerDragonHz').value='77';const onScreen=read('buildSnapshot().target');
  const dark=compare('wave');assert.equal(dark.evaluationPlan.target.part,'training-back','shared on-screen target, not the saved front');near(dark.evaluationPlan.automaticDragonHitzone,5);assert.equal(read('createBuildComparisonReport().context.conditions.dragonHz'),null);assert.deepEqual(read('createBuildComparisonReport().context.dragonHitzoneByBuild'),[{name:'wave',monsterId:'training-room',partId:'training-back',state:null,dragonHz:5}]);
  near(normal(dark).diagnostics.darkArtsWave.element,600/10*1.15*.05*2);near(normal(dark).diagnostics.darkArtsWave.physical,215*.3*1.32*.2*.975*2);assert.ok(body(dark)>0&&body(dark)<1191.25908*.25);
  assert.deepEqual(read('buildSnapshot().target'),onScreen);assert.equal($('powerDragonHz').value,'77');assert.deepEqual(read('savedBuildMap()'),saves);
  assert.equal($('comparisonSkillInputs').hidden,true);assert.ok($('darkArtsReferencePanel').contains($('daDragonHz')));
  const p=compare('plain');assert.equal(p.evaluationPlan.target.part,'training-front');assert.equal(normal(p).diagnostics.darkArtsWave,undefined);
  const e=compare('explicit');assert.equal(e.evaluationPlan.target.part,'training-back');assert.equal(e.evaluationPlan.selection,'EXPLICIT');near(normal(e).diagnostics.darkArtsWave.element,600/10*1.15*.05);assert.match(e.channels.maximum.diagnostics.darkArtsWave.reason,/MAXIMUM_BUFF_INTERACTIONS_PENDING/);
  const legacy=read("compareSnapshot('diagnostic',savedBuildMap().explicit,compareStep5Snapshot())").oneHitPipeline;
  assert.equal(legacy.evaluationPlan.target.part,'training-front');near(normal(legacy).diagnostics.darkArtsWave.element,600/10*1.15*.77);
  select(99123,99124);$('powerDragonHz').value='77';const z=compare('wave');assert.equal(normal(z).metrics.comboTotalDamage.status,'available');assert.ok(body(z)>0);assert.equal(normal(z).diagnostics.darkArtsWave.includedInPower,false);assert.match(normal(z).diagnostics.darkArtsWave.reason,/龍肉質0/);
  for(const id of [99125,99126]){select(99123,id);$('powerDragonHz').value='77';const err=compare('wave');assert.equal(err.reason,'REAL_SLICE:TARGET_HITZONE_INVALID');assert.equal(err.channels?.normal?.metrics?.comboTotalDamage?.status==='available',false);}
  select('20:king','king-alsh:4');assert.ok($('monsterState'));$('monsterState').value='releasedOff';
  const king=compare('wave');assert.equal(king.reason,'REAL_SLICE:TARGET_VARIANT_HITZONE_SOURCE_NOT_ADOPTED');assert.equal(king.evaluationPlan.target.monster,'20:king');assert.equal(king.evaluationPlan.automaticTargetState,'releasedOff');assert.equal($('monsterState').value,'releasedOff');
  assert.deepEqual(read('savedBuildMap()'),saves);assert.deepEqual(errors,[]);
 }finally{w.close();}
});
