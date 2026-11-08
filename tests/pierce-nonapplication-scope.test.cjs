'use strict';
// Synthetic boundary tests only. No saved builds, DB exports, result files or DOM.
// The only production file read is the adapter selected by PRODUCT_ROOT.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const productRoot = process.env.PRODUCT_ROOT || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(productRoot, 'hope-hammer-browser-adapter.js'), 'utf8');
const start = source.indexOf('  const pierceIdentity=');
const end = source.indexOf('  const equipment=', start);
const available = start >= 0 && end > start;
const body = available ? source.slice(start, end) : '';

test('Pierce: synthetic production predicate boundary checks', t => {
  let assertions = 0;
    assert.ok(available, 'Pierce predicate boundaries missing from the selected adapter');
  assertions++;

  const skillName = '貫通弾・竜の矢強化';
  const bowIds = ['BOW_SHOT_3', 'BOW_POWER_SHOT_3', 'BOW_POWER_VOLLEY_3'];
  function input(kind = 'bow') {
    const skill = {skillId: 94, name: skillName, level: 1};
    const f = {
      weapon: {kind, skills: [{skill: {id: 94, name: skillName}, level: 1}]},
      allSkills: [skill], rawSkills: [{...skill}], buildSkills: [{...skill}],
      conditions: {}, stats: {conditionalConditionPlan: {normal: {}, maximum: {}}},
      techniqueKind: kind, bowState: null, lightBowgunState: null, hbgState: null,
      records: {},
    };
    if (kind === 'bow') {
      f.resolvedTechniqueIds = [...bowIds];
      f.bowState = {chargeLevel: 3, coating: 'POWER', range: 'CRITICAL', startShot: 1, guided: false};
      for (const id of bowIds) f.records[id] = {
        techniqueId: id, weaponType: kind,
        sourceFormula: {scope: 'FIXED_BOW_STANDARD_SOURCE_REFERENCE'},
        hits: [{component: 'ARROW', mv: 1, elementModifier: 1}],
      };
    } else {
      const light = kind === 'light-bowgun';
      const id = light ? 'LBG_ELEMENT_FIRST_HIT_REFERENCE' : 'HBG_ELEMENT_FIRST_HIT_REFERENCE';
      f.resolvedTechniqueIds = [id];
      const state = {
        normalModeLevel: 0, ammoLevel: 1, range: 'CRITICAL',
        contactPolicy: 'EXPLICIT_CONTACTS', contactTargetPolicy: 'CURRENT_TARGET', contactCount: 1,
        ...(light ? {shotMode: 'NORMAL', ammoType: 'FIRE'} : {ammoType: 'NORMAL', elementType: 'fire'}),
      };
      f[light ? 'lightBowgunState' : 'hbgState'] = state;
      f.records[id] = {
        techniqueId: id, weaponType: kind, recordRole: 'SPECIAL_REFERENCE', hits: [],
        specialSourceValues: {status: 'SOURCE_CONFIRMED', scope: 'FIRST_HIT_ONLY_NOT_WHOLE_SHOT'},
      };
    }
    // In-memory record lookup only; there is no production DB import or lookup.
    f.techniqueDb = {get: (recordKind, id) => recordKind === kind ? f.records[id] : undefined};
    return f;
  }
  function check(name, kind, mutate, expected = false) {
    const f = input(kind);
    mutate(f);
    assert.equal(vm.runInNewContext(body + '\npierceNonTargetResolved;', f), expected, name);
    assertions++;
  }
  const kinds = ['bow', 'light-bowgun', 'heavy-bowgun'];
  for (const kind of kinds) {
    check(`${kind} exact ordinary route is accepted`, kind, () => {}, true);
    for (const [name, mutate] of [
      ['missing skill', f => f.allSkills = []],
      ['conflicting skill identity', f => f.allSkills[0].skillId = 0],
      ['wrong skill name', f => f.allSkills[0].name = 'synthetic-unknown'],
      ['rank zero', f => f.allSkills[0].level = 0],
      ['rank two', f => f.allSkills[0].level = 2],
      ['fractional rank', f => f.allSkills[0].level = 0.5],
      ['duplicate aggregate', f => f.allSkills.push({...f.allSkills[0]})],
      ['duplicate raw', f => f.rawSkills.push({...f.rawSkills[0]})],
      ['duplicate build', f => f.buildSkills.push({...f.buildSkills[0]})],
      ['conflicting weapon skill', f => f.weapon.skills[0].skill.id = 0],
      ['wrong weapon rank', f => f.weapon.skills[0].level = 2],
      ['unknown technique', f => f.resolvedTechniqueIds[0] = 'synthetic-unknown'],
      ['missing record', f => delete f.records[f.resolvedTechniqueIds[0]]],
    ]) check(`${kind} rejects ${name}`, kind, mutate);
    for (const field of ['mounted', 'dismountAttack', 'sneakAttack'])
      check(`${kind} rejects ${field}`, kind, f => f.conditions[field] = true);
    for (const field of ['damageStatsState', 'stateStatsByState', 'damageStateTransition']) {
      for (const location of ['conditions', 'stats', 'normal', 'maximum', 'state', 'condition state', 'record']) {
        check(`${kind} rejects ${location}.${field}`, kind, f => {
          const stateKey = kind === 'bow' ? 'bowState' : kind === 'light-bowgun' ? 'lightBowgunState' : 'hbgState';
          const target = location === 'normal' || location === 'maximum' ? f.stats.conditionalConditionPlan[location]
            : location === 'state' ? f[stateKey]
            : location === 'condition state' ? (f.conditions[stateKey] = {})
            : location === 'record' ? f.records[f.resolvedTechniqueIds[0]] : f[location];
          target[field] = {};
        });
      }
    }
    for (const [field, value] of [
      ['techniqueId', 'synthetic-unknown'], ['weaponType', 'synthetic-unknown'],
      ['referenceKind', 'synthetic-reference'], ['referenceInput', {}], ['componentSource', 'synthetic-generated'],
      ['hpOnlyProvisional', true], ['phialReference', {}], ['saAwakened', {}], ['hhModel', {}],
      ['specialComponents', ['synthetic-extra']], ['specialComponents', {}],
      ['stateRequirement', {jump: true}], ['stateRequirement', []], ['stateRequirement', 'synthetic-state'],
    ]) check(`${kind} rejects record ${field}=${JSON.stringify(value)}`, kind,
      f => f.records[f.resolvedTechniqueIds[0]][field] = value);
    check(`${kind} allows explicit empty ordinary metadata`, kind, f => {
      for (const record of Object.values(f.records)) {
        record.specialComponents = [];
        record.stateRequirement = {};
      }
    }, true);
  }
  for (const [name, mutate] of [
    ['reordered shots', f => f.resolvedTechniqueIds.reverse()],
    ['shortened sequence', f => f.resolvedTechniqueIds.pop()],
    ['extra shot', f => f.resolvedTechniqueIds.push(bowIds[0])],
    ['charge two', f => f.bowState.chargeLevel = 2],
    ['Pierce coating', f => f.bowState.coating = 'PIERCE'],
    ['noncritical range', f => f.bowState.range = 'synthetic-range'],
    ['later starting shot', f => f.bowState.startShot = 2],
    ['guided route', f => f.bowState.guided = true],
    ['wrong source scope', f => f.records[bowIds[0]].sourceFormula.scope = 'synthetic-scope'],
    ['no hits', f => f.records[bowIds[0]].hits = []],
  ]) check(`bow rejects ${name}`, 'bow', mutate);
  for (const [field, value] of [
    ['component', 'synthetic-extra'], ['componentSource', 'synthetic-generated'],
    ['damageStatsState', {}], ['stateStatsByState', {}], ['damageStateTransition', {}],
    ['mv', NaN], ['mv', -1], ['elementModifier', Infinity], ['elementModifier', -1],
  ]) check(`bow rejects hit ${field}=${String(value)}`, 'bow', f => f.records[bowIds[0]].hits[0][field] = value);
  check('bow allows zero nonnegative hit values', 'bow', f => {
    f.records[bowIds[0]].hits[0].mv = 0;
    f.records[bowIds[0]].hits[0].elementModifier = 0;
  }, true);
  for (const kind of ['light-bowgun', 'heavy-bowgun']) {
    const key = kind === 'light-bowgun' ? 'lightBowgunState' : 'hbgState';
    for (const level of [1, 2]) for (const element of ['fire', 'water', 'thunder', 'ice'])
      check(`${kind} permits ${element} level ${level}`, kind, f => {
        f[key].ammoLevel = level;
        f[key][kind === 'light-bowgun' ? 'ammoType' : 'elementType'] = kind === 'light-bowgun' ? element.toUpperCase() : element;
      }, true);
    for (const [field, value] of [
      ['normalModeLevel', 1], ['ammoLevel', 0], ['ammoLevel', 3], ['range', 'synthetic-range'],
      ['contactPolicy', 'synthetic-policy'], ['contactTargetPolicy', 'synthetic-target'],
      ['contactCount', 0], ['contactCount', 2],
    ]) check(`${kind} rejects ${field}=${value}`, kind, f => f[key][field] = value);
    for (const [name, mutate] of [
      ['extra record', f => f.resolvedTechniqueIds.push(f.resolvedTechniqueIds[0])],
      ['wrong role', f => f.records[f.resolvedTechniqueIds[0]].recordRole = 'synthetic-role'],
      ['unconfirmed source', f => f.records[f.resolvedTechniqueIds[0]].specialSourceValues.status = 'synthetic-status'],
      ['whole-shot scope', f => f.records[f.resolvedTechniqueIds[0]].specialSourceValues.scope = 'synthetic-whole-shot'],
      ['body hit', f => f.records[f.resolvedTechniqueIds[0]].hits.push({mv: 1, elementModifier: 1})],
    ]) check(`${kind} rejects ${name}`, kind, mutate);
  }
  check('LBG rejects rapid mode', 'light-bowgun', f => f.lightBowgunState.shotMode = 'RAPID');
  check('LBG rejects Dragon ammo', 'light-bowgun', f => f.lightBowgunState.ammoType = 'DRAGON');
  check('HBG rejects Pierce ammo', 'heavy-bowgun', f => f.hbgState.ammoType = 'PIERCE');
  check('HBG rejects Dragon element', 'heavy-bowgun', f => f.hbgState.elementType = 'dragon');

  t.diagnostic(`assertions=${assertions}; synthetic-only predicate evidence, not browser or live-game verification`);
});
