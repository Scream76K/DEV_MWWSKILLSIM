const assert = require('node:assert/strict');
const {JSDOM, VirtualConsole} = require('jsdom');
const {readSimulatorHtml} = require('../tools/dom-test-setup.cjs');
const {profiles} = require('./fixtures/selected-hp-inputs.json');
const {data} = require('./fixtures/offset-maximum-inputs.json');
for (const [kind,id] of [
  ['switch-axe','SA_SWORD_VERTICAL'],
  ['insect-glaive','IG_ENHANCED_DOUBLE_SLASH'],
  ['insect-glaive','IG_ENHANCED_DIAGONAL_SLASH']
]) require('node:test')(id+' saved openings are isolated from the editor',()=>{
  const w = new JSDOM(readSimulatorHtml(), {url:'https://replay.invalid',runScripts:'dangerously',
    virtualConsole:new VirtualConsole(),beforeParse(w) {
      w.confirm=()=>true; w.fetch=()=>Promise.reject(Error('offline'));
      w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
    }}).window;
  try {
    const el=id=>w.document.getElementById(id);
    w.source=data;
    w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters()');
    const snap=profiles.find(p=>p.kind===kind).input;
    w.applyBuildSnapshot({...snap,combo:{moves:[]}});
    el('comboMovePicker').value='canonical:'+id; el('addCombo').click();
    const sa=kind==='switch-axe';
    const controls=sa?['comboSAMode','comboSAAwakened']:['comboIGExtract','comboIGKinsect'];
    const cases=[['blank','',''],['explicit',sa?'SWORD':'TRIPLE_EXTRACT',sa?'0':'STOWED'],
      ['conflict',sa?'AXE':'NO_EXTRACT',sa?'0':'STOWED']];
    for(const [name,a,b] of cases) {
      for(const [i,v] of [a,b].entries()) {
        el(controls[i]).value=v; el(controls[i]).dispatchEvent(new w.Event('change',{bubbles:true}));
      }
      el('buildName').value=name; el('saveBuild').click();
    }
    const originals=w.savedBuildMap(),key=w.eval('BUILDS_KEY');
    const stateKey=sa?'switchAxeState':'insectGlaiveState';
    const fields=sa?['mode','awakened']:['extractState','kinsectState'];
    const editor=()=>w.eval('JSON.stringify([buildSnapshotComparable(buildSnapshot()),compareStep5Snapshot()])');
    const before=editor();
    const compare=map=>{
      const bytes=JSON.stringify(map);
      w.localStorage.setItem(key,bytes);w.renderSavedBuilds();
      for(const box of el('compareBuilds').querySelectorAll('input')) if(!box.checked)box.click();
      el('runCompare').click();
      const rows=w.eval('lastBuildComparisonRows');
      assert.equal(rows.length,Object.keys(map).length);
      assert.equal(editor(),before);assert.equal(w.localStorage.getItem(key),bytes);
      return Object.fromEntries(Array.from(rows,r=>[r.name,r]));
    };
    const {blank,explicit,conflict}=compare(originals);
    assert.deepEqual(blank.oneHitPipeline.channels,explicit.oneHitPipeline.channels);
    assert.deepEqual(blank.referenceCombo.stages,explicit.referenceCombo.stages);
    assert.equal(conflict.referenceCombo.damage,null);
    const saved=(state,row={techniqueId:'canonical:'+id})=>{
      const combo={...originals.blank.combo,moves:[row]};
      if(state===undefined)delete combo[stateKey];else combo[stateKey]=state;
      return {...originals.blank,combo};
    };
    for(const state of [undefined,{}, {[fields[0]]:'',[fields[1]]:null}, ...(sa?[{axeBoosted:true}]:[])]){
      const {probe}=compare({probe:saved(state)});
      assert.deepEqual(probe.oneHitPipeline.channels.normal.components,explicit.oneHitPipeline.channels.normal.components);
      assert.equal(probe.referenceCombo.damage,explicit.referenceCombo.damage);
    }
    for(const state of [null,false,[],0,'', {unknown:true},{[fields[0]]:' '},{[fields[1]]:0},
      {[fields[0]]:sa?'SWORD':'TRIPLE_EXTRACT'},...(sa?[{awakened:false},{axeBoosted:0}]:[{kinsectState:'DEPLOYED'}])]){
      const {probe}=compare({probe:saved(state)});
      assert.ok(!probe.oneHitPipeline.evaluationPlan?.automaticOpening?.length);
      assert.ok(!probe.referenceCombo.automaticOpening?.length);
    }
    for(const attrs of [{count:null},{repeat:'1'},{count:2},{canonicalTechniqueId:'WRONG'},{future:true}]){
      const {probe}=compare({probe:saved({}, {techniqueId:'canonical:'+id,...attrs})});
      assert.ok(!probe.oneHitPipeline.evaluationPlan?.automaticOpening?.length);
      assert.ok(!probe.referenceCombo.automaticOpening?.length);
    }
  } finally {w.close();}
});
