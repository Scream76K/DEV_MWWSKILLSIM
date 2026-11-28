const assert=require('node:assert/strict'), path=require('node:path'), fs=require('node:fs'), crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'), cache='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
assert.equal(sha(cache),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
const pack=require(path.join(root,cache)), readHtml=require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml;
const test=require('node:test');
for (const id of ['KOTATU_BOW_01','SALADA_BOW_05']) for(const mixed of [false,true]) test(id+' '+(mixed?'mixed':'single'),()=>{
 const vc=new VirtualConsole(), errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readHtml(),{url:'https://thousand-alone.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try {
 const $=id=>w.document.getElementById(id), choose=(el,val)=>{el.value=val;assert.equal(el.value,val,el.id);el.dispatchEvent(new w.Event('change',{bubbles:true}));}, read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__archivedDB=w.JSON.parse(JSON.stringify(pack.data));
 w.eval('DB=normalizeDB(window.__archivedDB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();');
 choose($('buildTemplateWeaponKind'),'bow');choose($('buildTemplateSelect'),id);$('loadBuildTemplate').click();
 choose($('monster'),'training-room'); choose($('monsterPart'),'training-front');
 const status=$('buildTemplateStatus').textContent;
 for(const row of [...$('combo').children]){const b=row.querySelector('button[title="削除"]')||[...row.querySelectorAll('button')].find(x=>x.textContent.includes('削除')); if(b)b.click();}
 if($('combo').querySelectorAll('.cmove').length)w.eval('App.state.combo.moves=[];restoreComboRows();');
 const picker=$('comboMovePicker'), option=[...picker.options].find(x=>x.value==='canonical:BOW_THOUSAND_DRAGONS');
 assert.ok(option?.textContent.includes('竜の千々矢'));
 const ids=[...(mixed?['BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3']:[]),'BOW_THOUSAND_DRAGONS'];
 for(const tech of ids){choose(picker,'canonical:'+tech);$('addCombo').click();}
 assert.deepEqual(read('App.state.combo.moves').map(x=>x.techniqueId),ids.map(x=>'canonical:'+x));
 choose($('powerBowCoating'),'');choose($('powerBowRange'),'');choose($('powerBowStartShot'),'');
 const positions=read('({weapon:selectedWeapon().name,kind:selectedWeapon().kind,element:calcState.stats.element,elementType:calcState.stats.elementType,force:calcState.total["フォースショット"]||0,skills:calcState.total,moves:App.state.combo.moves.map(x=>x.techniqueId),state:{coating:powerBowCoating.value,range:powerBowRange.value}})');
 assert.equal(positions.kind,'bow');assert.equal(positions.state.coating,'');assert.equal(positions.state.range,'');
 assert.match(status,/読み込み/);assert.equal(positions.element,372);assert.equal(positions.elementType,'dragon');assert.equal(positions.force,1);
 const before=read('compareStep5Snapshot()');
 $('calcUserComboDamage').click();
 const ui=$('compareOut'); assert.equal(ui.dataset.resultMode,'current-custom');
 const p=w.calcP0Damage('user').pipeline;
 assert.ok(p.channels, JSON.stringify(p));
 assert.deepEqual(read('compareStep5Snapshot()'),before);
 assert.match(ui.querySelector('[data-automatic-opening]').textContent,/ビンなし/);
 const cells=key=>Array.from(ui.querySelectorAll('[data-custom-damage="'+key+'"] td'),n=>n.textContent).slice(0,2);
 assert.deepEqual(cells('element'),mixed?['145.1','160.7']:['33.5','37.1']);
 const totals=id==='KOTATU_BOW_01'?(mixed?['982.0','1228.7']:['451.9','571.1']):(mixed?['981.9','1220.7']:['441.7','554.2']);
 assert.deepEqual(cells('total'),totals);
 const used=ui.querySelector('[data-used-combo]').textContent;
 assert.match(used,mixed?/通常：剛射3 → 剛連射3 → 竜の千々矢.*最大：剛射3 → 剛連射3 → 竜の千々矢/:/通常：竜の千々矢.*最大：竜の千々矢/);
 const expected = id==='KOTATU_BOW_01'
  ? {normal:[271.75,45,372],maximum:[307.75,85,412]}
  : {normal:[259.35,52,372],maximum:[296.35,87,412]};
 const nearly=(value,expect)=>assert.ok(Math.abs(value-expect)<1e-8,'expected '+expect+' but got '+value);
 for(const c of ['normal','maximum']){
   const lane=p.channels[c];
   assert.ok(Number.isFinite(lane.metrics.comboTotalDamage?.value),JSON.stringify({reason:p.reason,execution:lane.execution,issues:lane.issues}));
   assert.deepEqual(Array.from(lane.components,x=>x.techniqueId),ids);
   const thousand=lane.components.at(-1);
   assert.equal(thousand.details.trace.length,6);
   const [atk,aff,el]=expected[c],critical=1+aff/100*.37;
   nearly(thousand.value,6*(atk*.25*.8*critical*1.1+el/10*.3*.5));
   assert.ok(thousand.details.trace.every(h=>h.attack===atk&&h.affinity===aff&&Math.abs(h.element-el/10*.3*.5)<1e-8));
   assert.deepEqual(Array.from(lane.diagnostics.ignoredSkillEffects||[]),[]);
   if(mixed){
    const spread=id==='SALADA_BOW_05'?1.05:1;
    const [power,volley]=lane.components;
    assert.equal(power.details.trace.length,5);
    assert.equal(volley.details.trace.length,6);
    for(const comp of [power,volley]){
      assert.ok(comp.details.trace.every(h=>h.forceShotOrdinal===null&&h.forceAttackAdd===0&&h.forceAffinityAdd===0&&h.shotSkillPhysicalModifier===spread));
    }
   }
   nearly(lane.metrics.comboTotalDamage.value,lane.components.reduce((sum,x)=>sum+x.value,0));
 }
 if(!mixed){
   $('calcSelectedTechniqueDamage').click();
   const single=w.calcP0Damage('single').pipeline;
   for(const c of ['normal','maximum'])nearly(single.channels[c].metrics.comboTotalDamage.value,p.channels[c].metrics.comboTotalDamage.value);
 }
 choose($('powerBowCoating'),'PIERCE');
 const coated=w.calcP0Damage('user').pipeline;
 assert.match(String(coated.reason),/^BOW_THOUSAND:(?:STATE_NOT_ADOPTED|UNVERIFIED_MIXED_RESOURCE)$/);
 assert.equal($('powerBowCoating').value,'PIERCE');
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
