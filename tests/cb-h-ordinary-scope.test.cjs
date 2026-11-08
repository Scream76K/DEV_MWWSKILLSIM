'use strict';
// Fixture-free extraction tests. All canonical, technique, resource and skill
// inputs below are explicit synthetic doubles. The fixed values describe the
// already adopted public contract; this test neither approves coefficients nor
// validates a damage formula, equipment build, current game version or browser.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const productRoot = process.env.PRODUCT_ROOT || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(productRoot, 'hope-hammer-browser-adapter.js'), 'utf8');
function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, 'Missing production boundary: ' + startMarker);
  return source.slice(start, end);
}
const zeroProof = section('  const knownNoElement=', '  const chargeNoElementResolved=');
const chargeProof = section('  const cbChargeRoutes=', '  const cbChargeNoElementResolved=');
const ordinaryProof = section('  const cbHOrdinaryMetadata=', '  const partbreakerBodyIds=');
const partbreakerGate = section('  const partbreakerBodyIds=', '  if(cornpopperEntries.length)');
const airborneGate = section('  const airborneEntries=', '  const cbMindRuleFor=');
const proofProgram = new vm.Script(zeroProof + chargeProof + ordinaryProof + '\ncbHOrdinaryResolved;');
const gateProgram = new vm.Script('(function(){\n' + zeroProof + chargeProof + ordinaryProof + partbreakerGate + airborneGate +
  '\nreturn {status:"accepted",proof:cbHOrdinaryResolved,partbreaker:partbreakerHResolved,airborneEffects};\n})()');
const legacyPartbreakerProgram = new vm.Script('(function(){\n' + partbreakerGate +
  '\nreturn {status:"accepted",partbreaker:partbreakerHResolved};\n})()');
const clone = x => structuredClone(x);
const clean = x => JSON.parse(JSON.stringify(x));
const ids = ['CB_AXE_TO_SWORD_MORPH', 'CB_SHIELD_THRUST', 'CB_AED', 'CB_FOLLOWUP_AED'];
const names = {129: '破壊王', 86: '飛燕'};
// Reuse public provenance tokens as mock identities without copying source
// artifacts or asserting their underlying observational validity.
const prefixPhialSource = source.match(/const cbHPhialSource='([^']+)';/)[1];
const releasePhialSource = source.match(/const source=prefix\?cbHPhialSource:'([^']+)';/)[1];
const noWoundIds = JSON.parse(source.match(/const ADOPTED_NO_WOUND_EVENT_IDS=new Set\((\[[^\n]+?\])\);/)[1]);

