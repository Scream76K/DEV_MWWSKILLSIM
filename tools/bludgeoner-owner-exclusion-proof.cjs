const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const mode=process.argv[2]||'after';
const html=require('./dom-test-setup.cjs').readSimulatorHtml();
const dom=new JSDOM(html,{url:'https://proof.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(weapon)}];DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};DB.weapons[0].skills=[];weaponIndexByKind['gunlance']=DB.weapons;weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='2';comboGLCharged.value='1';comboGLFireHz.value='20';App.combo.syncFromDOM();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let calls=[];const shell=w.GunlanceShellReference;
w.GunlanceShellReference={...shell,calculate(o,...rest){try{const r=shell.calculate(o,...rest);calls.push({input:JSON.parse(JSON.stringify(o)),result:JSON.parse(JSON.stringify(r))});return r;}catch(e){calls.push({input:JSON.parse(JSON.stringify(o)),error:String(e)});throw e;}}};
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));


const cases=[];
function run(label,moves,on,extra=[]){calls=[];w.eval(`App.state.combo.moves=${JSON.stringify(moves.map(techniqueId=>({techniqueId})))};restoreComboRows();build.charmCustom={skills:[{name:'Attack Boost',level:5},...${JSON.stringify(extra)},...(${on}?[{name:'鈍器使い',level:3}]:[])],slots:[0,0,0],weaponSlots:[]};calcBuild();`);const r={label,...take(),calls:JSON.parse(JSON.stringify(calls))};cases.push(r);return r;}
const moves=['GL_SLAM','reference:gl_NORMAL','reference:gl_CHARGED'];
const off=run('off',moves,false),on=run('on',moves,true);
assert.equal(w.MHWWeaponMaxSharpness.fromMHDB(weapon,0).color,'green');
assert.ok(JSON.stringify(on.snapshot).includes('鈍器使い'));
if(mode==='before')assert.notDeepEqual(on.result.channels.normal.metrics,off.result.channels.normal.metrics);
let comparison,negative;
if(mode!=='before'){
 for(const ch of ['normal','maximum']){assert.equal(on.result.channels[ch].metrics.comboTotalDamage.status,'available');assert.deepEqual(on.result.channels[ch].metrics,off.result.channels[ch].metrics);assert.deepEqual(on.result.channels[ch].components,off.result.channels[ch].components);assert.equal(on.result.channels[ch].diagnostics.excludedCalculationSkills[0].skillId,85);}
 assert.deepEqual(on.calls,off.calls);
 assert.ok(w.document.body.textContent.includes('ユーザー指定により今回の火力計算対象外'));
 for(const r of [off,on]){w.applyBuildSnapshot(r.snapshot);w.calcBuild();w.eval(`buildName.value=${JSON.stringify(r.label)};saveNamedBuild();`);}
 w.applyBuildSnapshot(on.snapshot);w.calcBuild();const current=take(),storage=JSON.stringify(w.localStorage);
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");comparison=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(comparison.length,2);for(const r of comparison)assert.deepEqual(r.result.channels.normal.metrics,off.result.channels.normal.metrics);assert.deepEqual(take(),current);assert.equal(JSON.stringify(w.localStorage),storage);
 const mindOff=run('mind-without85',moves,false,[{name:'心眼',level:3}]),mindOn=run('mind-with85',moves,true,[{name:'心眼',level:3}]);for(const ch of ['normal','maximum'])assert.deepEqual(mindOn.result.channels[ch].metrics,mindOff.result.channels[ch].metrics);
 negative=run('corn-FB-with85',['reference:gl_FULL_BURST'],true,[{name:'焼き砲モロコシ',level:1}]);assert.equal(negative.result.channels.normal.metrics.comboTotalDamage.status,'available');assert.equal(negative.result.channels.maximum.metrics.comboTotalDamage.status,'unavailable');assert.ok(JSON.stringify(negative.result).includes('CORNPOPPER_ACTION_NOT_ADOPTED'));
}
console.log(JSON.stringify({mode,cases,comparison,negative,scope:'Public calcBuild JSDOM; synthetic charm, real Hope315 maximum green, Attack5 flat; GL_SLAM/NORMAL/CHARGED; two saved builds. No Safari/live-game/full regression.',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
