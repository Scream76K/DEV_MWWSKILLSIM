const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
test('approved ① ② ④ ⑤ controls remain compact without losing the usable inputs',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://consumer-form.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const doc=w.document,id=x=>doc.getElementById(x);
 for(const name of ['clearDataCache','restorePreviousData'])assert.equal(id(name),null);
 assert.ok(id('load'));
 assert.equal(w.eval("typeof clearDataCache+' '+typeof restorePreviousData"),'function function');
 assert.equal(id('buildLoadCard').querySelector('summary').textContent,'② ビルド読込');
 assert.ok([...doc.querySelectorAll('summary')].some(x=>x.textContent==='⑤ ビルド保存'));
 assert.ok(id('useWeaponCoeff'));assert.ok(id('skillOutput'));assert.ok(id('buildName'));
 assert.ok(id('weaponCoeffState').hidden);
 assert.ok(id('weaponCoeffState').nextElementSibling.hidden);
 assert.ok(id('buildDetail').closest('[hidden]'));
 const hpToggle=id('powerHeroicsToggle');
 assert.ok(id('powerSelectedHp').closest('[hidden]'));
 assert.ok(hpToggle&&!hpToggle.closest('[hidden]'));
 assert.equal(hpToggle.checked,false);
 assert.equal(id('powerSelectedHp').value,'FULL_HP');
 assert.match(id('savedBuilds').textContent,/保存したビルドはありません/);

 const key=w.eval('BUILDS_KEY'), original={B2:{weaponId:'234'},B10:{weaponId:'236'},'<unsafe>':{weaponId:'248'}};
 w.localStorage.setItem(key,JSON.stringify(original));w.renderSavedBuilds();
 const choose=name=>{const picker=id('savedBuildSelect');picker.value=name;picker.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const button=()=>id('savedBuildLoad'),del=()=>id('savedBuildDelete'),current=()=>JSON.parse(w.localStorage.getItem(key));
 assert.equal(id('savedBuilds').querySelectorAll('.saved-build-picker').length,1);
 assert.deepEqual([...id('savedBuildSelect').options].map(o=>o.value).sort(),['','<unsafe>','B10','B2']);
 assert.ok(button().disabled&&del().disabled);
 assert.equal(id('savedBuildSelect').querySelector('unsafe'),null);
 choose('B2');assert.ok(!button().disabled&&!del().disabled);
 w.renderSavedBuilds();assert.equal(id('savedBuildSelect').value,'B2');
 const compare=id('compareBuilds').querySelector('[data-compare-name="B10"]');compare.checked=true;
 w.confirm=()=>false;w.applyBuildSnapshot=()=>assert.fail('cancelled load');button().click();del().click();assert.deepEqual(current(),original);
 let loaded;w.applyBuildSnapshot=value=>{loaded=value;w.renderSavedBuilds()};w.confirm=()=>true;
 button().click();assert.deepEqual(JSON.parse(JSON.stringify(loaded)),original.B2);
 assert.equal(id('savedBuildSelect').value,'B2');assert.deepEqual(current(),original);
 assert.ok(id('compareBuilds').querySelector('[data-compare-name="B10"]').checked);
 del().click();assert.deepEqual(current(),{B10:original.B10,'<unsafe>':original['<unsafe>']});
 assert.equal(id('savedBuildSelect').value,'');assert.ok(button().disabled&&del().disabled);
 assert.ok(id('compareBuilds').querySelector('[data-compare-name="B10"]').checked);
});

test('heroics checkbox restores its displayed state without changing the shared HP snapshot format',t=>{
 const errors=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://hp-form.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const doc=w.document,hp=doc.getElementById('powerSelectedHp'),check=doc.getElementById('powerHeroicsToggle');
 const {data}=require('../tests/fixtures/offset-maximum-inputs.json');
 const {profiles}=require('../tests/fixtures/selected-hp-inputs.json');
 w.__hpFixture=data;
 w.eval('DB=normalizeDB({...__hpFixture,weapons:consolidateArtiaFixedVariantRows(__hpFixture.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters()');
 w.applyBuildSnapshot({...profiles.find(x=>x.kind==='great-sword').input,selectedHp:'FULL_HP'});
 assert.ok(doc.getElementById('skillWorkspaceRight').contains(check));
 assert.equal(w.buildSnapshot().selectedHp,'FULL_HP');
 check.click();
 const build=w.buildSnapshot(),conditions=w.compareStep5Snapshot();
 assert.equal(hp.value,'AT_OR_BELOW_30_PERCENT');assert.equal(build.selectedHp,hp.value);assert.equal(conditions.selectedHp,hp.value);
 check.click();
 assert.equal(w.buildSnapshot().selectedHp,'FULL_HP');assert.equal(w.compareStep5Snapshot().selectedHp,'FULL_HP');
 w.restoreStep5Snapshot(conditions);assert.equal(check.checked,true);assert.equal(hp.value,conditions.selectedHp);
 w.applyBuildSnapshot({...build,selectedHp:'UNSELECTED'});assert.equal(check.checked,false);assert.equal(hp.value,'FULL_HP');
 assert.deepEqual(errors,[]);
});

