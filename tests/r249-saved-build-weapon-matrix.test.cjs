const MHWElementState=require('../element-state.js');
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function extract(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert.ok(i>=0&&j>i,a);return html.slice(i,j)}
const source=extract('function isArtia(','const WEAPON_COEFF=')+extract('function skillLevel(','\nclass MonsterTarget')+extract('function calcBuild()','\nfunction sortedSkills(')+extract('function genericExpectedCritMultiplier(','// Read-only source-state inspection.')+extract('const STANDARD_POWER_SKILL_NAMES=','// r100: evaluate whole fixed routes')+extract('function standardPowerForStats(kind,st,cond,total={}){','function comparisonPowerIndex(')+extract('function comparisonPowerIndex(','function comparisonPowerChange(')+extract('function compareSnapshot(','function comparisonReasonText(')+extract('function runBuildCompare(','function aiBuildData(');
const profile={status:'ADOPTED',hits:[{name:'fixture hit',mv:100,elementModifier:1}]};
// Artificial fixture identities only; these IDs do not claim an MHDB weapon.
// Existing aliases/capabilities remain unchanged. No sharpness data: owner missing-white policy applies.
const fixtureWeapons={"great-sword":{"w":{"id":900249001,"kind":"great-sword","name":"TEST_ONLY:r249:great-sword:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"long-sword":{"w":{"id":900249002,"kind":"long-sword","name":"TEST_ONLY:r249:long-sword:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"sword-and-shield":{"w":{"id":900249003,"kind":"sword-and-shield","name":"TEST_ONLY:r249:sword-and-shield:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"dual-blades":{"w":{"id":900249004,"kind":"dual-blades","name":"TEST_ONLY:r249:dual-blades:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"hammer":{"w":{"id":900249005,"kind":"hammer","name":"TEST_ONLY:r249:hammer:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"hunting-horn":{"w":{"id":900249006,"kind":"hunting-horn","name":"TEST_ONLY:r249:hunting-horn:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"lance":{"w":{"id":900249007,"kind":"lance","name":"TEST_ONLY:r249:lance:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"gunlance":{"w":{"id":900249008,"kind":"gunlance","name":"TEST_ONLY:r249:gunlance:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"switch-axe":{"w":{"id":900249009,"kind":"switch-axe","name":"TEST_ONLY:r249:switch-axe:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"charge-blade":{"w":{"id":900249010,"kind":"charge-blade","name":"TEST_ONLY:r249:charge-blade:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"insect-glaive":{"w":{"id":900249011,"kind":"insect-glaive","name":"TEST_ONLY:r249:insect-glaive:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"light-bowgun":{"w":{"id":900249012,"kind":"light-bowgun","name":"TEST_ONLY:r249:light-bowgun:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"heavy-bowgun":{"w":{"id":900249013,"kind":"heavy-bowgun","name":"TEST_ONLY:r249:heavy-bowgun:w","damage":{"raw":200},"affinity":10,"testOnly":true}},"bow":{"w":{"id":900249014,"kind":"bow","name":"TEST_ONLY:r249:bow:w","damage":{"raw":200},"affinity":10,"testOnly":true}}};
function scenario(){
 const build={weaponId:'w',armor:{head:null,chest:null,arms:null,waist:null,legs:null},charmCustom:{skills:[]},decos:{head0:null},artia:{}};
 const slots=[{key:'head0',kind:'armor',level:2}];
 const DB={decorations:[{id:'atk',kind:'armor',slot:2,skills:[{name:'攻撃',level:1}]},{id:'eye',kind:'armor',slot:2,skills:[{name:'見切り',level:1}]},{id:'runner',kind:'armor',slot:2,skills:[{name:'ランナー',level:1}]},{id:'def',kind:'armor',slot:2,skills:[{name:'防御',level:1}]}]};
 const saved={A:{weaponKind:'great-sword',decos:{head0:null}},B:{weaponKind:'great-sword',decos:{head0:'atk'}},C:{weaponKind:'great-sword',decos:{head0:'eye'}},D:{weaponKind:'great-sword',decos:{head0:'runner'}},E:{weaponKind:'great-sword',decos:{head0:'def'}}};
 let names=['A','B','C'];const out={textContent:'',innerHTML:''};
 const ctx={build,DB,calcState:{},profile,document:new JSDOM('<div id="combo"></div>').window.document,renderCharmLegality(){},selectedWeapon(){const record=fixtureWeapons[ctx.activeWeaponKind||'great-sword']?.[build.weaponId];if(!record)throw Error('UNKNOWN_TEST_WEAPON:'+build.weaponId);return record;},canonicalWeaponKind(){return ctx.activeWeaponKind||'great-sword'},weaponCoefficient(){return 1},artiaFixedVariantStats(){return null},weaponSkills(){return []},weaponElementInfo(){return {...MHWElementState.fromValue(0,'none'),value:0,type:'none'}},restoreStats(){return {attack:0,affinity:0,element:0}},add(total,skills){for(const [name,lv] of skills)total[name]=(total[name]||0)+lv},armorSkills(a){return a.skills||[]},armorMaxDefense(a){return a.defense||0},currentCharmSkills(){return (build.charmCustom.skills||[]).map(x=>[x.name,x.level])},allEquipSlots(){return slots},decorationCompatibleWithSlot(d,k){return d.kind===k},validDecorationSlotFit(d,l){return d.slot<=l},addSkillEntries(total,entries){for(const x of entries)total[x.name]=(total[x.name]||0)+x.level},calcSetSkills(){},clampSkillTotals(t){return t},$(id){return id==='useWeaponCoeff'?{checked:false}:out},selectedPart(){return null},calcMaxAffinity(t,base){return base},validCombatSkillLevel(){return 0},renderSummary(){},renderDetail(){},syncDamage(){},renderMonsterInfo(){},refreshDecorationSelects(){},updateWeaponCoeffDisplay(){},
  damageForStats(){return null},dpsForStats(){return null},bonusDamagePendingReason(){return null},
  standardPowerForStatsSingleHealth(kind,st,cond,total){const stats={baseAttack:st.attackTrue,displayedElement:0,physicalHitzone:60,elementalHitzone:20,sharpnessPhysical:1.32,sharpnessElement:1.15,affinity:st.affinity,maxAffinity:st.maxAffinity,criticalMultiplier:1.25};const normal=ctx.genericProfileDamage(profile,stats,'NORMAL');const maximum=ctx.genericProfileDamage(profile,stats,'MAX');return {profileId:'saved-build-fixture',normal,maximum}},
  invalidateAIComparisonData(){},compareSelectedNames(){return names},savedBuildMap(){return saved},buildSnapshot(){return {weaponId:build.weaponId,armor:{...build.armor},charmCustom:JSON.parse(JSON.stringify(build.charmCustom)),decos:{...build.decos}}},compareStep5Snapshot(){return {mv:100}},buildSnapshotMatches(a,b){return JSON.stringify(a)===JSON.stringify(b)},restoreStep5Snapshot(){},renderCompareTable(rows){ctx.renderedRows=rows;return 'rendered'},Date,JSON};
 ctx.applyBuildSnapshot=function(snapshot){build.weaponId=snapshot.weaponId??'w';build.decos={...snapshot.decos};build.armor={head:null,chest:null,arms:null,waist:null,legs:null,...snapshot.armor};build.charmCustom=JSON.parse(JSON.stringify(snapshot.charmCustom||{skills:[]}));vm.runInContext('calcBuild()',ctx)};
 vm.createContext(require('../tools/element-vm-test-setup.cjs').register(ctx,{bowProducer:true}));vm.runInContext(source,ctx);vm.runInContext('calcBuild()',ctx);
 return {ctx,build,out,saved,setNames(n){names=n},run(){vm.runInContext('runBuildCompare()',ctx);return ctx.renderedRows},index(row,base){ctx.row=row;ctx.base=base;return vm.runInContext('comparisonPowerIndex(row,base)',ctx)}};
}

const WEAPON_KINDS=['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
for(const kind of WEAPON_KINDS){
 test('r249 saved comparison restores state and calculates normal index: '+kind,()=>{
  const s=scenario();s.ctx.activeWeaponKind=kind;for(const entry of Object.values(s.saved))entry.weaponKind=kind;
  s.build.decos.head0='eye';vm.runInContext('calcBuild()',s.ctx);
  const before=JSON.stringify({build:s.build,stats:s.ctx.calcState.stats,total:s.ctx.calcState.total});
  const rows=s.run();assert.equal(rows.length,3);assert.equal(rows[0].kind,kind);
  assert.equal(s.index(rows[0],rows[0]).normal,100);assert.ok(s.index(rows[1],rows[0]).normal>100);
  assert.equal(JSON.stringify({build:s.build,stats:s.ctx.calcState.stats,total:s.ctx.calcState.total}),before);
  assert.equal(s.out.innerHTML,'rendered');
 });
 test('r249 cross-weapon guard prevents mutation: '+kind,()=>{
  const s=scenario();s.ctx.activeWeaponKind=kind;for(const entry of Object.values(s.saved))entry.weaponKind=kind;
  s.saved.B.weaponKind=kind==='bow'?'lance':'bow';s.setNames(['A','B']);
  const before=JSON.stringify(s.build);s.run();assert.equal(JSON.stringify(s.build),before);
  assert.match(s.out.textContent,/異なる武器種/);
 });
}
