/* Input-only editable session. Named saves and calculation results are never written here. */
(function(){
'use strict';
const KEY='mhwilds-comparison-session-v2',LEGACY_KEY='mhwilds-comparison-session-v1';
let initialized=false,attempted=false,restoring=false,blocked=false,timer=null;
const copy=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>backupEqual(a,b);
const check=(ok,reason)=>{if(!ok)throw Error('SESSION_'+reason);};
function notice(reason){stat('前回の編集・比較条件を復元できませんでした。保存済み装備と元の記録は保持しています。'+esc(reason),'warn');}
function target(){return {monster:$('monster').value,part:$('monsterPart').value,state:selectedKingChainState()};}
function restoreConditions(c){
  restoreStep5Snapshot(c);
  for(const [id,key]of [['powerDrawAttack','drawAttack'],['powerMounted','mounted']])if($(id))$(id).checked=c[key]===true;
  if($('powerEverlastingStage'))$('powerEverlastingStage').value=c.everlastingStage??'';
}
function validateBuild(b,{current=false}={}){
  check(b&&typeof b==='object'&&!Array.isArray(b),'BUILD');
  const weapon=DB.weapons.find(w=>String(w.id)===String(b.weaponId));check(weapon,'WEAPON_MISSING');
  if(b.weaponKind)check(canonicalWeaponKind(weapon)===b.weaponKind,'WEAPON_KIND');
  check(!current||b.armor&&b.combo,'BUILD_SHAPE');
  check(!Object.keys(b.armor||{}).some(k=>!['head','chest','arms','waist','legs'].includes(k)),'ARMOR_SHAPE');
  for(const id of Object.values(b.armor||{}))check(!id||DB.armor.some(a=>String(a.id)===String(id)),'ARMOR_MISSING');
  if(b.combo){check(Array.isArray(b.combo.moves)&&b.combo.moves.length<=1000,'COMBO');let count=0;for(const m of b.combo.moves){check(m&&typeof m.techniqueId==='string'&&(!('repeat'in m)||Number.isInteger(m.repeat)&&m.repeat>0&&m.repeat<=1000),'COMBO_MOVE');count+=m.repeat??1;}check(count<=1000,'COMBO_LIMIT');}
  for(const key of ['armor','decos','artia','charmCustom'])check(b[key]==null||typeof b[key]==='object'&&!Array.isArray(b[key]),'BUILD_CONTAINER:'+key);
  // Named-load compatibility includes numeric-string levels. Preserve those bytes; current calculation owns skill validity.
  if(b.charmCustom?.skills!=null)check(Array.isArray(b.charmCustom.skills)&&b.charmCustom.skills.length<=100&&b.charmCustom.skills.every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.name==='string'),'CHARM_SHAPE');
}
function validate(s,legacy){
  check(s&&s.schemaVersion===(legacy?1:2)&&s.conditions&&s.target,'SCHEMA');backupSafeTree(s);
  check(Array.isArray(s.selectedNames)&&s.selectedNames.length<=1000&&s.selectedNames.every(n=>typeof n==='string')&&new Set(s.selectedNames).size===s.selectedNames.length,'NAMES');
  check(typeof s.comparisonRequested==='boolean'&&Number.isInteger(s.baselineIndex)&&s.baselineIndex>=0&&s.baselineIndex<Math.max(1,s.selectedNames.length),'BASELINE');
  check(typeof s.target.monster==='string'&&typeof s.target.part==='string'&&['released','releasedOff'].includes(s.target.state),'TARGET');
  const m=selectableMonsters().find(m=>String(m.id)===s.target.monster);check(!s.target.monster||m,'TARGET_MISSING');check(!s.target.part||m?.parts?.some(p=>String(p.id)===s.target.part),'TARGET_PART_MISSING');
  validateBuild(s.currentBuild,{current:true});
  const map=savedBuildMap();for(const n of s.selectedNames){check(Object.hasOwn(map,n),'SAVED_BUILD_MISSING');validateBuild(map[n]);}
  if(s.comparisonRequested)check(s.selectedNames.length>0&&s.selectedNames.length<=3&&s.selectedNames.every(n=>map[n].weaponKind)&&new Set(s.selectedNames.map(n=>map[n].weaponKind)).size===1,'COMPARISON_KINDS');
  const c=s.conditions;for(const k of ['attack','aff','elem','mv','hz','ehz','sharp','esharp','cb','eCrit','dragonHz','uptime'])check(c[k]===''||c[k]==null&&legacy||['string','number'].includes(typeof c[k])&&Number.isFinite(Number(c[k])),'NUMBER:'+k);
  const source=c.dragonHitzoneSource;check(source&&['UNSET','MANUAL','MHDB_PART','TRAINING_REFERENCE','KING_REFERENCE'].includes(source.kind),'DRAGON_SOURCE');
  const receipt=['MHDB_PART','TRAINING_REFERENCE','KING_REFERENCE'].includes(source.kind),keys=receipt?['kind','monsterId','partId','state','dragonHz']:['kind'];
  check(equal(Object.keys(source).sort(),keys.sort()),'DRAGON_SHAPE');
  if(receipt)check(source.monsterId===s.target.monster&&source.partId===s.target.part&&Number.isFinite(source.dragonHz)&&source.dragonHz>=0&&source.dragonHz<=100&&source.state===(source.kind==='KING_REFERENCE'?s.target.state:null),'DRAGON_RECEIPT');
}
// Only legacy absent fields inherit today's unselected control state. Explicit legacy values are retained and roundtrip-checked.
function fillAbsent(value,defaults){
  if(!defaults||typeof defaults!=='object'||Array.isArray(defaults))return value===undefined?copy(defaults):value;
  if(value===null)return value;
  const result=value===undefined?{}:copy(value);check(result&&typeof result==='object'&&!Array.isArray(result),'LEGACY_SHAPE');
  for(const k of Object.keys(defaults))result[k]=fillAbsent(result[k],defaults[k]);return result;
}
function restore(s,legacy){
  validate(s,legacy);
  const before={model:copy(build),calc:copy(calcState),combo:copy(App.state.combo),controls:captureDataControls(),kind:$('weaponKind').value,rows:lastBuildComparisonRows,context:lastBuildComparisonContext,baseline:lastBuildComparisonBaselineIndex,output:$('compareOut').innerHTML};
  const defaults=compareStep5Snapshot();restoring=true;
  try{
    if(legacy){s.conditions=fillAbsent(s.conditions,defaults);s.conditions.cb=s.conditions.cb==null?'':String(s.conditions.cb);if(!s.currentBuild.target)s.currentBuild.target={monsterId:s.target.monster,partId:s.target.part};}
    applyBuildSnapshot(s.currentBuild,{restoreExact:!legacy});
    $('monster').value=s.target.monster;renderMonsterParts();$('monsterPart').value=s.target.part;if($('monsterState'))$('monsterState').value=s.target.state;renderMonsterInfo();
    restoreConditions(s.conditions);
    check(equal(compareStep5Snapshot(),s.conditions),'CONDITION_ROUNDTRIP');
    if(!legacy)check(buildSnapshotMatches(s.currentBuild,buildSnapshot()),'BUILD_ROUNDTRIP');
    calcBuild();restoreConditions(s.conditions);
    renderSavedBuilds();document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(e=>{e.checked=s.selectedNames.includes(e.dataset.compareName);});
    if(s.comparisonRequested){runBuildCompare();check(lastBuildComparisonRows?.length===s.selectedNames.length,'COMPARISON');lastBuildComparisonBaselineIndex=s.baselineIndex;renderCachedBuildComparison();}
    // runBuildCompare already recalculates/restores the current build. A further calcBuild would invalidate its new table.
    check(equal(compareStep5Snapshot(),s.conditions),'FINAL_CONDITIONS');
    if(!legacy)check(buildSnapshotMatches(s.currentBuild,buildSnapshot()),'FINAL_BUILD');
    return true;
  }catch(error){
    build=copy(before.model);calcState=copy(before.calc);App.state.build=build;App.state.calc=calcState;App.state.combo=copy(before.combo);
    $('weaponKind').value=before.kind;refreshWeaponListForCurrentKind();renderAll();restoreDataControls(before.controls,{restoreOptions:true});App.state.combo=copy(before.combo);restoreComboRows();
    build=before.model;App.state.build=build;App.state.combo=before.combo;calcState=before.calc;App.state.calc=calcState;lastBuildComparisonRows=before.rows;lastBuildComparisonContext=before.context;lastBuildComparisonBaselineIndex=before.baseline;$('compareOut').innerHTML=before.output;
    throw error;
  }finally{restoring=false;}
}
function initialize(){
  if(attempted||restoring||dataLoadBusy||!DB.weapons.length)return false;
  attempted=true;
  try{
    let raw=localStorage.getItem(KEY),legacy=false;if(raw===null){raw=localStorage.getItem(LEGACY_KEY);legacy=raw!==null;}
    if(raw===null)return true;
    check(raw.length<=2000000,'SIZE');restore(JSON.parse(raw),legacy);return true;
  }catch(error){blocked=true;notice(String(error?.message||error));return false;}
}
function save(){
  if(!initialized||restoring||blocked||dataLoadBusy||!DB.weapons.length||!selectedWeapon())return;
  if(!attempted&&!initialize())return;
  try{
    const names=compareSelectedNames(),rows=lastBuildComparisonRows;
    const requested=!!rows&&equal(rows.map(r=>r.name),names);
    const session={schemaVersion:2,currentBuild:buildSnapshot(),conditions:compareStep5Snapshot(),target:target(),selectedNames:names,baselineIndex:requested?lastBuildComparisonBaselineIndex:0,comparisonRequested:requested};
    const raw=JSON.stringify(session);check(raw.length<=2000000,'SIZE');localStorage.setItem(KEY,raw);
  }catch(error){notice('編集条件を端末へ保存できません：'+String(error?.message||error));}
}
for(const event of ['input','change','click'])document.addEventListener(event,()=>{if(!initialized||restoring||blocked)return;clearTimeout(timer);timer=setTimeout(save,0);});
window.addEventListener('pagehide',()=>{clearTimeout(timer);save();});
window.addEventListener('mhwilds-data-ready',()=>{if(initialized&&!restoring)initialize();});
window.__comparisonSessionReady=Promise.resolve(window.__localDBReady).then(loaded=>{initialized=true;return DB.weapons.length?initialize():loaded;}).catch(error=>{initialized=true;blocked=true;notice(String(error?.message||error));return false;});
})();
