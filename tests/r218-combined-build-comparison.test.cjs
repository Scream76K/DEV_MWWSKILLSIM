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
const fixtureWeapons={"w":{"id":900218001,"kind":"great-sword","name":"TEST_ONLY:r218:w","damage":{"raw":200},"affinity":10,"testOnly":true},"w2":{"id":900218002,"kind":"great-sword","name":"TEST_ONLY:r218:w2","damage":{"raw":220},"affinity":5,"testOnly":true}};
function scenario(){
 const build={weaponId:'w',armor:{head:null,chest:null,arms:null,waist:null,legs:null},charmCustom:{skills:[]},decos:{head0:null},artia:{}};
 const slots=[{key:'head0',kind:'armor',level:2}];
 const DB={decorations:[{id:'atk',kind:'armor',slot:2,skills:[{name:'攻撃',level:1}]},{id:'eye',kind:'armor',slot:2,skills:[{name:'見切り',level:1}]},{id:'runner',kind:'armor',slot:2,skills:[{name:'ランナー',level:1}]},{id:'def',kind:'armor',slot:2,skills:[{name:'防御',level:1}]}]};
 const saved={A:{weaponKind:'great-sword',weaponId:'w',decos:{head0:null}},B:{weaponKind:'great-sword',decos:{head0:'atk'}},C:{weaponKind:'great-sword',decos:{head0:'eye'}},D:{weaponKind:'great-sword',decos:{head0:'runner'}},E:{weaponKind:'great-sword',decos:{head0:'def'}}};
 let names=['A','B','C'];const out={textContent:'',innerHTML:''};
 const ctx={build,DB,calcState:{},profile,document:new JSDOM('<div id="combo"></div>').window.document,renderCharmLegality(){},selectedWeapon(){const record=fixtureWeapons[build.weaponId];if(!record)throw Error('UNKNOWN_TEST_WEAPON:'+build.weaponId);return record;},canonicalWeaponKind(){return 'great-sword'},weaponCoefficient(){return 1},artiaFixedVariantStats(){return null},weaponSkills(){return []},weaponElementInfo(){return {...MHWElementState.fromValue(0,'none'),value:0,type:'none'}},restoreStats(){return {attack:0,affinity:0,element:0}},add(total,skills){for(const [name,lv] of skills)total[name]=(total[name]||0)+lv},armorSkills(a){return a.skills||[]},armorMaxDefense(a){return a.defense||0},currentCharmSkills(){return (build.charmCustom.skills||[]).map(x=>[x.name,x.level])},allEquipSlots(){return slots},decorationCompatibleWithSlot(d,k){return d.kind===k},validDecorationSlotFit(d,l){return d.slot<=l},addSkillEntries(total,entries){for(const x of entries)total[x.name]=(total[x.name]||0)+x.level},calcSetSkills(){},clampSkillTotals(t){return t},$(id){return id==='useWeaponCoeff'?{checked:false}:out},selectedPart(){return null},calcMaxAffinity(t,base){return base},validCombatSkillLevel(){return 0},renderSummary(){},renderDetail(){},syncDamage(){},renderMonsterInfo(){},refreshDecorationSelects(){},updateWeaponCoeffDisplay(){},
  damageForStats(){return null},dpsForStats(){return null},bonusDamagePendingReason(){return null},
  standardPowerForStatsSingleHealth(kind,st,cond,total){const stats={baseAttack:st.attackTrue,displayedElement:0,physicalHitzone:60,elementalHitzone:20,sharpnessPhysical:1.32,sharpnessElement:1.15,affinity:st.affinity,maxAffinity:st.maxAffinity,criticalMultiplier:1.25};const normal=ctx.genericProfileDamage(profile,stats,'NORMAL');const maximum=ctx.genericProfileDamage(profile,stats,'MAX');return {profileId:'saved-build-fixture',normal,maximum}},
  invalidateAIComparisonData(){},compareSelectedNames(){return names},savedBuildMap(){return saved},buildSnapshot(){return {weaponId:build.weaponId,armor:{...build.armor},charmCustom:JSON.parse(JSON.stringify(build.charmCustom)),decos:{...build.decos}}},compareStep5Snapshot(){return {mv:100}},buildSnapshotMatches(a,b){return JSON.stringify(a)===JSON.stringify(b)},restoreStep5Snapshot(){},renderCompareTable(rows){ctx.renderedRows=rows;return 'rendered'},Date,JSON};
 ctx.applyBuildSnapshot=function(snapshot){build.weaponId=snapshot.weaponId||'w';build.decos={...snapshot.decos};build.armor={head:null,chest:null,arms:null,waist:null,legs:null,...snapshot.armor};build.charmCustom=JSON.parse(JSON.stringify(snapshot.charmCustom||{skills:[]}));vm.runInContext('calcBuild()',ctx)};
 vm.createContext(require('../tools/element-vm-test-setup.cjs').register(ctx));vm.runInContext(source,ctx);vm.runInContext('calcBuild()',ctx);
 return {ctx,build,out,saved,setNames(n){names=n},run(){vm.runInContext('runBuildCompare()',ctx);return ctx.renderedRows},index(row,base){ctx.row=row;ctx.base=base;return vm.runInContext('comparisonPowerIndex(row,base)',ctx)}};
}


test('weapon, armor, charm, and decoration jointly change saved build power index',()=>{
 const s=scenario();s.saved.B={weaponKind:'great-sword',weaponId:'w2',decos:{head0:'atk'},armor:{head:{skills:[['攻撃',1]],defense:30}},charmCustom:{skills:[{name:'見切り',level:1}]}};s.setNames(['A','B']);
 const rows=s.run();assert.equal(rows[0].attackTrue,200);assert.equal(rows[1].attackTrue,225);assert.equal(rows[1].affinity,9);assert.ok(s.index(rows[1],rows[0]).normal>100);
});
test('combined build comparison is unaffected by added non-damage armor and charm skills',()=>{
 const s=scenario();const base={weaponKind:'great-sword',weaponId:'w2',decos:{head0:'atk'},armor:{head:{skills:[['攻撃',1]]}},charmCustom:{skills:[{name:'見切り',level:1}]}};
 s.saved.B=base;s.saved.C={...base,armor:{head:{skills:[['攻撃',1],['防御',3]]}},charmCustom:{skills:[{name:'見切り',level:1},{name:'ランナー',level:2}]}};s.setNames(['A','B','C']);
 const rows=s.run();assert.equal(rows[1].power.normal.comparisonPower,rows[2].power.normal.comparisonPower);assert.equal(s.index(rows[2],rows[1]).normal,100);
});
test('combined comparison restores original weapon and equipment after calculations',()=>{
 const s=scenario();s.saved.B={weaponKind:'great-sword',weaponId:'w2',decos:{head0:'atk'},armor:{head:{skills:[['攻撃',2]]}},charmCustom:{skills:[{name:'見切り',level:2}]}};s.setNames(['A','B']);
 const before=JSON.stringify({build:s.build,stats:s.ctx.calcState.stats,total:s.ctx.calcState.total});s.run();assert.equal(JSON.stringify({build:s.build,stats:s.ctx.calcState.stats,total:s.ctx.calcState.total}),before);
});