function fixture(skillId = 129, level = 1) {
  const entry = {skillId, name: names[skillId], level};
  const stats = {element: 0, elementType: 'none', elementKnown: true, typeKnown: true,
    elementStatus: 'CONFIRMED_NONE', elementComponents: {weaponBase: 0, normalMultiplier: 1, normalFlat: 0}, activeBonusEffects: []};
  const state = {mode: 'AXE', previousAction: 'AXE_NEUTRAL', phialType: 'IMPACT', swordBoosted: false,
    shieldBoosted: true, axeBoosted: true, enhancedPhial: false, enhancedPhials: 0, normalPhials: 5};
  const f = {
    weapon: {kind: 'charge-blade', phial: 'impact', specials: []},
    allSkills: [clone(entry)], rawSkills: [], buildSkills: [clone(entry)],
    stats, resolvedConditionPlan: {normal: clone(stats), maximum: clone(stats),
      maximumElementComponents: {weaponBase: 0, normalMultiplier: 1, normalFlat: 0, conditionalFlat: 0},
      applied: [], groupPlan: {applied: []}, selfStatePlan: {normal: [], maximum: []}},
    conditions: {standardEvaluation: true, chargeBladeState: clone(state)}, chargeBladeState: state,
    officialPhialType: 'IMPACT', attributeConversionLevel: 0, resistanceConversionLevel: 0, waterEntries: [],
    hasShelling: false, hasReference: false, hhModel: null, switchAxeState: null,
    techniqueKind: 'charge-blade', resolvedTechniqueIds: [...ids], techniques: {}, raw: {}, canonical: {},
    hRule: {prefixIds: ids.slice(0, 2), shieldPhialCount: 1, prefixConsumption: 0},
    dischargeRules: {baseConsumption: 1}, ed1Rule: {axeBoostedConsumptionMultiplier: 0.5},
    ADOPTED_NO_WOUND_EVENT_IDS: new Set(noWoundIds),
    root: {ChargeBladeEngine: {techniques: {}, formulas: {IMPACT_PHIAL: {id: 'CB_IMPACT_PHIAL_V1042'}}},
      MHAirborneHitRule: {name: '飛燕', level: 1, hitIndices: {CB_AED: [], CB_FOLLOWUP_AED: []}}},
    fail: reason => ({status: 'blocked', reason})
  };
  const bodyMvs = [[30], [15, 6], [68], [78]], phials = [0, 1, 2, 3];
  ids.forEach((id, i) => {
    const prefix = i < 2, extra = prefix ? 0 : 4;
    const raw = {weaponType: 'charge-blade', techniqueId: id,
      hits: bodyMvs[i].map(mv => ({mv, elementModifier: 1, damageType: 'slash'})), stateRequirement: {}};
    if (i) raw.phialReference = {
      status: prefix ? 'OWNER_APPROVED_PROVISIONAL' : 'OBSERVED', hitCount: phials[i], eventCount: phials[i],
      // These strings are existing public adapter identities, not loaded fixtures.
      sourceRefs: [prefix ? prefixPhialSource : releasePhialSource]
    };
    f.raw[id] = raw;
    f.canonical[id] = clone(raw);
    f.root.ChargeBladeEngine.techniques[id] = {
      name: 'Synthetic contract double', axeBoostHits: extra ? {count: extra, mv: 12, elementModifier: 0.2} : null,
      shieldBoostAxeBody: !prefix, rapidMorphDamageEligible: i === 0,
      phial: i ? {impactCoefficient: prefix ? 0.05 : 0.16, powerElementCoefficient: prefix ? 1.5 : 4.2,
        ...(!prefix ? {enhancedImpactCoefficient: 0.2, enhancedPowerElementCoefficient: 6} : {}), count: null, verification: 'TODO_COUNT'} : null
    };
    f.techniques[id] = {...clone(raw),
      hits: [...clone(raw.hits), ...Array.from({length: extra}, () => ({mv: 12, elementModifier: 0.2,
        shieldBoostAxeBody: false, componentSource: 'index.html:CHARGE_BLADE_TECHNIQUES.' + id + '.axeBoostHits'}))],
      resourceContract: {techniqueId: id, id: prefix ? 'CB_H_PREFIX_RESOURCE' : 'CB_ED1_NORMAL_RESOURCE',
        status: prefix ? 'OWNER_APPROVED_PROVISIONAL' : 'OWNER_APPROVED', consumeNormalPhials: prefix ? 0 : 0.5,
        resourceKey: 'normalPhials', consumedPhialKind: 'NORMAL',
        requiredPreviousAction: i === 0 ? 'AXE_NEUTRAL' : i === 2 ? 'SHIELD_THRUST' : ids[i - 1],
        requiredMode: i === 0 || i === 3 ? 'AXE' : 'SWORD', endMode: prefix ? 'SWORD' : 'AXE',
        nextPreviousAction: i === 0 ? id : 'SHIELD_THRUST', axeBoosted: true},
      ...(i ? {phialState: {...clone(state), phialTypeSource: 'MHDB:weapon.phial', phialTypeValue: 'impact',
        artilleryStatus: 'PROVISIONALLY_ADOPTED'}} : {})
    };
  });
  f.techniqueDb = {get: (kind, id) => kind === 'charge-blade' ? f.raw[id] : undefined};
  f.root.TechniqueDBEngine = {get: (kind, id) => kind === 'charge-blade' ? f.canonical[id] : undefined};
  return f;
}
function proof(f) { return proofProgram.runInNewContext(f); }
function gate(f) { return clean(gateProgram.runInNewContext(f)); }
function setRank(f, level) { for (const row of [...f.allSkills, ...f.buildSkills, ...f.rawSkills]) row.level = level; }
function addSkill(f, skillId, name, level = 1) {
  const row = {skillId, name, level}; f.allSkills.push(clone(row)); f.buildSkills.push(clone(row));
}
function syncRaw(f, id, mutate) {
  mutate(f.raw[id]); f.canonical[id] = clone(f.raw[id]);
  const extra = f.techniques[id].hits.slice(f.raw[id].hits.length);
  f.techniques[id] = {...f.techniques[id], ...clone(f.raw[id]), hits: [...clone(f.raw[id].hits), ...extra]};
}
function expectBlocked(f, label) {
  assert.equal(proof(f), false, label + ': ordinary proof');
  const result = gate(f);
  assert.equal(result.status, 'blocked', label + ': actual gate');
  assert.match(result.reason, /PARTBREAKER_WOUND_EVENT_SCOPE_PENDING|AIRBORNE_HIT_SCOPE_PENDING/, label);
}

