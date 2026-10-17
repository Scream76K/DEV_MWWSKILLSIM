const MHWElementState=require('../element-state.js');
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function extract(begin,end){const a=html.indexOf(begin),b=html.indexOf(end,a);assert.ok(a>=0&&b>a);return html.slice(a,b)}
const functions=extract('function skillLevel(', '\nclass MonsterTarget')+'\n'+extract('function calcBuild()', '\nfunction sortedSkills(');
function scenario(){
 const build={armor:{head:null,chest:null,arms:null,waist:null,legs:null},decos:{head0:null},artia:{}};
 const slots=[{key:'head0',kind:'armor',level:2}];
 const DB={decorations:[{id:'atk',kind:'armor',slot:2,skills:[{name:'攻撃',level:1}]},{id:'eye',kind:'armor',slot:2,skills:[{name:'見切り',level:1}]},{id:'large',kind:'armor',slot:3,skills:[{name:'攻撃',level:5}]}]};
 const ctx={build,DB,calcState:{},renderCharmLegality(){},selectedWeapon(){return {damage:{raw:200},affinity:10}},canonicalWeaponKind(){return 'bow'},weaponCoefficient(){return 1},isArtia(){return false},artiaFixedVariantStats(){return null},weaponSkills(){return []},weaponElementInfo(){return {...MHWElementState.fromValue(0,'none'),value:0,type:'none'}},restoreStats(){return {attack:0,affinity:0,element:0}},add(total,skills){for(const [name,lv] of skills)total[name]=(total[name]||0)+lv},armorSkills(){return []},armorMaxDefense(){return 0},currentCharmSkills(){return []},allEquipSlots(){return slots},decorationCompatibleWithSlot(d,k){return d.kind===k},validDecorationSlotFit(d,level){return Number(d.slot)<=level},addSkillEntries(total,entries){for(const x of entries)total[x.name]=(total[x.name]||0)+x.level},calcSetSkills(){},clampSkillTotals(t){return t},$(id){return id==='useWeaponCoeff'?{checked:false}:null},selectedPart(){return null},calcMaxAffinity(t,base){return base},validCombatSkillLevel(){return 0},renderSummary(){},renderDetail(){},syncDamage(){},renderMonsterInfo(){},refreshDecorationSelects(){},updateWeaponCoeffDisplay(){}};
 vm.createContext(require('../tools/element-vm-test-setup.cjs').register(ctx,{bowProducer:true}));vm.runInContext(functions,ctx);
 return {build,slots,ctx,calculate(){vm.runInContext('calcBuild()',ctx);return JSON.parse(JSON.stringify(ctx.calcState))}};
}
test('attack decoration increases calculated true attack and clearing restores baseline',()=>{const s=scenario();const base=s.calculate();s.build.decos.head0='atk';const boosted=s.calculate();assert.equal(boosted.total['攻撃'],1);assert.equal(boosted.stats.attackTrue,base.stats.attackTrue+3);s.build.decos.head0=null;assert.equal(s.calculate().stats.attackTrue,base.stats.attackTrue)});
test('switching attack to affinity decoration replaces rather than accumulates bonuses',()=>{const s=scenario();s.build.decos.head0='atk';s.calculate();s.build.decos.head0='eye';const result=s.calculate();assert.equal(result.total['攻撃'],undefined);assert.equal(result.total['見切り'],1);assert.equal(result.stats.attackTrue,200);assert.equal(result.stats.affinity,14)});
test('shrinking armor slot removes old decoration from calculated attack',()=>{const s=scenario();s.build.decos.head0='atk';assert.equal(s.calculate().stats.attackTrue,203);s.slots[0].level=1;assert.equal(s.calculate().stats.attackTrue,200)});
test('oversized decoration never changes attack',()=>{const s=scenario();s.build.decos.head0='large';assert.equal(s.calculate().stats.attackTrue,200)});
test('charm skills and decoration skills combine in calculation',()=>{const s=scenario();s.ctx.currentCharmSkills=()=>[['攻撃',4]];s.build.decos.head0='atk';const r=s.calculate();assert.equal(r.total['攻撃'],5);assert.equal(r.stats.attackTrue,217)});
