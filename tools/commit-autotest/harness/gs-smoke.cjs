'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{isDeepStrictEqual}=require('node:util');
const {JSDOM,VirtualConsole}=require('jsdom');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(fs.readFileSync('/harness/expected-inputs.json'));
const checkInputs=()=>{for(const e of expected)assert.equal(digest(fs.readFileSync('/input/'+e.path)),e.sha256,e.path);};
checkInputs();
const report={scope:'CLOUD_LINUX_OFFLINE_PUBLIC_CONSUMER_SMOKE_NOT_MAC_OR_DAMAGE_ACCURACY_APPROVAL',sourceCommit:require('./current-evidence.cjs').currentProvenance().sourceCommit,nodeVersion:process.version,jsdomVersion:require('jsdom/package.json').version,independentExpectedDamage:null,legalCompleteBuild:false,productSourceModified:false,cases:[],jsdomErrors:[],consoleErrors:[],blockedFetches:[],dialogs:[],alerts:[],individualRestores:[],knownFailures:[],comparison:null};
const rawDb=fs.readFileSync('/input/normalized-data.json');
report.databaseSha256=digest(rawDb);
report.testInitialization='After fixture selection, calcBuild is called twice: first computes and syncs displayed inputs, second evaluates with those synchronized inputs. The earlier one-call metadata mismatch is retained separately.';
const data=JSON.parse(rawDb),initialData=digest(Buffer.from(JSON.stringify(data)));
const oracleBytes=fs.readFileSync('/harness/oracle/expected-values.json'),oracle=JSON.parse(oracleBytes);
const sourceContractBytes=fs.readFileSync('/harness/oracle/source-contract.json'),sourceContract=JSON.parse(sourceContractBytes);
assert.equal(digest(sourceContractBytes),oracle.sourceContractSha256,'oracle source contract must be unchanged');
assert.equal(report.databaseSha256,oracle.databaseSha256,'oracle must bind the same fixed input DB');
const absoluteTolerance=Number(oracle.absoluteTolerance);
assert.equal(absoluteTolerance,1e-9);
const withinTolerance=(actual,expected)=>Number.isFinite(actual)&&Number.isFinite(Number(expected))&&Math.abs(actual-Number(expected))<=absoluteTolerance;
const oracleControls=Object.entries(oracle.negativeComparatorControls).map(([name,c])=>({name,wrongTotal:c.wrongTotal,rejected:!withinTolerance(Number(c.wrongTotal),oracle.cases.find(x=>x.id===238).expectedComboTotal)}));
assert.ok(oracleControls.every(x=>x.rejected),'arithmetic negative controls must be rejected; not product mutation tests');
report.independentExpectedDamage={status:'PENDING_REEXECUTION_COMPARISON',scope:oracle.scope,absoluteTolerance,derivation:oracle.derivation,sourceContractSha256:oracle.sourceContractSha256,expectedValuesSha256:digest(oracleBytes),sources:sourceContract.sources,boundaries:sourceContract.boundaries,negativeComparatorControls:oracleControls,cases:[]};
const ids=['GS_CHARGED_SLASH_3','GS_STRONG_CHARGED_SLASH_3','GS_STRONG_WIDE_SLASH_3'];
const vc=new VirtualConsole();vc.on('jsdomError',e=>report.jsdomErrors.push(e.message));vc.on('error',(...args)=>report.consoleErrors.push(args.map(x=>String(x?.message||x)).join(' ')));
let dom;
(async()=>{
 try{
  const html=require('/input/tools/dom-test-setup.cjs').readSimulatorHtml();
  dom=new JSDOM(html,{url:'https://isolated-simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=url=>{report.blockedFetches.push(String(url));return Promise.reject(Error('TEST_NETWORK_DISABLED'));};w.confirm=message=>{const text=String(message),allow=text.includes('読み込みます')&&/^装備セット「ISOLATED_GS_(236|238)」/.test(text);report.dialogs.push({text,allowedWithinTestOnly:allow});return allow;};w.alert=message=>report.alerts.push(String(message));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
  const w=dom.window,read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
  if(w.__localDBReady)await w.__localDBReady;
  assert.equal(typeof w.calcBuild,'function','actual calcBuild must load');
  assert.equal(typeof w.MHWRealOneHitBrowserAdapter?.evaluateCurrent,'function','actual adapter must load');
  assert.equal(typeof w.HimmelRealOneHitPipeline,'function','actual pipeline must load');
  w.__testData=data;
  w.eval("DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();");
  for(const id of [236,238]){
   assert.equal(data.weapons.find(x=>x.id===id)?.kind,'great-sword');
   w.eval(`build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value='great-sword';renderWeapon();weapon.value='${id}';syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=${JSON.stringify(ids.map(techniqueId=>({techniqueId:'canonical:'+techniqueId})))};restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();calcBuild();`);
   const record=read('({weapon:selectedWeapon(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit})');
   record.inputScope='Weapon only. No armor/decorations/charm; not a complete legal equipped build.';
   assert.equal(record.weapon.id,id);
   report.cases.push(record);
   assert.equal(record.result.status,'OK',JSON.stringify(record.result));
   const expectedCase=oracle.cases.find(x=>x.id===id);
   assert.ok(expectedCase);assert.deepEqual(record.skills,expectedCase.weaponSkills);
   assert.equal(Number(record.weapon.damage.raw),Number(expectedCase.rawAttack));
   assert.deepEqual(record.weapon.specials,[]);
   assert.deepEqual(record.result.evaluationPlan.techniqueIds,expectedCase.hits.map(x=>x.techniqueId));
   const key=JSON.parse(record.result.conditionKey);
   assert.deepEqual(key.target,{hitZoneKey:'training-front',id:'training-room'});
   assert.equal(Number(key.conditions.hz),Number(expectedCase.hitzone));
   const oracleCase={id,expectedComboTotal:expectedCase.expectedComboTotal,channels:{}};
   report.independentExpectedDamage.cases.push(oracleCase);
   for(const channel of ['normal','maximum']){
    assert.equal(record.result.channels?.[channel]?.execution?.status,'complete');
    const m=record.result.channels[channel].metrics.comboTotalDamage;
    assert.equal(m.status,'available');assert.equal(Number.isFinite(m.value),true);
    const comparisons=[];
    assert.equal(record.result.channels[channel].components.length,expectedCase.hits.length*2);
    for(const hit of expectedCase.hits){
     const rows=record.result.channels[channel].components.filter(x=>x.techniqueId===hit.techniqueId);
     assert.equal(rows.length,2);
     for(const [unit,expectedValue] of [['MV',hit.expectedPhysical],['ELEMENT_MODIFIER',hit.expectedElement]]){
      const component=rows.find(x=>x.coefficientUnit===unit);assert.ok(component);assert.equal(component.status,'available');
      const match=withinTolerance(component.value,expectedValue);
      comparisons.push({techniqueId:hit.techniqueId,unit,expected:expectedValue,observed:component.value,absoluteError:Math.abs(component.value-Number(expectedValue)),match});
      assert.equal(match,true,'source-formula component mismatch: '+id+'/'+channel+'/'+hit.techniqueId+'/'+unit);
     }
    }
    const totalMatch=withinTolerance(m.value,expectedCase.expectedComboTotal);
    oracleCase.channels[channel]={components:comparisons,expectedComboTotal:expectedCase.expectedComboTotal,observedComboTotal:m.value,absoluteError:Math.abs(m.value-Number(expectedCase.expectedComboTotal)),match:totalMatch};
    assert.equal(totalMatch,true,'source-formula combo total mismatch: '+id+'/'+channel);
   }
   const resolvedColor=read('MHWWeaponMaxSharpness.fromMHDB(selectedWeapon(),0).color');
   assert.equal(resolvedColor,expectedCase.sharpnessColor);
   record.sharpnessMetadata={weaponMaximumColor:resolvedColor,sourceFormulaPhysicalMultiplier:expectedCase.sharpnessPhysical,recordedKeyPhysicalMultiplier:key.conditions.sharp,recordedKeyElementMultiplier:key.conditions.esharp,scope:'Physical sharpness is independently sourced and matches the weapon maximum; element is zero in this fixture.',physicalMatches:withinTolerance(Number(key.conditions.sharp),expectedCase.sharpnessPhysical)};
   if(!record.sharpnessMetadata.physicalMatches)report.knownFailures.push({test:'EFFECTIVE_SHARPNESS_KEY_MISMATCH',name:'ISOLATED_GS_'+id,reason:'Weapon maximum green / source-formula physical 1.05 conflicts with conditionKey sharp '+key.conditions.sharp,expected:expectedCase.sharpnessPhysical,recorded:key.conditions.sharp,recordedElementSharp:key.conditions.esharp});
   const name='ISOLATED_GS_'+id;
   w.document.getElementById('buildName').value=name;
   w.saveNamedBuild();
   assert.ok(read('savedBuildMap()')[name],'save must exist in test-only memory storage');
  }
  report.savedStorageScope='FRESH_JSDOM_MEMORY_ONLY_NO_USER_STORAGE';
  const savedBefore=read('savedBuildMap()');
  const beforeLoads=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
  for(const id of [236,238]){
   const name='ISOLATED_GS_'+id,button=w.document.querySelector('[data-build-load="'+name+'"]');
   assert.ok(button,'actual saved-build load button must exist');button.click();
   const restored=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit})');
   const prior=report.cases.find(c=>c.weapon.id===id);
   const restoreRecord={name,immediateWithoutExtraCalcBuild:true,...restored};report.individualRestores.push(restoreRecord);
   assert.equal(String(restored.snapshot.weaponId),String(id),'actual button must restore the selected weapon');
   assert.deepEqual(restored.snapshot,read('buildSnapshotComparable(savedBuildMap()["'+name+'"])'),'loaded snapshot must match saved snapshot');
   assert.deepEqual(restored.skills,prior.skills,'restored skills must match');
   assert.deepEqual(restored.result.channels,prior.result.channels,'restored numeric pipeline channels must match');
   restoreRecord.fullPipelineResultEqual=isDeepStrictEqual(restored.result,prior.result);
   restoreRecord.snapshotAndSkillsRestored=true;restoreRecord.pipelineChannelsRestored=true;
   if(!restoreRecord.fullPipelineResultEqual)report.knownFailures.push({test:'IMMEDIATE_FULL_RESULT_RESTORE',name,reason:'conditionKey/comparisonContext retains previous displayed input; full result differs without an extra calculation'});
   w.calcBuild();
   restoreRecord.afterExplicitRecalculationMatches=isDeepStrictEqual(read('calcState.realOneHit'),prior.result);
   assert.equal(restoreRecord.afterExplicitRecalculationMatches,true,'one explicit recalc must restore the full result in this diagnostic');
   assert.deepEqual(savedBefore,read('savedBuildMap()'),'individual load must not change saved test data');
  }
  const afterLoads=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
  report.restoreSequenceReturnedToOriginalAfterExplicitRecalculation=JSON.stringify(beforeLoads)===JSON.stringify(afterLoads);
  assert.deepEqual(beforeLoads,afterLoads,'A then B restore sequence must return to original B state');
  assert.deepEqual(report.alerts,[]);
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
  w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
  const rows=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');
  report.comparison={rows,text:w.document.getElementById('compareOut').textContent};
  assert.ok(Array.isArray(rows),report.comparison.text);assert.equal(rows.length,2);
  for(const row of rows){
   const id=Number(row.name.replace('ISOLATED_GS_','')),prior=report.cases.find(c=>c.weapon.id===id);
   assert.ok(prior);assert.deepEqual(row.pipeline.channels,prior.result.channels,'A/B must use the same per-build pipeline result');
  }
  const after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
  report.comparison.before=before;report.comparison.after=after;report.comparison.savedBefore=savedBefore;report.comparison.savedAfter=read('savedBuildMap()');
  assert.deepEqual(before,after,'comparison must preserve current test selection');
  assert.deepEqual(savedBefore,read('savedBuildMap()'),'comparison must preserve saved test builds');
  report.comparison.samePipelineChannels=true;report.comparison.currentSelectionPreserved=true;report.comparison.savedTestBuildsPreserved=true;
  assert.deepEqual(report.jsdomErrors,[]);
  report.independentExpectedDamage.status='SOURCE_FORMULA_MATCH_UNROUNDED_ONLY';
  report.result=report.knownFailures.length?'PARTIAL_PASS_METADATA_MISMATCH':'SOURCE_FORMULA_AND_RESTORE_AB_PASS_WITHIN_FIXED_SCOPE';if(report.knownFailures.length)process.exitCode=2;
  report.inputObjectUnchanged=digest(Buffer.from(JSON.stringify(data)))===initialData;
  checkInputs();report.fileInputsUnchanged=true;
 }catch(error){report.failure=error.stack;report.result='SMOKE_FAILED_OR_BLOCKED';process.exitCode=2;}
 finally{if(dom)dom.window.close();checkInputs();fs.writeFileSync('/output/gs-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,cases:report.cases.map(c=>({id:c.weapon?.id,status:c.result?.status,reason:c.result?.reason,normal:c.result?.channels?.normal?.metrics?.comboTotalDamage,maximum:c.result?.channels?.maximum?.metrics?.comboTotalDamage})),jsdomErrors:report.jsdomErrors,consoleErrors:report.consoleErrors,blockedFetches:report.blockedFetches,failure:report.failure}));}
})().catch(error=>{console.error(error);process.exitCode=2;});
