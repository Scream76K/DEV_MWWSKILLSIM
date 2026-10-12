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
test('R10 SALADA_BOW_05 preserves user-confirmed legs and waist jewels',()=>{const legs=find('SALADA_BOW_05').armor.legs;assert.equal(legs.name,'クイーンブーツα');assert.deepEqual(legs.decorations.map(x=>[x.name,x.slot,x.qty||1]),[['挑戦珠',3,1],['重撃珠',2,1]]);assert.deepEqual(find('SALADA_BOW_05').armor.waist.decorations.map(x=>[x.name,x.slot,x.qty||1]),[['体術珠',1,1]]);assert.ok(find('SALADA_BOW_05').notes.some(n=>n.includes('R10の過去ユーザー確認記録')));assert.equal(find('SALADA_BOW_05').notes.some(n=>n.includes('クイーンブーツαは装飾品なし')),false);});
test('r7 KOTATU_HBG_01 keeps distinct weapon and armor charm slots',()=>{const c=find('KOTATU_HBG_01').charm;assert.equal(c.slot_pattern,'武1-防1');assert.deepEqual(c.weapon_slot_levels,[1]);assert.deepEqual(c.armor_slot_levels,[1]);});
test('R9 KOTATU_DB_01 uses MHDB canonical Tatugei jewel',()=>assert.ok(find('KOTATU_DB_01').weapon.decorations.some(x=>x.name==='達芸珠'&&x.slot===3)));
test('r7 KOTATU_LBG_01 waist keeps two level-2 jumping jewels',()=>{const d=find('KOTATU_LBG_01').armor.waist.decorations;assert.equal(d.filter(x=>x.name==='跳躍珠'&&x.slot===2).reduce((n,x)=>n+(x.qty||1),0),2);assert.equal(d.some(x=>x.name==='挑戦珠'),false);});
