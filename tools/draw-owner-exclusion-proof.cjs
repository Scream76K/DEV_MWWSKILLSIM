const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');const f=JSON.parse(fs.readFileSync('docs/reports/r253-saed-loading/fixture.json'));
assert.equal(f.decoration.kind,'weapon');assert.ok(f.weapon.slots[0]>=f.decoration.slot);assert.equal(f.skill.id,109);assert.equal(f.decoration.skills[0].skill.id,109);assert.equal(f.decoration.skills[0].level,2);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(process.argv[2]==='before-fixed'?fs.readFileSync('/tmp/saed-mindseye-before/index.html','utf8').replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,(tag,a,src,b)=>/^(?:[a-z]+:)?\/\//i.test(src)?tag:`<script${a}${b}>${fs.readFileSync(src==='hope-hammer-browser-adapter.js'?'/tmp/saed-mindseye-before/'+src:src,'utf8').replace(/<\/script/gi,'<\\/script')}</script>`):readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.armor=[];DB.decorations=[${JSON.stringify(f.decoration)}];DB.skills=[${JSON.stringify(f.skill)}];weaponIndexByKind['charge-blade']=DB.weapons;weaponKind.value='charge-blade';weapon.innerHTML='<option value="103">CB103</option>';weapon.value='103';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:CB_SAED');comboCBShield.value='1';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='1';`);


w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};calcBuild();`);
const take=()=>JSON.parse(w.eval('JSON.stringify({result:calcState.realOneHit,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'));



const mode=process.argv[2]||'after',cases=[];
w.eval(`DB.weapons[0].skills=[(()=>{const skill=DB.skills.find(x=>x.id===72);return {...skill.ranks[4],skill};})()];`);
function run(label,on,flags=true,extra=[]){
 w.eval(`build.charmCustom.skills=[{name:'挑戦者',level:1},...${JSON.stringify(extra)},...(${on}?[{name:'抜刀術【力】',level:3},{name:'抜刀術【技】',level:1}]:[])];`);
 for(const prefix of ['Draw','Punishing'])for(const ch of ['Normal','Maximum'])w.document.getElementById('power'+prefix+'Hits'+ch).value=flags?JSON.stringify({CB_SAED:[true,true,true]}):'';
 w.calcBuild();const r={label,...take()};cases.push(r);return r;
}
const off=run('off',false),on=run('on-all-body-hits',true),missing=run('on-unspecified',true,false);
if(mode==='before'){assert.notDeepEqual(on.result.channels.normal.metrics,off.result.channels.normal.metrics);assert.ok(JSON.stringify(missing.result).includes('DRAW_HIT_STATE_REQUIRED'));}
let comparison,negative;
if(mode==='after'){
 for(const x of [on,missing])for(const ch of ['normal','maximum']){assert.equal(x.result.channels[ch].metrics.comboTotalDamage.status,'available');assert.deepEqual(x.result.channels[ch].metrics,off.result.channels[ch].metrics);assert.deepEqual(x.result.channels[ch].components,off.result.channels[ch].components);assert.deepEqual(x.result.channels[ch].diagnostics.excludedCalculationSkills.map(x=>x.skillId).sort((a,b)=>a-b),[8,103]);}
 assert.notEqual(off.result.channels.normal.metrics.comboTotalDamage.value,off.result.channels.maximum.metrics.comboTotalDamage.value);
 for(const r of [off,on]){w.applyBuildSnapshot(r.snapshot);w.calcBuild();w.eval(`buildName.value=${JSON.stringify(r.label)};saveNamedBuild();`);}
 w.applyBuildSnapshot(on.snapshot);w.calcBuild();const current=take(),storage=JSON.stringify(w.localStorage);assert.deepEqual(current.result.channels,on.result.channels);
 assert.ok(JSON.stringify(current.snapshot).includes('抜刀術【力】'));assert.ok(JSON.stringify(current.snapshot).includes('抜刀術【技】'));
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");comparison=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,result:x.oneHitPipeline})))'));assert.equal(comparison.length,2);for(const r of comparison)assert.deepEqual(r.result.channels.normal.metrics,off.result.channels.normal.metrics);assert.deepEqual(take(),current);assert.equal(JSON.stringify(w.localStorage),storage);
 assert.ok(w.document.body.textContent.includes('ユーザー指定により今回の火力計算対象外'));
 negative=run('rapid-missing-origin',true,false,[{name:'高速変形',level:3}]);assert.ok(JSON.stringify(negative.result).includes('CB_RAPID_MORPH_ORIGIN_UNRESOLVED'));
 for(const entry of [{skillId:8,name:'抜刀術【技】',level:1},{skillId:103,name:'抜刀術【技】',level:4},{skillId:999,name:'抜刀術【力】',level:1}])assert.equal(w.MHIsOwnerExcludedCalculationSkill(entry),false);
}
console.log(JSON.stringify({mode,cases,comparison,negative,scope:'JSDOM public calcBuild CB103 synthetic charm, SAED three body Hit selections, Agitator channel difference; two saved builds; predicate malformed inputs are static-policy checks, not public rejection proof.',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',__filename].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
