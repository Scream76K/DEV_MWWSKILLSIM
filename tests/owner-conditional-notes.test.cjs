'use strict';
// User decisions25/67/75; MHDB rank descriptions remain authoritative.
// Public offline calculations, not game verification or arbitrary charm legality.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));

const fixturePack=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/owner-conditional-notes-inputs.json')));const fixtures=fixturePack.cases;
const data=fixturePack.data;
for(const kind of ['great-sword','charge-blade','bow','light-bowgun'])test('owner conditional notes and exclusion: '+kind,()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://owner-notes.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{
 w.__data=data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(input){captured=input;return adapter.evaluateCurrent(input)}};
 const base=structuredClone(fixtures.find(x=>x.kind===kind).input);base.armor={};base.decos={};base.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};base.combo.moves=[];
 const run=input=>{const original=JSON.stringify(input);w.__snapshot=structuredClone(input);w.applyBuildSnapshot(w.__snapshot);w.document.getElementById('calcBuild').click();assert.equal(JSON.stringify(input),original);return JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));};
 const totals=r=>['normal','maximum'].map(ch=>{const m=r.channels?.[ch]?.metrics?.comboTotalDamage;assert.equal(m?.status,'available',JSON.stringify(r));assert.ok(Number.isFinite(m.value));return m.value;});
 const baseline=run(base),expected=totals(baseline);
 for(const [id,name,max] of [[67,'急襲',3],[75,'攻勢',5]])for(let level=1;level<=max;level++){
  const input=structuredClone(base);input.charmCustom.skills=[{name,level,type:'armor'}];const r=run(input);assert.deepEqual(totals(r),expected);
  for(const ch of ['normal','maximum']){const n=r.channels[ch].diagnostics.excludedConditionalBuffs.find(x=>x.skillId===id);assert.equal(n.level,level);assert.equal(n.kind,'CONDITIONAL_SELF_BUFF');assert.equal(n.includedInPower,false);assert.equal(n.effectDescription,data.skills.find(x=>x.id===id).ranks.find(x=>x.level===level).description);assert.ok(w.document.getElementById('buildSummary').textContent.includes(n.description));if(id===67)assert.equal(n.durationSeconds,30);else assert.equal(n.durationSeconds,undefined);}
  const removed=run(base);assert.deepEqual(totals(removed),expected);assert.ok(!(removed.channels.normal.diagnostics.excludedConditionalBuffs||[]).some(x=>x.skillId===id));assert.deepEqual(totals(run(input)),expected);
 }
 for(const rank of [1,2]){
  const input=structuredClone(base);input.armor=rank===1?{head:183,chest:184}:{head:183,chest:184,arms:185,waist:186};
  const control=structuredClone(base);control.charmCustom.skills=[{name:'巧撃',level:2,type:'armor'},{name:'火事場力',level:rank===1?3:5,type:'armor'},{name:'急襲',level:2,type:'armor'}];
  const c=run(control),r=run(input);assert.deepEqual(totals(r),totals(c));
  const seed=captured;
  for(const edit of [e=>e.source='unknown',e=>e.rankLevel=99,e=>e.count=0,e=>e.name='forged',e=>e.required=99]){const input={...seed,stats:JSON.parse(JSON.stringify(seed.stats))};edit(input.stats.activeBonusEffects.find(x=>x.bonusSkillId===25));const rejected=adapter.evaluateCurrent(input);assert.ok(rejected.status!=='OK'||Object.values(rejected.channels).some(x=>x.execution.status!=='complete'),'invalid25 activation rejected');}
  {const input={...seed,stats:JSON.parse(JSON.stringify(seed.stats))};input.stats.activeBonusEffects.push({...input.stats.activeBonusEffects.find(x=>x.bonusSkillId===25)});const rejected=adapter.evaluateCurrent(input);assert.ok(rejected.status!=='OK'||Object.values(rejected.channels).some(x=>x.execution.status!=='complete'),'duplicate25 activation rejected');}
  for(const ch of ['normal','maximum']){const notes=r.channels[ch].diagnostics.excludedConditionalBuffs;const n=notes.find(x=>x.skillId===25);assert.equal(n.level,rank);assert.equal(n.durationSeconds,undefined);assert.equal(n.includedInPower,false);assert.ok(notes.some(x=>x.skillId===67&&x.durationSeconds===30));assert.ok(w.document.getElementById('buildSummary').textContent.includes(n.description));}
 }
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
