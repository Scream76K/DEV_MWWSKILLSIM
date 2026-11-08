'use strict';
// Synthetic boundary tests only. Technique values below are arbitrary, not game data.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const productRoot = process.env.PRODUCT_ROOT || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(productRoot, 'hope-hammer-browser-adapter.js'), 'utf8');
const start = source.indexOf('   const airborneBodyIds=');
const end = source.indexOf('   for(const id of resolvedTechniqueIds)', start);
const available = start >= 0 && end > start;
const body = available ? source.slice(start, end) : '';
test('Airborne: synthetic production predicate boundary checks', t => {
  let assertions = 0;
    assert.ok(available, 'Airborne predicate boundaries missing from the selected adapter');
  assertions++;
  const ids = ['SNS_DOWNWARD_SLASH', 'SNS_HORIZONTAL_SLASH', 'SNS_RETURN_SLASH'];
  function input(id = ids[0]) {
    const skill = {skillId: 86, name: '飛燕', level: 1};
    const f = {
      weapon: {kind: 'sword-shield'}, allSkills: [{...skill}], rawSkills: [], buildSkills: [{...skill}],
      conditions: {}, hasShelling: false, hasReference: false, hhModel: null,
      resolvedTechniqueIds: [id], techniqueKind: 'sword-and-shield', techniques: {}, dbRequirements: {},
    };
    for (const recordId of [...ids, 'SNS_SIDE_SLASH']) f.techniques[recordId] = {
      techniqueId: recordId, weaponType: 'sword-and-shield',
      hits: [{damageType: 'slash', mv: 1, elementModifier: 1}],
    };
    // Independent in-memory requirement lookup. No production DB is loaded.
    f.techniqueDb = {get: (kind, recordId) => kind === f.techniqueKind && f.techniques[recordId]
      ? {stateRequirement: f.dbRequirements[recordId]} : undefined};
    return f;
  }
  function check(name, mutate, expected = false, id = ids[0]) {
    const f = input(id);
    mutate(f);
    assert.equal(vm.runInNewContext(body + '\nairborneBodyResolved;', f), expected, name);
    assertions++;
  }
  for (const id of ids) check(`ordinary ${id}`, () => {}, true, id);
  check('ordinary three-record sequence', f => f.resolvedTechniqueIds = [...ids], true);
  check('ordinary side slash may coexist', f => f.resolvedTechniqueIds.push('SNS_SIDE_SLASH'), true);
  for (const [name, mutate] of [
    ['wrong weapon', f => f.weapon.kind = 'gunlance'],
    ['missing skill', f => { f.allSkills = []; f.buildSkills = []; }],
    ['wrong skill identity', f => f.allSkills[0].skillId = 0],
    ['wrong skill name', f => f.allSkills[0].name = 'synthetic-unknown'],
    ['rank zero', f => f.allSkills[0].level = 0],
    ['rank two', f => f.allSkills[0].level = 2],
    ['fractional rank', f => f.allSkills[0].level = 0.5],
    ['duplicate build', f => f.buildSkills.push({...f.buildSkills[0]})],
    ['duplicate raw', f => f.rawSkills = [{...f.allSkills[0]}, {...f.allSkills[0]}]],
    ['conflicting raw rank', f => f.rawSkills = [{skillId: 86, name: '飛燕', level: 2}]],
    ['conflicting raw identity', f => f.rawSkills = [{skillId: 0, name: '飛燕', level: 1}]],
    ['shelling', f => f.hasShelling = true],
    ['reference', f => f.hasReference = true],
    ['hunting-horn model', f => f.hhModel = {}],
    ['unknown technique', f => f.resolvedTechniqueIds = ['synthetic-unknown']],
    ['unknown technique in sequence', f => f.resolvedTechniqueIds.push('synthetic-unknown')],
    ['missing record', f => delete f.techniques[ids[0]]],
  ]) check(`rejects ${name}`, mutate);
  for (const field of ['mounted', 'dismountAttack', 'sneakAttack', 'jumpAttack', 'jumping', 'airborne'])
    check(`rejects condition ${field}`, f => f.conditions[field] = true);
  for (const field of ['damageStatsState', 'stateStatsByState', 'damageStateTransition'])
    check(`rejects condition ${field}`, f => f.conditions[field] = {});
  for (const id of ids) {
    for (const [field, value] of [
      ['techniqueId', 'synthetic-unknown'], ['weaponType', 'hammer'],
      ['damageStatsState', {}], ['stateStatsByState', {}], ['damageStateTransition', {}],
      ['stateRequirement', {jump: true}], ['stateRequirement', []], ['stateRequirement', 0], ['stateRequirement', 'synthetic-state'],
      ['hpOnlyProvisional', true], ['referenceKind', 'synthetic-reference'], ['phialReference', {}],
      ['saAwakened', {}], ['hhModel', {}], ['glModel', {}], ['specialSourceValues', {}],
      ['specialComponents', ['synthetic-extra']], ['specialComponents', {}],
      ['excludedComponents', ['synthetic-extra']], ['excludedComponents', {}], ['hits', []],
      ['jumpAttack', true], ['jumping', true], ['airborne', true], ['mounted', true], ['dismountAttack', true], ['sneakAttack', true],
    ]) check(`${id} rejects record ${field}=${JSON.stringify(value)}`, f => f.techniques[id][field] = value, false, id);
    for (const [field, value] of [
      ['damageStatsState', {}], ['stateStatsByState', {}], ['damageStateTransition', {}],
      ['componentSource', 'synthetic-generated'], ['component', 'synthetic-extra'], ['damageType', 'blunt'],
      ['mv', NaN], ['mv', -1], ['elementModifier', Infinity], ['elementModifier', -1],
      ['jumpAttack', true], ['jumping', true], ['airborne', true], ['mounted', true], ['dismountAttack', true], ['sneakAttack', true],
    ]) check(`${id} rejects hit ${field}=${String(value)}`, f => f.techniques[id].hits[0][field] = value, false, id);
    check(`${id} rejects two hits`, f => f.techniques[id].hits.push({...f.techniques[id].hits[0]}), false, id);
    check(`${id} rejects independent DB requirement`, f => f.dbRequirements[id] = {jump: true}, false, id);
  }
  check('valid raw and build representations', f => f.rawSkills = [{...f.allSkills[0]}], true);
  check('explicit BODY annotation', f => f.techniques[ids[0]].hits[0].component = 'BODY', true);
  check('zero nonnegative hit values', f => {
    f.techniques[ids[0]].hits[0].mv = 0;
    f.techniques[ids[0]].hits[0].elementModifier = 0;
  }, true);
  check('empty requirements and components', f => {
    f.techniques[ids[0]].stateRequirement = {};
    f.dbRequirements[ids[0]] = {};
    f.techniques[ids[0]].specialComponents = [];
    f.techniques[ids[0]].excludedComponents = [];
  }, true);

  t.diagnostic(`assertions=${assertions}; synthetic-only predicate evidence, not browser or live-game verification`);
});
