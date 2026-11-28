'use strict';
// Historical gates are reconciled with SOURCE_RULES_R9 / SOURCE_CONFIRMATIONS_R10.
// R10 uses past user confirmation, not a newly verified video frame.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=process.env.MHW_TEMPLATE_AUDIT_ROOT||path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const line=html.split('\n').find(x=>x.startsWith('const BUILD_TEMPLATE_DB='));
const ctx={};vm.createContext(ctx);vm.runInContext(line+';this.db=BUILD_TEMPLATE_DB;',ctx);
const db=JSON.parse(JSON.stringify(ctx.db));
const find=id=>{const t=db.templates.flatMap(g=>g.builds).find(x=>x.id===id);assert.ok(t,'missing '+id);return t;};
test('template database retains 14 weapon groups',()=>assert.equal(db.templates.length,14));
test('r6 SALADA_BOW_05 preserves the approved charm skills',()=>assert.deepEqual(find('SALADA_BOW_05').charm.skills.map(x=>[x.name,x.level]),[['見切り',3],['無我の境地',3]]));
test('R10 SALADA_BOW_05 preserves user-confirmed legs and waist jewels',()=>{const legs=find('SALADA_BOW_05').armor.legs;assert.equal(legs.name,'クイーンブーツα');assert.deepEqual(legs.decorations.map(x=>[x.name,x.slot,x.qty||1]),[['挑戦珠',3,1],['重撃珠',2,1]]);assert.deepEqual(find('SALADA_BOW_05').armor.waist.decorations.map(x=>[x.name,x.slot,x.qty||1]),[['体術珠',1,1]]);});
test('the retained screenshot HBG has distinct weapon and armor charm slots',()=>{const c=find('OWNER_20261128_14').charm;assert.deepEqual(c.weapon_slot_levels,[1]);assert.ok(c.armor_slot_levels.length);});
test('R9 KOTATU_DB_01 uses MHDB canonical Tatugei jewel',()=>assert.ok(find('KOTATU_DB_01').weapon.decorations.some(x=>x.name==='達芸珠'&&x.slot===3)));
test('r7 KOTATU_LBG_01 waist keeps two level-2 jumping jewels',()=>{const d=find('KOTATU_LBG_01').armor.waist.decorations;assert.equal(d.filter(x=>x.name==='跳躍珠'&&x.slot===2).reduce((n,x)=>n+(x.qty||1),0),2);assert.equal(d.some(x=>x.name==='挑戦珠'),false);});
test('delivered template records contain no creator names or external source links',()=>{
 for(const t of db.templates.flatMap(g=>g.builds)){
  assert.ok(!Object.hasOwn(t,'creator')&&!Object.hasOwn(t,'source'),t.id);
  assert.doesNotMatch(JSON.stringify(t),/こたつ|さらだ|https?:/);
 }
 assert.doesNotMatch(html.split('\n').find(x=>x.startsWith('function renderBuildTemplateUI()')),/出典：|\.creator\b|\.source\b/);
});
test('owner screenshot equipment templates are registered without implying unsupported customizations',()=>{
 const selected=db.templates.flatMap(g=>g.builds).filter(t=>t.id.startsWith('OWNER_20261128_'));
 assert.equal(selected.length,28);
 for(const g of db.templates){const keys=g.builds.map(t=>['head','chest','arms','waist','legs'].map(p=>t.armor[p].name.normalize('NFKC').replace(/\s/g,'')).join('|'));assert.equal(new Set(keys).size,keys.length,g.weapon_type_id);}
 assert.ok(!db.templates.flatMap(g=>g.builds).some(t=>['KOTATU_HBG_01','KOTATU_LAN_01'].includes(t.id)));
 for(const t of selected){
  assert.ok(t.description&&t.weapon?.name&&t.charm&&Object.keys(t.armor).length===5,t.id);
  assert.ok(!t.weaponSpecific,t.id);
 }
});