test('ordinary page startup resets only transient HP; named HP and comparison selection remain intact',async t=>{
 const globals=w=>{
  w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;
 };
 const fixture=require('../tests/fixtures/comparison-session-inputs.json').cases[0].inputSnapshots[0];
 const data=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
 async function page(storage={}){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(readSimulatorHtml(),{url:'https://consumer-hp.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){globals(w);for(const [key,value] of Object.entries(storage))w.localStorage.setItem(key,value);}});
  t.after(()=>dom.window.close());
  const w=dom.window;await w.__comparisonSessionReady;
  w.fixtureDb=JSON.stringify(data);
  w.eval(`DB=normalizeDB(JSON.parse(fixtureDb));weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();dispatchEvent(new Event('mhwilds-data-ready'));`);
  assert.deepEqual(errors,[]);
  return w;
 }
 const KEY='mhwilds-comparison-session-v2',BUILDS='mh-wilds-builds-v625';
 const first=await page();
 first.applyBuildSnapshot({...fixture,selectedHp:'FULL_HP'});
 first.eval(`buildName.value='Full';saveNamedBuild();powerHeroicsToggle.checked=true;powerHeroicsToggle.dispatchEvent(new Event('change',{bubbles:true}));buildName.value='Low';saveNamedBuild();
 selectAllCompare.click();runBuildCompare();document.getElementById('comparisonBaseline').value='1';document.getElementById('comparisonBaseline').dispatchEvent(new Event('change',{bubbles:true}));dispatchEvent(new Event('pagehide'));`);
 const raw=first.localStorage.getItem(KEY),named=first.localStorage.getItem(BUILDS),saved=JSON.parse(raw);
 assert.equal(saved.currentBuild.selectedHp,'AT_OR_BELOW_30_PERCENT');
 assert.equal(saved.conditions.selectedHp,'AT_OR_BELOW_30_PERCENT');
 assert.equal(saved.comparisonRequested,true);
 assert.equal(saved.baselineIndex,1);
 const reopened=await page({[KEY]:raw,[BUILDS]:named});
 const get=(w,script)=>JSON.parse(w.eval('JSON.stringify('+script+')'));
 assert.equal(reopened.document.getElementById('powerHeroicsToggle').checked,false);
 assert.deepEqual(get(reopened,'buildSnapshotComparable(buildSnapshot())'),get(first,"buildSnapshotComparable({...buildSnapshot(),selectedHp:'FULL_HP'})"));
 assert.deepEqual(get(reopened,'compareStep5Snapshot()'),{...saved.conditions,selectedHp:'FULL_HP'});
 assert.deepEqual(get(reopened,'compareSelectedNames()'),saved.selectedNames);
 assert.equal(reopened.eval('lastBuildComparisonBaselineIndex'),1);
 assert.equal(reopened.createBuildComparisonReport().context.conditions.selectedHp,'FULL_HP');
 assert.equal(reopened.localStorage.getItem(BUILDS),named);
 for(const [name,hp] of [['Low','AT_OR_BELOW_30_PERCENT'],['Full','FULL_HP']]){
  const select=reopened.document.getElementById('savedBuildSelect');select.value=name;select.dispatchEvent(new reopened.Event('change',{bubbles:true}));reopened.document.getElementById('savedBuildLoad').click();
  assert.equal(reopened.compareStep5Snapshot().selectedHp,hp);
  assert.equal(reopened.document.getElementById('powerHeroicsToggle').checked,name==='Low');
  assert.equal(reopened.localStorage.getItem(BUILDS),named);
 }
});
