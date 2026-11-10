'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSyntheticCombatDom, equipSyntheticWeapon } = require('./synthetic-combat-fixture.cjs');
// All numbers below are controlled test inputs, not a named MHDB weapon.
function weapon(overrides = {}) {
  return { id: 987, gameId: 987, kind: 'great-sword', name: 'Synthetic contract', damage: { raw: 200, display: 960 }, affinity: 20, specials: [{ kind: 'element', element: 'dragon', damage: { raw: 30, display: 300 } }], sharpness: { white: 1 }, slots: [], skills: [], ...overrides };
}
test('synthetic fixture preserves controlled weapon values and uses real calcBuild and training UI', t => {
  const w = createSyntheticCombatDom(t), input = weapon(), before = JSON.stringify(input);
  assert.equal(typeof w.structuredClone, 'function');
  const training = w.trainingRoomMonster, adapter = w.MHWRealOneHitBrowserAdapter;
  equipSyntheticWeapon(w, input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(w.document.getElementById('monster').value, 'training-room');
  assert.equal(w.document.getElementById('monsterPart').value, 'training-front');
  assert.equal(w.trainingRoomMonster, training);
  assert.equal(w.MHWRealOneHitBrowserAdapter, adapter);
  assert.deepEqual(JSON.parse(w.eval('JSON.stringify(selectedWeapon())')), input);
  assert.deepEqual(JSON.parse(w.eval('JSON.stringify([calcState.stats.attackTrue,calcState.stats.affinity,calcState.stats.element])')), [200,20,300]);
  assert.equal(w.MHWWeaponMaxSharpness.fromMHDB(input).color, 'white');
  w.document.getElementById('comboMovePicker').value = 'gs_charge3';
  {const result=w.calcSelectedTechniqueDamage();assert.ok(result.damage>0,JSON.stringify(result.blocked));}
});
test('synthetic fixture does not fill missing weapon identity or sharpness', t => {
  const w = createSyntheticCombatDom(t), input = weapon(); delete input.gameId;
  equipSyntheticWeapon(w, input); w.document.getElementById('comboMovePicker').value = 'gs_charge3';
  assert.match(w.calcSelectedTechniqueDamage().blocked[0].reason, /CURRENT_WEAPON_NOT_SUPPORTED/);
  input.gameId=987; delete input.sharpness;
  equipSyntheticWeapon(w, input); w.document.getElementById('comboMovePicker').value = 'gs_charge3';
  assert.match(w.calcSelectedTechniqueDamage().blocked[0].reason, /SHARPNESS_UNRESOLVED/);
});
test('synthetic fixture retains malformed zero-level skill and missing target guards', t => {
  const w = createSyntheticCombatDom(t), input=weapon({skills:[{name:'攻撃',level:0}]});
  equipSyntheticWeapon(w,input); w.document.getElementById('comboMovePicker').value='gs_charge3';
  assert.equal(w.eval('selectedWeapon().skills[0].level'),0);
  assert.match(w.calcSelectedTechniqueDamage().blocked[0].reason,/SKILL_LEVEL_OR_NAME_INVALID/);
  equipSyntheticWeapon(w,weapon()); w.document.getElementById('comboMovePicker').value='gs_charge3';
  w.document.getElementById('monster').value='';
  assert.match(w.calcSelectedTechniqueDamage().blocked[0].reason,/COMPARISON_TARGET_NOT_SAVED/);
});
test('synthetic Wyvern applicability requires explicit positive ammo capacity', t => {
  const w=createSyntheticCombatDom(t), input=weapon({kind:'heavy-bowgun',damage:{raw:160,display:160},affinity:0,specials:[],ammo:[{kind:'wyvern',capacity:1}]});
  equipSyntheticWeapon(w,input);
  for(const [id,value] of Object.entries({wyvernMeal:'AZUZ',wyvernCharm:'YES',wyvernOther:'NONE',wyvernMode:'STANDARD',wyvernFireHz:'30'}))w.document.getElementById(id).value=value;
  w.document.getElementById('comboMovePicker').value='canonical:HBG_WYVERN_AMMO';
  {const result=w.calcSelectedTechniqueDamage();assert.ok(result.damage>0,JSON.stringify(result.blocked));}
  for(const ammo of [undefined,[],[{kind:'wyvern',capacity:0}],[{kind:'wyvern',capacity:1.5}]]) {
    w.eval('selectedWeapon().ammo='+JSON.stringify(ammo));
    const result=w.calcSelectedTechniqueDamage();
    assert.equal(result.damage,null);assert.match(result.blocked[0].reason,/WEAPON_AMMO_APPLICABILITY_PENDING/);
  }
});

test('test realm clone retains undefined, nonfinite values and cycles instead of JSON coercion', t => {
  const w=createSyntheticCombatDom(t);
  const result=w.eval(`(() => {const x={missing:undefined,nan:NaN,infinite:Infinity,negative:-0,rows:[1,undefined]};x.self=x;const y=structuredClone(x);return [y!==x,y.self===y,Object.hasOwn(y,'missing'),y.missing===undefined,Number.isNaN(y.nan),y.infinite===Infinity,Object.is(y.negative,-0),y.rows!==x.rows,y.rows[1]===undefined,Object.getPrototypeOf(y)===Object.prototype];})()`);
  assert.deepEqual(Array.from(result),Array(10).fill(true));
});

test('weapon input transfer preserves undefined and nonfinite guard evidence', t => {
  const w=createSyntheticCombatDom(t), input=weapon({damage:{raw:NaN,display:Infinity},note:undefined});
  equipSyntheticWeapon(w,input);
  assert.ok(w.eval('Number.isNaN(selectedWeapon().damage.raw)'));
  assert.equal(w.eval('selectedWeapon().damage.display'),Infinity);
  assert.ok(w.eval("Object.hasOwn(selectedWeapon(),'note')"));
  assert.equal(w.eval('selectedWeapon().note'),undefined);
  w.document.getElementById('comboMovePicker').value='gs_charge3';
  const result=w.calcSelectedTechniqueDamage();
  assert.equal(result.damage,null);
  assert.equal(result.blocked[0].reason,'REAL_SLICE:MHDB_BASE_STATS_UNKNOWN');
});

test('bounded test clone rejects exotic records and dangerous setter keys without applying them', t => {
  const w=createSyntheticCombatDom(t);
  assert.throws(()=>w.structuredClone(new Map()),/only accepts records and arrays/);
  assert.throws(()=>w.structuredClone(JSON.parse('{"__proto__":1}')),/rejects __proto__ keys/);
});
