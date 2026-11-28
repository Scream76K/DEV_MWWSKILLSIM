'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const {data:armorDb}=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');
const {profiles}=require('../tests/fixtures/selected-hp-inputs.json'),{data}=require('../tests/fixtures/offset-maximum-inputs.json');
const cases=[
 ['great-sword',1081,'burst','連撃',115,[349,350,351,352]],
 ['great-sword',1081,'adrenalineRush','巧撃',167,[594,595,596,597]],
 ['light-bowgun',763,'burst','連撃',115,[349,350,351,352]],
];
for(const [kind,id,key,label,bonusId,pieces] of cases)test(kind+' '+label+' gate includes dependent series',t=>{
 const armor=armorDb.armor.filter(a=>pieces.includes(a.id));
 assert.equal(armor.length,4);
 const sets=armorDb.sets.filter(s=>armor.some(a=>a.armorSet.id===s.id));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://coupled-max.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;t.after(()=>w.close());
 const e=id=>w.document.getElementById(id),j=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__db=JSON.stringify({...data,armor,sets,skills:armorDb.skills});
 const base=profiles.find(p=>p.kind===kind).input;
 const saved={Coupled:{...base,weaponId:String(id),armor:Object.fromEntries(armor.map(a=>[a.kind,a.id])),decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},target:{monsterId:'training-room',partId:'training-front'},combo:{...base.combo,moves:[]}}};
 w.__saved=JSON.stringify(saved);
 w.eval('const src=JSON.parse(__db);DB=normalizeDB({...src,weapons:consolidateArtiaFixedVariantRows(src.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();monster.value="training-room";renderMonsterParts();monsterPart.value="training-front";renderMonsterInfo();applyBuildSnapshot(JSON.parse(__saved).Coupled);storageSet(BUILDS_KEY,__saved);renderSavedBuilds();');
 const actualBonus=j('calcState.stats.activeBonusEffects').find(x=>x.bonusSkillId===bonusId);
 assert.equal(actualBonus?.rankLevel,2,'real four-piece series rank recognized');
 const row=()=>{w.runBuildCompare();const result=j('lastBuildComparisonRows')?.[0];assert.ok(result,e('compareOut').textContent);return result;};
 const check=w.document.querySelector('#compareBuilds input[data-compare-name]');check.click();
 const control=w.document.querySelector('[data-maximum-skill="'+key+'"]');
 assert.ok(control&&!control.closest('[hidden]'));assert.equal(control.checked,true);
 const run=()=>{const r=row(),p=r.oneHitPipeline;for(const ch of ['normal','maximum'])assert.equal(p.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify({reason:p.reason,channel:p.channels[ch],power:r.power?.conditionPlan?.applied}));return r;};
 const on=run();control.click();const off=run();
 const bonus=r=>r.power?.conditionPlan?.applied?.find(x=>x.skillId===bonusId);
 const seriesCoefficient=r=>key==='burst'?bonus(r)?.attackAdd:bonus(r)?.maximumAttackMultiplier;
 if(kind!=='light-bowgun')assert.equal(seriesCoefficient(on),key==='burst'?18:1.05);
 if(kind!=='light-bowgun')assert.equal(seriesCoefficient(off),key==='burst'?0:1);
 const channels=r=>r.oneHitPipeline.channels;
 const stable=n=>({metrics:n.metrics,components:n.components,effects:n.effectPlan.effects});
 assert.deepEqual(stable(channels(on).normal),stable(channels(off).normal));
 const max=r=>channels(r).maximum.metrics.comboTotalDamage.value;
 assert.ok(max(on)>max(off));
 if(kind==='light-bowgun'){assert.deepEqual(on.oneHitPipeline.evaluationPlan.standardAmmo,off.oneHitPipeline.evaluationPlan.standardAmmo); assert.ok(Math.abs(max(on)-389.844)<1e-8);assert.ok(Math.abs(max(off)-299.88)<1e-8);}
 assert.deepEqual(j('savedBuildMap()'),saved);
 t.diagnostic(JSON.stringify({kind,label,bonus:actualBonus.name,normal:channels(on).normal.metrics.comboTotalDamage.value,enabled:max(on),disabled:max(off)}));
});
