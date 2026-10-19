const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const skills=html.slice(html.indexOf('function skillLevel('),html.indexOf('\nclass MonsterTarget'));
const affinity=html.slice(html.indexOf('function validCombatSkillLevel('),html.indexOf('\nfunction selectedMonsterName('));
const ctx=require('../tools/element-vm-test-setup.cjs').register({MHSeriesGroupIdentity:require('../series-group-identity.js'),selectedMonsterName:()=>'',hasSkill:(o,names)=>names.some(n=>(o[n]||0)>0)});
const f=vm.runInNewContext(skills+'\n'+affinity+'\n({calcMaxAffinity,calcElementSkill})',ctx);
test('fractional weakness exploit level does not corrupt max affinity',()=>assert.equal(f.calcMaxAffinity({'弱点特効':2.5},10,null,{}),10));
test('fractional conditional affinity skills do not create NaN',()=>assert.equal(f.calcMaxAffinity({'挑戦者':1.5,'渾身':2.5,'力の解放':3.5,'攻勢':1.5,'抜刀術【技】':2.5,'濡れ刃紋':1.5},5,null,{}),5));
test('verified integer weakness exploit level 5 retains 50 percent maximum bonus',()=>assert.equal(f.calcMaxAffinity({'弱点特効':5},10,null,{}),60));
test('oversized affinity skill levels cap to valid maximum',()=>assert.equal(f.calcMaxAffinity({'弱点特効':99},10,null,{}),60));
// KAN71: a name alone never proves an activated source. Keep fractional-Lv
// coverage separately using the real official parent/rank and two pieces.
test('bare frenzy name without activation does not grant recovery affinity',()=>assert.equal(f.calcMaxAffinity({'黒蝕竜の力':1,'無我の境地':2.5},10,null,{}),10));
test('fractional antivirus with valid Gore activation retains only the 15 point recovery reward',()=>assert.equal(f.calcMaxAffinity({'無我の境地':2.5},10,null,{},[{bonusSkillId:106,rankId:267,rankLevel:1,count:2,required:2,source:'series'}]),25));
test('fractional elemental attack level does not grant level 3 bonus',()=>assert.equal(f.calcElementSkill({'火属性攻撃強化':1.5},'fire').add,0));
test('integer elemental attack level 3 still applies',()=>assert.equal(f.calcElementSkill({'火属性攻撃強化':3},'fire').mult,1.2));