test('CB H: extracted ordinary proof and gates accept only the synthetic adopted envelope', t => {
  let checks = 0;
  for (const skillId of [129, 86]) {
    for (const level of skillId === 129 ? [1, 2, 3] : [1]) {
      const f = fixture(skillId, level);
      assert.equal(proof(f), true); assert.equal(gate(f).status, 'accepted'); assert.deepEqual(gate(f).airborneEffects, []); checks++;
    }
    for (const [skill, name] of [[72, '攻撃'], [47, '砲術'], [7, '高速変形'], [24, 'チャージマスター'], [144, '挑戦者'], [95, '連撃']]) {
      const f = fixture(skillId); addSkill(f, skill, name);
      assert.equal(proof(f), true); assert.equal(gate(f).status, 'accepted'); checks++;
    }
    for (const rank of [1, 2]) for (const count of [rank * 2, 5]) {
      const f = fixture(skillId);
      f.stats.activeBonusEffects = [{bonusSkillId: 173, rankLevel: rank, name: rank === 1 ? 'レゾナンスⅠ' : 'レゾナンスⅡ',
        level: 1, required: rank * 2, count}];
      assert.equal(proof(f), true); assert.equal(gate(f).status, 'accepted'); checks++;
    }
    const rawAndBuild = fixture(skillId); rawAndBuild.rawSkills = [clone(rawAndBuild.allSkills[0])];
    assert.equal(gate(rawAndBuild).status, 'accepted'); checks++;
  }
  const both = fixture(); addSkill(both, 86, '飛燕');
  assert.equal(proof(both), true); assert.equal(gate(both).status, 'accepted'); assert.deepEqual(gate(both).airborneEffects, []); checks++;
  assert.equal(noWoundIds.includes(ids[0]), false); assert.equal(noWoundIds.includes(ids[1]), false); checks++;
  t.diagnostic('checks=' + checks + '; synthetic eligibility only, not co-skill damage validation');
});

