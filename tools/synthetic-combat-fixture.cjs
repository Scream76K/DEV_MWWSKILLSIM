'use strict';
const { JSDOM, VirtualConsole } = require('jsdom');
const sourceSkills = require('./synthetic-combat-source-skills.cjs');
const { readSimulatorHtml } = require('./dom-test-setup.cjs');
// JSDOM 30 lacks structuredClone. Node validates cloneability, then these
// fixture-only records/arrays are allocated in the page realm so the engine's
// plain-object validation remains active. No prototypes or getters are changed.
// Unlike JSON cloning this preserves undefined, NaN, Infinity, -0 and cycles.
function cloneFixtureDataIntoWindow(w, value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  const array = Array.isArray(value);
  if (!array && Object.prototype.toString.call(value) !== '[object Object]')
    throw new TypeError('Synthetic combat fixture clone only accepts records and arrays');
  const copy = array ? new w.Array(value.length) : new w.Object();
  seen.set(value, copy);
  for (const [key, item] of Object.entries(value)) {
    // Reject this key before assignment; never invoke the inherited setter.
    if (key === '__proto__') throw new TypeError('Synthetic combat fixture clone rejects __proto__ keys');
    copy[key] = cloneFixtureDataIntoWindow(w, item, seen);
  }
  return copy;
}
function createSyntheticCombatDom(t) {
  const dom = new JSDOM(readSimulatorHtml(), { url: 'https://simulator.test/', runScripts: 'dangerously', virtualConsole: new VirtualConsole(), beforeParse(w) { w.structuredClone = value => cloneFixtureDataIntoWindow(w, structuredClone(value)); w.fetch = () => Promise.reject(Error('OFFLINE')); } });
  t.after(() => dom.window.close());
  return dom.window;
}
// Caller owns every synthetic weapon value. This helper never supplies missing
// gameId, sharpness, phial, coating, ammo, element or skill levels. Invalid values
// therefore still reach the production validation path unchanged.
// Production training-front is deliberately selected (80 physical / 30 element).
// Legacy monsterHZ stubs are not the adapter target; they must not redefine it.
function equipSyntheticWeapon(window, weapon) {
  const install = window.eval(`(fixture, sourceSkills) => {
    clearWeaponBuckets();
    DB.skills = sourceSkills;
    DB.weapons = [fixture];
    weaponIndexByKind[API_WEAPON_KIND[fixture.kind]] = [fixture];
    weaponKind.value = fixture.kind;
    const option = document.createElement('option');
    option.value = String(fixture.id); option.textContent = fixture.name;
    document.getElementById('weapon').replaceChildren(option);
    document.getElementById('weapon').value = String(fixture.id);
    App.build.setWeapon(fixture);
    build.armor = {};
    build.charmCustom = {skills:[], slots:[0,0], weaponSlots:[]};
    build.decos = {};
    renderMonsters();
    monster.value = 'training-room'; renderMonsterParts();
    monsterPart.value = 'training-front';
    calcBuild(); renderComboForWeapon();
  }`);
  install(cloneFixtureDataIntoWindow(window, structuredClone(weapon)), cloneFixtureDataIntoWindow(window, structuredClone(sourceSkills.skills)));
}
module.exports = { createSyntheticCombatDom, equipSyntheticWeapon };
