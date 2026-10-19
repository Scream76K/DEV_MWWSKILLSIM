(function(){
  'use strict';
  const KEY='mhwilds-comparison-session-v1';
  let ready=false,restoring=false,timer=null,comparisonRequested=false,restoreFailed=false;
  function save(){
    if(!ready||restoring||restoreFailed||dataLoadBusy||!DB.weapons.length||!selectedWeapon())return;
    try{localStorage.setItem(KEY,JSON.stringify({schemaVersion:1,currentBuild:buildSnapshot(),conditions:compareStep5Snapshot(),target:{monster:$('monster').value,part:$('monsterPart').value,state:selectedKingChainState()},selectedNames:compareSelectedNames(),baselineIndex:lastBuildComparisonBaselineIndex,comparisonRequested:comparisonRequested&&compareSelectedNames().length>0}));}
    catch(e){dataCacheStatus('比較条件を端末に保存できませんでした。保存ビルドは保持されています。');}
  }
  function validateBuild(x,{current=false}={}){
    if(!x||!DB.weapons.some(w=>String(w.id)===String(x.weaponId)))throw Error('SESSION_WEAPON_MISSING');
    if((current&&!x.armor)||Object.keys(x.armor||{}).some(k=>!['head','chest','arms','waist','legs'].includes(k)))throw Error('SESSION_ARMOR_INVALID');
    if((current&&!x.combo)||(x.combo&&(!Array.isArray(x.combo.moves)||x.combo.moves.some(m=>typeof m.techniqueId!=='string'))))throw Error('SESSION_COMBO_INVALID');
    for(const id of Object.values(x.armor||{}))if(id&&!DB.armor.some(a=>String(a.id)===String(id)))throw Error('SESSION_ARMOR_MISSING');
    if(x.artia)MHSeriesGroupIdentity.convertSavedArtia(DB,x.artia);
  }
  function validate(s){
    if(s?.schemaVersion!==1||!s.conditions||!s.target||!Array.isArray(s.selectedNames)||s.selectedNames.length>3||typeof s.comparisonRequested!=='boolean'||!Number.isInteger(s.baselineIndex)||s.baselineIndex<0||s.baselineIndex>=Math.max(1,s.selectedNames.length))throw Error('SESSION_SCHEMA_INVALID');
    if(!['released','releasedOff'].includes(s.target.state))throw Error('SESSION_TARGET_STATE');
    const monster=selectableMonsters().find(m=>String(m.id)===s.target.monster);
    if(s.target.monster&&!monster||s.target.part&&!monster?.parts?.some(p=>String(p.id)===s.target.part))throw Error('SESSION_TARGET_MISSING');
    const map=savedBuildMap();for(const name of s.selectedNames){if(!Object.hasOwn(map,name))throw Error('SESSION_BUILD_MISSING');validateBuild(map[name]);if(s.comparisonRequested&&!map[name].weaponKind)throw Error('SESSION_KIND_MISSING');}
    validateBuild(s.currentBuild,{current:true});
    if(s.comparisonRequested&&new Set(s.selectedNames.map(n=>map[n].weaponKind)).size!==1)throw Error('SESSION_KIND_MISMATCH');
    // Unknown select values must never silently become an empty/default condition.
    const c=s.conditions;
    resolveCriticalBoostInput(c.cb,{});
    function shape(value,template){if(template&&typeof template==='object'){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join('|')!==Object.keys(template).sort().join('|'))throw Error('SESSION_CONDITION_SHAPE');for(const k of Object.keys(template))shape(value[k],template[k]);}else if(value!==null&&!['string','number','boolean'].includes(typeof value))throw Error('SESSION_CONDITION_VALUE');}
    const source=c.dragonHitzoneSource;
    if(!source||!['UNSET','MANUAL','MHDB_PART','TRAINING_REFERENCE','KING_REFERENCE'].includes(source.kind))throw Error('SESSION_DRAGON_SOURCE');
    const receipt=['MHDB_PART','TRAINING_REFERENCE','KING_REFERENCE'].includes(source.kind);
    const expectedKeys=receipt?['kind','monsterId','partId','state','dragonHz']:['kind'];
    if(Object.keys(source).sort().join('|')!==expectedKeys.sort().join('|'))throw Error('SESSION_DRAGON_SHAPE');
    if(receipt&&(source.monsterId!==s.target.monster||source.partId!==s.target.part||!Number.isFinite(source.dragonHz)||source.dragonHz<0||source.dragonHz>100||source.state!==(source.kind==='KING_REFERENCE'?s.target.state:null)))throw Error('SESSION_DRAGON_RECEIPT');
    shape({...c,dragonHitzoneSource:{kind:source.kind}},{...compareStep5Snapshot(),dragonHitzoneSource:{kind:source.kind}});
    for(const key of ['attack','aff','elem','mv','hz','ehz','sharp','esharp','cb','eCrit','dragonHz','uptime'])if(c[key]!==''&&!Number.isFinite(Number(c[key])))throw Error('SESSION_NUMBER_INVALID:'+key);
    const values={powerBowCoating:c.bowState?.coating,powerBowRange:c.bowState?.range,powerBowStartShot:c.bowState?.startShot,powerFortifyCount:c.fortifyCount,powerGutsState:c.gutsState,uptimeMode:c.uptimeMode};
    for(const [id,key]of [['powerHbgAmmoLevel','ammoLevel'],['powerHbgRange','range'],['powerHbgNormalMode','normalModeLevel'],['powerHbgCapacity','magazineCapacity'],['powerHbgShotOrdinal','shotOrdinal']])values[id]=c.hbgState?.[key];
    values.powerHbgFullMagazine=c.hbgState?.fullMagazine===true?'YES':c.hbgState?.fullMagazine===false?'NO':null;
    for(const [id,key]of [['comboGLType','shellingType'],['comboGLPower','shellingPower'],['comboGLLoaded','loadedRounds'],['comboGLCharged','chargedRounds'],['comboGLFireHz','fireHitzone']])values[id]=c.gunlanceState?.[key];
    values.comboLBGMode=c.lightBowgunState?.shotMode;values.comboHHEcho=c.huntingHornState?.echoState;values.comboHHMelody=c.huntingHornState?.melodyState;values.comboIGExtract=c.insectGlaiveState?.extractState;values.comboIGKinsect=c.insectGlaiveState?.kinsectState;
    values.comboCBPhialType=c.chargeBladeState?.phialType;
    for(const [id,key]of [['comboCBShield','shieldBoosted'],['comboCBAxe','axeBoosted'],['comboCBEnhancedPhial','enhancedPhial']]){const value=c.chargeBladeState?.[key];if(value!==null&&typeof value!=='boolean')throw Error('SESSION_CB_INVALID');values[id]=value===true?'1':value===false?'0':null;}
    for(const [id,value]of Object.entries(values))if(value!=null&&$(id).tagName!=='SELECT'&&!Number.isFinite(Number(value)))throw Error('SESSION_NUMBER_INVALID:'+id);
    for(const [id,value]of Object.entries(values))if(value!=null&&$(id).tagName==='SELECT'&&![...$(id).options].some(o=>o.value===String(value)))throw Error('SESSION_CONDITION_INVALID:'+id);
  }
  async function restore(){
    const raw=localStorage.getItem(KEY);if(!raw)return;
    const s=JSON.parse(raw);if(s?.conditions){if(s.conditions.cb==null)s.conditions.cb='';else if(typeof s.conditions.cb==='number')s.conditions.cb=String(s.conditions.cb);}validate(s);const before={build:buildSnapshot(),conditions:compareStep5Snapshot(),monster:$('monster').value,part:$('monsterPart').value,state:selectedKingChainState()};restoring=true;
    const model=JSON.parse(JSON.stringify(build)),combo=JSON.parse(JSON.stringify(App.state.combo)),kind=$('weaponKind').value;
    try{
      applyBuildSnapshot(s.currentBuild,{restoreExact:true});
      $('monster').value=s.target.monster;renderMonsterParts();$('monsterPart').value=s.target.part;if($('monsterState'))$('monsterState').value=s.target.state;renderMonsterInfo();calcBuild();
      // Older sessions stored a blank dragon field even when the selected part
      // had a known value. Normalize only that old unset state to the DB receipt.
      if(s.conditions.dragonHz===''&&s.conditions.dragonHitzoneSource?.kind==='UNSET'){
        const receipt=dragonTargetReceipt();if(receipt){s.conditions.dragonHz=String(receipt.dragonHz);s.conditions.dragonHitzoneSource=receipt;}
      }
      restoreStep5Snapshot(s.conditions);
      if(JSON.stringify(compareStep5Snapshot())!==JSON.stringify(s.conditions)||!buildSnapshotMatches(s.currentBuild,buildSnapshot()))throw Error('SESSION_RESTORE_MISMATCH');
      renderSavedBuilds();document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=s.selectedNames.includes(x.dataset.compareName));
      comparisonRequested=s.comparisonRequested;if(s.comparisonRequested){runBuildCompare();if(!lastBuildComparisonRows||lastBuildComparisonRows.length!==s.selectedNames.length)throw Error('SESSION_COMPARISON_FAILED');lastBuildComparisonBaselineIndex=s.baselineIndex;renderCachedBuildComparison();}
      if(document.querySelector('.comboRow'))calcDps();
    }catch(e){restoreFailed=true;comparisonRequested=false;if(before.build.weaponId)applyBuildSnapshot(before.build,{restoreExact:true});else{Object.assign(build,model);App.build.setWeapon(model.weapon);App.state.combo=combo;$('weaponKind').value=kind;refreshWeaponListForCurrentKind();renderAll();restoreComboRows();}$('monster').value=before.monster;renderMonsterParts();$('monsterPart').value=before.part;if($('monsterState'))$('monsterState').value=before.state;renderMonsterInfo();restoreStep5Snapshot(before.conditions);lastBuildComparisonRows=null;lastBuildComparisonContext=null;renderSavedBuilds();$('compareOut').textContent='比較条件を復元できませんでした。保存済みビルドを選び直してください。';throw e;}finally{restoring=false;}
  }
  for(const event of ['click','input','change'])document.addEventListener(event,e=>{if(!ready){e.preventDefault();e.stopImmediatePropagation();}},true);
  for(const event of ['input','change','click'])document.addEventListener(event,e=>{if(e.target.closest?.('#runCompare')&&lastBuildComparisonRows)comparisonRequested=true;if(!ready||restoring)return;clearTimeout(timer);timer=setTimeout(save,0);});
  window.addEventListener('pagehide',save);
  const load=$('load');if(load)load.disabled=true;
  window.simulatorReady=(async()=>{
    // DOM-only fixtures have no browser cache and retain their synchronous setup.
    if(!window.indexedDB){ready=true;if(load)load.disabled=false;return false;}
    try{const loaded=await loadDataCache();if(loaded)await restore();return loaded;}
    catch(e){restoreFailed=true;dataCacheStatus('比較条件を復元できませんでした。保存ビルドは保持されています。');return false;}
    finally{ready=true;if(load)load.disabled=false;}
  })();
})();