test('CB H: state, zero-element, metadata, bonus and producer boundaries stay closed', t => {
  let checks = 0;
  const mutations = [
    ['wrong weapon', f => f.weapon.kind = 'hammer'], ['nonstandard', f => f.conditions.standardEvaluation = false],
    ['power phial', f => f.weapon.phial = 'element'], ['wrong official phial', f => f.officialPhialType = 'POWER_ELEMENT'],
    ['weapon special', f => f.weapon.specials = [{kind: 'element'}]], ['shelling', f => f.hasShelling = true],
    ['reference', f => f.hasReference = true], ['horn model', f => f.hhModel = {}],
    ['attribute conversion', f => f.attributeConversionLevel = 1], ['resistance conversion', f => f.resistanceConversionLevel = 1],
    ['water conversion', f => f.waterEntries = [{}]], ['absorption', f => addSkill(f, 133, '属性吸収')],
    ['missing bonus', f => delete f.stats.activeBonusEffects], ['unknown bonus', f => f.stats.activeBonusEffects = [{}]],
    ['duplicate bonus', f => f.stats.activeBonusEffects = [{}, {}]],
    ['shield explosion count', f => f.hRule.shieldPhialCount = 2], ['prefix consumption', f => f.hRule.prefixConsumption = 1],
    ['release consumption', f => f.dischargeRules.baseConsumption = 2], ['axe resource multiplier', f => f.ed1Rule.axeBoostedConsumptionMultiplier = 1],
    ['impact formula identity', f => f.root.ChargeBladeEngine.formulas.IMPACT_PHIAL.id = 'synthetic-unadopted'],
    ['missing condition state', f => delete f.conditions.chargeBladeState],
    ['reordered route', f => f.resolvedTechniqueIds.reverse()], ['extra technique', f => f.resolvedTechniqueIds.push(ids[0])],
    ['unknown technique', f => f.resolvedTechniqueIds[0] = 'synthetic-unknown']
  ];
  for (const where of ['chargeBladeState', 'conditions.chargeBladeState']) {
    for (const field of ['mode', 'previousAction', 'phialType', 'swordBoosted', 'shieldBoosted', 'axeBoosted', 'enhancedPhial', 'enhancedPhials', 'normalPhials'])
      mutations.push([where + '.' + field, f => {const s = where.includes('.') ? f.conditions.chargeBladeState : f.chargeBladeState; s[field] = 'synthetic-unknown';}]);
    mutations.push([where + ' extra property', f => {const s = where.includes('.') ? f.conditions.chargeBladeState : f.chargeBladeState; s.unmodeled = true;}]);
  }
  for (const where of ['stats', 'normal', 'maximum']) {
    for (const [field, value] of [['element', 1], ['element', NaN], ['elementType', 'fire'], ['elementKnown', false], ['typeKnown', false], ['elementStatus', 'UNKNOWN']])
      mutations.push([where + '.' + field, f => (where === 'stats' ? f.stats : f.resolvedConditionPlan[where])[field] = value]);
    for (const [field, value] of [['weaponBase', 1], ['normalFlat', 1], ['normalMultiplier', NaN], ['normalMultiplier', 0]])
      mutations.push([where + ' components.' + field, f => (where === 'stats' ? f.stats : f.resolvedConditionPlan[where]).elementComponents[field] = value]);
  }
  for (const field of ['weaponBase', 'normalFlat', 'conditionalFlat']) mutations.push(['maximum components.' + field, f => f.resolvedConditionPlan.maximumElementComponents[field] = 1]);
  for (const where of ['conditions', 'stats', 'chargeBladeState', 'normal', 'maximum']) {
    for (const field of ['damageStatsState', 'stateStatsByState', 'damageStateTransition', 'hpOnlyProvisional', 'specialSourceValues'])
      mutations.push([where + '.' + field, f => (['normal', 'maximum'].includes(where) ? f.resolvedConditionPlan[where] : f[where])[field] = {}]);
    for (const field of ['jumpAttack', 'jumping', 'airborne', 'mounted', 'dismountAttack', 'sneakAttack', 'focusAttack', 'woundDestruction', 'woundEvent'])
      mutations.push([where + '.' + field, f => (['normal', 'maximum'].includes(where) ? f.resolvedConditionPlan[where] : f[where])[field] = true]);
  }
  for (const where of ['applied', 'group', 'normal', 'maximum']) for (const value of [1, NaN])
    mutations.push([where + ' element producer', f => (where === 'applied' ? f.resolvedConditionPlan.applied : where === 'group' ?
      f.resolvedConditionPlan.groupPlan.applied : f.resolvedConditionPlan.selfStatePlan[where]).push({elementAdd: value})]);
  for (const field of ['bonusSkillId', 'rankLevel', 'name', 'level', 'required', 'count'])
    mutations.push(['Omega.' + field, f => {f.stats.activeBonusEffects = [{bonusSkillId: 173, rankLevel: 1, name: 'レゾナンスⅠ', level: 1, required: 2, count: 2}];f.stats.activeBonusEffects[0][field] = 'synthetic-unknown';}]);
  for (const skillId of [129, 86]) for (const [label, mutate] of mutations) {
    const f = fixture(skillId); mutate(f); expectBlocked(f, names[skillId] + ': ' + label); checks++;
  }
  t.diagnostic('checks=' + checks + '; each asserts proof=false plus the actual retained scope blocker');
});

