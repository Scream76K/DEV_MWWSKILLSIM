'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom'),root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));
const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/lbg-owner-exclusions-inputs.json')));
test('validated series exclusions preserve LBG body results, guards and veil resistance',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://lbg-owner-exclusions.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{
 w.__pack=fixture.data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const run=input=>{const before=JSON.stringify(input);w.__snapshot=structuredClone(input);w.applyBuildSnapshot(w.__snapshot);w.document.getElementById('calcBuild').click();assert.equal(JSON.stringify(input),before);return JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));};
 for(const c of fixture.cases){assert.equal(crypto.createHash('sha256').update(JSON.stringify(c.input)).digest('hex'),c.inputHash);const r=run(c.input);
  for(const ch of ['normal','maximum']){const channel=r.channels[ch],d=channel.diagnostics;assert.equal(channel.metrics.comboTotalDamage.status,'available');assert.ok(Math.abs(channel.metrics.comboTotalDamage.value-c.expected[ch])<1e-9);assert.notEqual(d.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');assert.equal((d.ignoredSkillEffects||[]).length,0);assert.ok(d.excludedCalculationSkills.some(x=>x.skillId===c.excludedId&&x.status==='OWNER_EXCLUDED_CURRENT_COMPARISON'));}
  const empty=structuredClone(c.input);empty.armor={};const removed=run(empty);for(const ch of ['normal','maximum'])assert.ok(!(removed.channels[ch].diagnostics.excludedCalculationSkills||[]).some(x=>x.skillId===c.excludedId));assert.deepEqual(run(c.input),r);
 }
 // Synthetic activation contract boundaries; not claims of legal equipment.
 for(const id of [34,153])for(const rank of [1,2]){
  const parent=id===34?'花舞の祈り':'波衣竜の守護',prefix=id===34?'地の恵み【花舞】':'守護のヴェール';
  const e={bonusSkillId:id,bonusName:parent,name:prefix+(rank===1?'Ⅰ':'Ⅱ'),source:'series',level:1,rankLevel:rank,required:rank===1?2:4,count:rank===1?2:4};w.__e=e;assert.equal(w.currentOwnerExcludedBonus(e),true);
  const plan=w.standardGroupPowerPlan({activeBonusEffects:[e]},'BEFORE',{},'light-bowgun',{});assert.equal(plan.unresolvedEffects.length,0);assert.equal(plan.applied[0].attackAdd,0);assert.equal(plan.applied[0].attackMultiplier,1);
  for(const [key,value] of [['bonusSkillId',999],['bonusName','forged'],['name','forged'],['source','group'],['level',2],['rankLevel',3],['required',99],['count',0],['count',2.5]])assert.equal(w.currentOwnerExcludedBonus({...e,[key]:value}),false,key);
  assert.ok(w.standardGroupPowerPlan({activeBonusEffects:[e,e]},'BEFORE',{},'light-bowgun',{}).unresolvedEffects.length>0);
  if(id===153)for(const element of ['thunder','water'])for(const active of [false,true]){
   const value=w.equipmentThunderResistanceInput({status:'ARMOR_BASE_ONLY',armorBase:7},{},[e],{selfSkillState:{shared:{veilActive:active}}},element,[]);assert.equal(value.total,7+(rank===2&&active?12:0));assert.equal(value.contributions[0].skillId,153);
   const invalid=w.equipmentThunderResistanceInput({status:'ARMOR_BASE_ONLY',armorBase:7},{},[{...e,count:0}],{},element,[]);assert.equal(invalid.status,'UNRESOLVED');
  }
 }
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
