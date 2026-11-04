const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);



 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const select=w.document.getElementById('buildTemplateSelect');select.value='KOTATU_CB_01';select.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();
 const all=w.eval("DB.weapons.filter(x=>x.kind==='charge-blade').map(x=>({id:x.id,name:x.name,phial:x.phial}))");
 const impact=all.filter(x=>x.phial==='impact'),power=all.filter(x=>x.phial==='element');
 assert.ok(impact.length>=5&&power.length>=5,'actual MHDB must contain both CB phial categories');
 const picked=[...impact,...power];
 for(const entry of picked){
  w.__censusWeaponId=entry.id;
  w.eval("window.__censusWeapon=DB.weapons.find(x=>x.id===window.__censusWeaponId&&x.kind==='charge-blade');if(!window.__censusWeapon)throw Error('MHDB_CB_WEAPON_NOT_FOUND');App.build.setWeapon(window.__censusWeapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__censusWeapon.id+'>'+window.__censusWeapon.name+'</option>';weapon.value=String(window.__censusWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:window.__censusWeapon.phial==='element'?'POWER_ELEMENT':'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';if([145,146,147].includes(window.__censusWeapon.id))build.artia.restores=Array(5).fill('none');if([153,154].includes(window.__censusWeapon.id)){powerWetNormal.value='DRY';powerWetMaximum.value='DRY';}if([1073,1074].includes(window.__censusWeapon.id))build.armor={head:null,chest:null,arms:null,waist:null,legs:null};monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();");
  const r=read('calcState.realOneHit');
  const directElementNormal=entry.phial==='impact'?read("['R','H'].flatMap(route=>(calcState.realOneHit?.routes?.[route]?.channels?.normal?.components||[]).filter(x=>String(x.id||'').includes(':element:')).map(x=>x.value)).reduce((a,b)=>a+(Number(b)||0),0)"):null;
  const channels=Object.fromEntries(['normal','maximum'].map(ch=>{const c=r?.channels?.[ch];return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??r?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  const specials=read("window.__censusWeapon.specials.map(x=>({kind:x.kind,element:x.element??null,status:x.status??null,name:x.name??null,damage:x.damage?.display??null}))");
  w.eval("powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const off=read('calcState.realOneHit');
  const without152=Object.fromEntries(['normal','maximum'].map(ch=>{const c=off?.channels?.[ch];return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??off?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  const effective=read("({elementType:calcState.stats?.elementType??null,element:calcState.stats?.element??null,artiaElement:build.artia?.element??null})");
  out.cases.push({id:entry.id,name:entry.name,phial:entry.phial,channels,without152,specials,directElementNormal,effective});
 }
 out.counts={totalAvailableInDB:{impact:impact.length,power:power.length},tested:picked.length,byPhial:{},without152:{},artiaTestInput:'EXPLICIT_RESTORE_NONE_ONLY_FOR_MHDB_145_146_147',wetTestInput:'EXPLICIT_DRY_ONLY_FOR_MHDB_153_154',thunderCandidateInput:'EXPLICIT_NO_ARMOR_RESISTANCE_ZERO_FOR_MHDB_1073_1074_NOT_ADOPTED',bladescaleCandidate:'CB_FIRST_PHYSICAL_HIT_PER_INDEPENDENT_ROUTE_NOT_OWNER_APPROVED'};
 for(const type of ['impact','element']){
  const subset=out.cases.filter(c=>c.phial===type),details={total:subset.length,complete:0,blocked:0,reasons:{}};
  for(const c of subset){
   const statuses=['normal','maximum'].map(ch=>c.channels[ch].status);
   if(statuses.every(x=>x==='complete'))details.complete++;
   else {details.blocked++;const reason=Array.from(new Set(['normal','maximum'].map(ch=>c.channels[ch].reason))).join(' | ');const g=details.reasons[reason]??{count:0,examples:[]};g.count++;if(g.examples.length<3)g.examples.push({id:c.id,name:c.name});details.reasons[reason]=g;}
  }
  out.counts.byPhial[type]=details;
  out.counts.without152[type]={total:subset.length,complete:subset.filter(c=>['normal','maximum'].every(ch=>c.without152[ch].status==='complete')).length,blocked:subset.filter(c=>['normal','maximum'].some(ch=>c.without152[ch].status!=='complete')).length};
 }
 // Attribute Conversion 152 is OFF in normal on both passes; maximum differs
 // only by the explicit ON/OFF switch. Preserve channel isolation and the
 // unapproved scope gates instead of permitting non-dragon or special phials.
 out.counts.attributeConversion152={
  normalStable:0,
  maximumCompleteWithOn:{impact:0,element:0},
  maximumBlockedWithOn:{impact:0,element:0},
  maximumReasonCounts:{impact:{},element:{}}
 };
 for(const c of out.cases){
  const a=c.channels.normal,b=c.without152.normal;
  assert.deepEqual(a,b,'skill152 maximum switch must not change normal '+c.id);
  out.counts.attributeConversion152.normalStable++;
  if(c.channels.maximum.status==='complete')out.counts.attributeConversion152.maximumCompleteWithOn[c.phial]++;
  else{
   out.counts.attributeConversion152.maximumBlockedWithOn[c.phial]++;
   const key=c.channels.maximum.reason??'UNKNOWN';
   const counts=out.counts.attributeConversion152.maximumReasonCounts[c.phial];
   counts[key]=(counts[key]??0)+1;
  }
 }
 assert.equal(out.counts.attributeConversion152.normalStable,81,'all normal channels remain stable');
 assert.equal(out.counts.attributeConversion152.maximumCompleteWithOn.impact,61,'candidate all impact 152 maximum present with no non-dragon flat');
 assert.equal(out.counts.attributeConversion152.maximumBlockedWithOn.impact,0,'candidate non-dragon 152 no-flat should not be blocked');
 assert.equal(out.counts.attributeConversion152.maximumCompleteWithOn.element,20,'power H channels unchanged where 152 absent');
 assert.equal(out.counts.attributeConversion152.maximumBlockedWithOn.element,0);
 // This is a weapon-element classification, not a claim that every complete
 // non-dragon weapon has an equipped/active ID152 effect. Preserve that
 // distinction in public progress metrics.
 const impactOnComplete=out.cases.filter(c=>c.phial==='impact'&&c.channels.maximum.status==='complete');
 const impactOnBlocked=out.cases.filter(c=>c.phial==='impact'&&c.channels.maximum.status!=='complete');
 const isDragon=c=>c.specials.some(x=>x.kind==='element'&&x.element==='dragon');
 out.counts.attributeConversion152.impactOnCompleteByBaseElement={
   dragon:impactOnComplete.filter(isDragon).length,
   nonDragon:impactOnComplete.filter(c=>!isDragon(c)).length
 };
 assert.equal(out.counts.attributeConversion152.impactOnCompleteByBaseElement.dragon,9,'source MHDB dragon subset of complete 152-ON results');
 assert.equal(out.counts.attributeConversion152.impactOnCompleteByBaseElement.nonDragon,52,'all non-dragon impact complete without attribute-flat');
 assert.equal(impactOnBlocked.length,0);
 const nonDragonImpact=impactOnComplete.filter(c=>!isDragon(c));
 assert.equal(nonDragonImpact.length,52,'all non-dragon source weapons in candidate');
 const effectiveDragon=impactOnComplete.filter(c=>c.effective.elementType==='dragon');
 const effectiveNonDragon=impactOnComplete.filter(c=>c.effective.elementType!=='dragon');
 out.counts.attributeConversion152.impactOnCompleteByEffectiveElement={
  dragon:effectiveDragon.length,nonDragon:effectiveNonDragon.length
 };
 assert.equal(effectiveDragon.length,12,'real equipment effective dragon count must include three Artia records');
 assert.equal(effectiveNonDragon.length,49,'real equipment non-dragon count');
 const artiaAssigned=nonDragonImpact.filter(c=>c.effective.elementType==='dragon');
 const notArtia=nonDragonImpact.filter(c=>c.effective.elementType!=='dragon');
 assert.deepEqual(artiaAssigned.map(c=>c.id),[145,146,147],'exact Artia source records with effective dragon element');
 assert.equal(notArtia.length,49,'no special source records may slip through effective-element test');
 assert.ok(effectiveDragon.every(c=>Number.isFinite(c.effective.element)&&c.effective.element>0),'effective dragon display element must be sourced');
 for(const c of notArtia){
  assert.equal(c.without152.maximum.status,'complete','152 OFF complete '+c.id);
  assert.ok(Number.isFinite(c.channels.maximum.value)&&Number.isFinite(c.without152.maximum.value),'non-dragon numeric '+c.id);
  assert.ok(Math.abs(c.channels.maximum.value-c.without152.maximum.value)<1e-7,'no dragon-flat when build effective element not dragon '+c.id);
 }
 for(const c of artiaAssigned){
  assert.equal(c.without152.maximum.status,'complete','Artia OFF complete '+c.id);
  assert.ok(c.channels.maximum.value>c.without152.maximum.value,'Artia equipment-assigned dragon attribute must retain 152 flat '+c.id);
 }
 for(const c of effectiveDragon){
  assert.equal(c.channels.maximum.status,'complete','effective dragon candidate maximum '+c.id);
  assert.equal(c.without152.maximum.status,'complete','effective dragon maximum OFF '+c.id);
  assert.ok(c.channels.maximum.value>=c.without152.maximum.value-1e-7,'effective dragon must not lose attribute damage '+c.id);
 }
 const dragonImpact=impactOnComplete.filter(isDragon);
 assert.equal(dragonImpact.length,9);
 assert.ok(dragonImpact.some(c=>c.channels.maximum.value>c.without152.maximum.value+1e-7),'some active dragon 152 must increase elemental damage');
 for(const c of dragonImpact)assert.ok(c.channels.maximum.value>=c.without152.maximum.value-1e-7,'dragon 152 must never decrease damage '+c.id);
 assert.ok(impactOnBlocked.every(c=>!isDragon(c)),'unapproved 152 ON scope must not swallow sourced dragon weapon');
 const impactScopeReasons=Object.keys(out.counts.attributeConversion152.maximumReasonCounts.impact);
 assert.equal(impactScopeReasons.length,0,'candidate no-flat path should not leave pending body scope');
 for(const id of [145,146,147]){
  const c=out.cases.find(x=>x.id===id);
  assert.ok(c,'Artia CB record '+id);
  assert.equal(c.without152.normal.status,'complete','Artia legal none normal '+id);
  assert.equal(c.without152.maximum.status,'complete','Artia legal none maximum '+id);
 }
 for(const id of [153,154]){
  const c=out.cases.find(x=>x.id===id);
  assert.ok(c,'Wet Blade CB record '+id);
  assert.equal(c.without152.normal.status,'complete','Wet Blade explicit DRY normal '+id);
  assert.equal(c.without152.maximum.status,'complete','Wet Blade explicit DRY maximum '+id);
 }
 for(const id of [1073,1074]){
  const c=out.cases.find(x=>x.id===id);
  assert.ok(c,'candidate CB thunder record '+id);
  assert.equal(c.without152.normal.status,'complete','thunder candidate normal '+id);
  assert.equal(c.without152.maximum.status,'complete','thunder candidate maximum '+id);
 }
 for(const id of [1071,1072]){
  const c=out.cases.find(x=>x.id===id);
  assert.ok(c,'bladescale CB record '+id);
  assert.equal(c.without152.normal.status,'complete',id+' baseline normal');
  assert.equal(c.without152.maximum.status,'complete',id+' first-contact candidate maximum');
 }
 const statusCases=out.cases.filter(c=>c.phial==='impact'&&c.specials.length===1&&c.specials[0].kind==='status'&&['poison','paralysis','sleep'].includes(c.specials[0].status));
 assert.ok(statusCases.length>=16,'MHDB snapshot status cohort unexpected shrink');
 for(const c of statusCases){
  assert.equal(c.channels.normal.status,'complete','status physical calculation '+c.id+' '+c.channels.normal.reason);
  assert.equal(c.without152.maximum.status,'complete','status maximum 152 OFF '+c.id+' '+c.without152.maximum.reason);
  assert.ok(Number.isFinite(c.channels.normal.value),'finite status direct hit damage '+c.id);
  assert.equal(c.directElementNormal,0,'status buildup must not become direct elemental damage '+c.id);
  assert.ok(Number.isFinite(c.without152.maximum.value),'finite status maximum 152 OFF '+c.id);
 }
 assert.deepEqual(errors,[],'unexpected JSDOM error');
 out.outcome='CENSUS_COMPLETE_NO_PRODUCTION_CHANGE';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,counts:out.counts,cases:out.cases,failure:out.failure,errors},null,2));
 dom.window.close();
}