test('CB H: record, generated-hit, phial and resource identities are not broad ID permission', t => {
  let checks = 0;
  for (const skillId of [129, 86]) for (const id of ids) {
    const mutations = [];
    for (const [field, value] of [['techniqueId', 'synthetic-other'], ['weaponType', 'hammer'], ['damageStatsState', {}], ['stateStatsByState', {}],
      ['damageStateTransition', {}], ['hpOnlyProvisional', {}], ['referenceKind', 'synthetic-other'], ['saAwakened', {}], ['glModel', {}],
      ['specialComponents', ['synthetic-extra']], ['excludedComponents', ['synthetic-extra']], ['specialSourceValues', {}],
      ['jumpAttack', true], ['focusAttack', true], ['woundEvent', true]])
      mutations.push(['record.' + field, f => f.techniques[id][field] = value]);
    for (const [field, value] of [['mv', NaN], ['elementModifier', 2], ['damageType', 'blunt'], ['componentSource', 'synthetic-other'],
      ['component', 'synthetic-extra'], ['damageStatsState', {}], ['stateStatsByState', {}], ['jumpAttack', true]])
      mutations.push(['body.' + field, f => f.techniques[id].hits[0][field] = value]);
    mutations.push(['raw/canonical mismatch', f => f.raw[id].hits[0].mv++]);
    mutations.push(['coordinated raw/canonical/body MV change', f => syncRaw(f, id, raw => raw.hits[0].mv++)]);
    mutations.push(['coordinated state requirement', f => syncRaw(f, id, raw => raw.stateRequirement = {jumpAttack: true})]);
    mutations.push(['extra body', f => f.techniques[id].hits.push({mv: 1, elementModifier: 1})]);
    mutations.push(['missing producer', f => delete f.root.ChargeBladeEngine.techniques[id]]);
    for (const field of ['id', 'techniqueId', 'status', 'consumeNormalPhials', 'resourceKey', 'consumedPhialKind', 'requiredPreviousAction', 'requiredMode', 'endMode'])
      mutations.push(['resource.' + field, f => f.techniques[id].resourceContract[field] = 'synthetic-other']);
    for (const field of ['specialComponents', 'excludedComponents', 'stateStatsByState', 'woundEvent'])
      mutations.push(['resource metadata.' + field, f => f.techniques[id].resourceContract[field] = field.includes('Components') ? ['synthetic-extra'] : true]);
    mutations.push(['producer metadata', f => f.root.ChargeBladeEngine.techniques[id].specialComponents = ['synthetic-extra']]);
    mutations.push(['producer shield selection', f => f.root.ChargeBladeEngine.techniques[id].shieldBoostAxeBody = !f.root.ChargeBladeEngine.techniques[id].shieldBoostAxeBody]);
    mutations.push(['producer rapid-morph selection', f => f.root.ChargeBladeEngine.techniques[id].rapidMorphDamageEligible = !f.root.ChargeBladeEngine.techniques[id].rapidMorphDamageEligible]);
    if (id === ids[0]) {
      mutations.push(['injected phial', f => f.techniques[id].phialReference = {hitCount: 1}]);
      mutations.push(['injected generated producer', f => f.root.ChargeBladeEngine.techniques[id].axeBoostHits = {count: 1, mv: 12, elementModifier: 0.2}]);
    } else {
      for (const field of ['hitCount', 'eventCount', 'status', 'sourceRefs'])
        mutations.push(['phial reference.' + field, f => f.techniques[id].phialReference[field] = 'synthetic-other']);
      for (const field of ['normalPhials', 'phialTypeSource', 'phialTypeValue', 'artilleryStatus', 'damageStatsState'])
        mutations.push(['phial state.' + field, f => f.techniques[id].phialState[field] = 'synthetic-other']);
      for (const field of ['impactCoefficient', 'powerElementCoefficient', 'count', 'verification'])
        mutations.push(['phial producer.' + field, f => f.root.ChargeBladeEngine.techniques[id].phial[field] = 'synthetic-other']);
      mutations.push(['coordinated phial source', f => {syncRaw(f, id, raw => raw.phialReference.sourceRefs = ['synthetic-other']);}]);
    }
    if (id === ids[2] || id === ids[3]) {
      for (const field of ['count', 'mv', 'elementModifier'])
        mutations.push(['axe producer.' + field, f => f.root.ChargeBladeEngine.techniques[id].axeBoostHits[field]++]);
      for (const [field, value] of [['mv', 13], ['elementModifier', 0.3], ['shieldBoostAxeBody', true],
        ['componentSource', 'synthetic-other'], ['specialComponents', ['synthetic-extra']], ['jumpAttack', true]])
        mutations.push(['generated.' + field, f => f.techniques[id].hits[1][field] = value]);
    }
    for (const [label, mutate] of mutations) {
      const f = fixture(skillId); mutate(f); expectBlocked(f, names[skillId] + ': ' + id + ' ' + label); checks++;
    }
  }
  t.diagnostic('checks=' + checks + '; frozen identities only, not coefficient approval');
});

test('CB H: actual skill gates reject malformed identities without relaxing unrelated guards', t => {
  let checks = 0;
  for (const skillId of [129, 86]) {
    const mutations = [
      ['wrong raw ID', f => f.rawSkills = [{skillId: -1, name: names[skillId], level: 1}]],
      ['wrong raw name', f => f.rawSkills = [{skillId, name: 'synthetic-other', level: 1}]],
      ['duplicate raw', f => f.rawSkills = [clone(f.allSkills[0]), clone(f.allSkills[0])]],
      ['duplicate build', f => f.buildSkills.push(clone(f.buildSkills[0]))],
      ['rank zero', f => setRank(f, 0)], ['rank above limit', f => setRank(f, skillId === 129 ? 4 : 2)],
      ['rank fractional', f => setRank(f, 0.5)],
      ['conflicting representation rank', f => f.rawSkills = [{skillId, name: names[skillId], level: 2}]]
    ];
    for (const [label, mutate] of mutations) {
      const f = fixture(skillId); mutate(f); const result = gate(f);
      assert.equal(result.status, 'blocked', label); assert.match(result.reason, /PARTBREAKER_WOUND_EVENT_SCOPE_PENDING|AIRBORNE_(SKILL_CONTRACT_INVALID|HIT_SCOPE_PENDING)/); checks++;
    }
    const f = fixture(skillId); f.allSkills = []; f.buildSkills = [];
    assert.equal(proof(f), false, 'No skill does not acquire the special scope'); checks++;
  }
  const both = fixture(); addSkill(both, 86, '飛燕'); both.buildSkills.push({skillId: 86, name: '飛燕', level: 1});
  assert.equal(gate(both).reason, 'REAL_SLICE:AIRBORNE_HIT_SCOPE_PENDING:CB_AXE_TO_SWORD_MORPH'); checks++;
  const pending = fixture(); pending.resolvedConditionPlan.pending = ['SYNTHETIC_UNRELATED_PENDING'];
  assert.equal(gate(pending).status, 'accepted'); assert.deepEqual(pending.resolvedConditionPlan.pending, ['SYNTHETIC_UNRELATED_PENDING']); checks++;
  t.diagnostic('checks=' + checks + '; extracted gates do not consume or resolve unrelated pending entries');
});

test('CB H: legacy Partbreaker extraction remains usable without the new proof variable', t => {
  const f = fixture();
  const blocked = clean(legacyPartbreakerProgram.runInNewContext(f));
  assert.equal(blocked.status, 'blocked'); assert.equal(blocked.reason, 'REAL_SLICE:PARTBREAKER_WOUND_EVENT_SCOPE_PENDING');
  f.weapon.kind = 'sword-shield'; f.techniqueKind = 'sword-and-shield'; f.resolvedTechniqueIds = ['SNS_DOWNWARD_SLASH'];
  f.techniques = {SNS_DOWNWARD_SLASH: {techniqueId: 'SNS_DOWNWARD_SLASH', weaponType: 'sword-and-shield', hits: [{mv: 1, elementModifier: 1}]}};
  const accepted = clean(legacyPartbreakerProgram.runInNewContext(f));
  assert.equal(accepted.status, 'accepted'); assert.equal(accepted.partbreaker, false);
  t.diagnostic('checks=2; adapterSha256=' + crypto.createHash('sha256').update(source).digest('hex'));
});
