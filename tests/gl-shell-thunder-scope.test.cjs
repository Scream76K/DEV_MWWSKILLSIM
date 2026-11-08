'use strict';
// Synthetic predicate/filter tests only. No actual armor records or damage results.
// The DB, bonus readers, Artia detector, affinity producer and shell calculators
// below are explicit test doubles, not independent producer verification.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const productRoot = process.env.PRODUCT_ROOT || path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(productRoot, 'hope-hammer-browser-adapter.js'), 'utf8');
const start = source.indexOf('  const shellThunderBonusRelated=');
const end = source.indexOf('  const shellingInput=', start);
const formulaStart = source.indexOf('   shellingFormula:hasShelling?');
const formulaEnd = source.indexOf(',\n   phialFormula:', formulaStart);
const available = start >= 0 && end > start && formulaStart >= 0 && formulaEnd > formulaStart;
const body = available ? source.slice(start, end) : '';
const formula = available ? source.slice(formulaStart + '   shellingFormula:'.length, formulaEnd) : '';
test('GL Thunder: synthetic production predicate boundary checks', t => {
  let assertions = 0;
    assert.ok(available, 'GL Thunder predicate or shell formula boundaries missing from the selected adapter');
  assertions++;

  const slots = ['head', 'chest', 'arms', 'waist', 'legs'];
  function input(rank = 1, count = rank === 1 ? 2 : 4) {
    const name = rank === 1 ? '蒼雷一閃Ⅰ' : '蒼雷一閃Ⅱ';
    const entry = {skillId: 162, name, level: 1, skillKey: 'unknown'};
    const activation = {
      bonusSkillId: 162, name, level: 1, bonusName: '海竜の渦雷', source: 'series',
      displayType: 'series', rankLevel: rank, required: rank === 1 ? 2 : 4, count,
    };
    const annotation = {
      skillId: 162, skill: name, parent: '海竜の渦雷', rank, attackAdd: 0, attackMultiplier: 1,
      bonusSource: true, appliesToNormal: true, annotationOnly: true, bodyEffect: true,
      policy: 'FIXED_DAMAGE_SKILL_ANNOTATION_ONLY', condition: 'EXTRA_DAMAGE_EXCLUDED_BODY_EFFECT_RETAINED',
      evidenceRef: 'MHDB_JA_SKILLS_20261026:162', numericOrigin: 'ANNOTATION_FORMULA_NOT_ADOPTED',
      excludedComponents: ['FIXED', 'THUNDER'], annotationActivation: {...activation},
    };
    const f = {
      entry, weapon: {kind: 'gunlance', shell: 'NORMAL', shellLevel: 1},
      allSkills: [entry], skills: [[name, 1]], activeBonusEffects: [activation],
      conditions: {}, target: {part: 'synthetic-part'}, trainingRoom: {parts: [{id: 'synthetic-part'}]},
      db: {armor: slots.map((slot, index) => ({
        id: `synthetic-${slot}`, kind: slot, resistances: {thunder: 1},
        syntheticOwn: index < count ? [{id: 162, name: '海竜の渦雷'}] : [],
        armorSet: {syntheticBonuses: []},
      }))},
      stats: {
        affinityKnown: true, affinity: 10, maxAffinity: 20,
        armorThunderResistanceInput: {
          status: 'ARMOR_BASE_ONLY', missing: [], armorBase: 5,
          rows: slots.map(slot => ({
            slot, equipped: true, id: `synthetic-${slot}`, value: 1,
            sourceUrl: `https://wilds.mhdb.io/ja/armor/synthetic-${slot}`,
          })),
        },
        conditionalConditionPlan: {
          normal: {affinity: 10, maxAffinity: 20}, maximum: {affinity: 10, maxAffinity: 20},
          applied: [structuredClone(annotation)],
          groupPlan: {
            status: 'SOURCE_REFERENCE', scope: 'GENERIC_STANDARD_POWER_ONLY',
            unresolvedEffects: [], nonDamageEffects: [], applied: [structuredClone(annotation)],
          },
        },
      },
    };
    f.root = {
      MHSkillExtraDamagePolicies: {162: {name: '海竜の渦雷', maxLevel: 2, bodyEffect: true, components: ['FIXED', 'THUNDER']}},
      __getBetaDB: () => f.db,
      isArtia: () => false,
      armorBonusSkillObjects: (armor, type) => type === 'series' ? armor.syntheticOwn : [],
      bonusSkillObjects: (set, type) => type === 'series' ? (set?.syntheticBonuses || []) : [],
      groupSetData: armor => armor.armorSet,
      // Deliberately constant: tests validate agreement checks, not affinity arithmetic.
      MHWMaxAffinityResolver: () => 20,
    };
    return f;
  }
  function check(name, mutate, expected = false, rank = 1, count) {
    const f = input(rank, count);
    mutate(f);
    assert.equal(vm.runInNewContext(body + '\nshellThunderBonusResolved(entry);', f), expected, name);
    assertions++;
  }
  for (const [rank, count] of [[1, 2], [1, 3], [2, 4], [2, 5]])
    check(`accepts rank ${rank} with ${count} corroborated armor pieces`, () => {}, true, rank, count);
  check('allows missing aggregate ID with exact rank name', f => delete f.entry.skillId, true);
  check('accepts fallback set bonus provenance', f => {
    for (const armor of f.db.armor) {
      armor.armorSet.syntheticBonuses = armor.syntheticOwn;
      armor.syntheticOwn = [];
    }
  }, true);
  check('counts own and fallback evidence once per armor piece', f => {
    for (const armor of f.db.armor) armor.armorSet.syntheticBonuses = [...armor.syntheticOwn];
  }, true);
  check('accepts a well-formed unequipped nonbonus slot', f => {
    Object.assign(f.stats.armorThunderResistanceInput.rows[4], {equipped: false, id: null, value: 0});
    f.stats.armorThunderResistanceInput.armorBase = 4;
  }, true);
  for (const [name, mutate] of [
    ['unranked name', f => f.entry.name = '蒼雷一閃'],
    ['parent name', f => f.entry.name = '海竜の渦雷'],
    ['wrong skill ID', f => f.entry.skillId = 0],
    ['rank zero', f => f.entry.level = 0], ['rank two', f => f.entry.level = 2],
    ['wrong skill key', f => f.entry.skillKey = 'attack'],
    ['no aggregate skill', f => f.allSkills = []],
    ['duplicate aggregate skill', f => f.allSkills.push({...f.entry})],
    ['missing policy', f => delete f.root.MHSkillExtraDamagePolicies],
    ['wrong policy name', f => f.root.MHSkillExtraDamagePolicies[162].name = 'synthetic-unknown'],
    ['wrong policy rank', f => f.root.MHSkillExtraDamagePolicies[162].maxLevel = 1],
    ['missing retained body effect', f => f.root.MHSkillExtraDamagePolicies[162].bodyEffect = false],
    ['reordered excluded components', f => f.root.MHSkillExtraDamagePolicies[162].components.reverse()],
    ['additional excluded component', f => f.root.MHSkillExtraDamagePolicies[162].components.push('synthetic-extra')],
    ['nonarray excluded components', f => f.root.MHSkillExtraDamagePolicies[162].components = {}],
    ['missing input skill', f => f.skills = []],
    ['duplicate input skill', f => f.skills.push([...f.skills[0]])],
    ['wrong input name', f => f.skills[0][0] = '海竜の渦雷'],
    ['wrong input rank', f => f.skills[0][1] = 2],
    ['missing activation', f => f.activeBonusEffects = []],
    ['duplicate activation', f => f.activeBonusEffects.push({...f.activeBonusEffects[0]})],
    ['missing Artia detector', f => delete f.root.isArtia],
    ['Artia weapon', f => f.root.isArtia = () => true],
    ['Artia calculation evidence', f => f.weapon.artiaCalculationEvidence = {}],
    ['missing armor reader', f => delete f.root.__getBetaDB],
    ['invalid armor collection', f => f.db.armor = {}],
    ['missing own-bonus reader', f => delete f.root.armorBonusSkillObjects],
    ['missing fallback-bonus reader', f => delete f.root.bonusSkillObjects],
    ['missing group-set reader', f => delete f.root.groupSetData],
  ]) check(`rejects ${name}`, mutate);
  for (const [field, value] of [
    ['bonusSkillId', '162'], ['name', '蒼雷一閃Ⅱ'], ['level', 2], ['bonusName', 'synthetic-unknown'],
    ['source', 'synthetic-source'], ['displayType', 'synthetic-display'], ['rankLevel', 2], ['required', 4],
    ['count', 1], ['count', 2.5], ['count', 4],
  ]) check(`rejects activation ${field}=${value}`, f => f.activeBonusEffects[0][field] = value);
  check('rank two rejects fewer than four pieces', () => {}, false, 2, 3);
  check('rank two rejects a count above five-slot provenance', () => {}, false, 2, 6);
  for (const [name, mutate] of [
    ['missing armor input', f => delete f.stats.armorThunderResistanceInput],
    ['wrong armor status', f => f.stats.armorThunderResistanceInput.status = 'synthetic-status'],
    ['unknown armor input', f => f.stats.armorThunderResistanceInput.missing.push('synthetic-missing')],
    ['nonarray missing list', f => f.stats.armorThunderResistanceInput.missing = {}],
    ['nonarray armor rows', f => f.stats.armorThunderResistanceInput.rows = {}],
    ['missing slot', f => f.stats.armorThunderResistanceInput.rows.pop()],
    ['duplicate slot', f => f.stats.armorThunderResistanceInput.rows[4].slot = 'head'],
    ['nonboolean equipped flag', f => f.stats.armorThunderResistanceInput.rows[0].equipped = 1],
    ['unequipped row retaining an ID', f => f.stats.armorThunderResistanceInput.rows[4].equipped = false],
    ['unequipped row retaining resistance', f => Object.assign(f.stats.armorThunderResistanceInput.rows[4], {equipped: false, id: null})],
    ['missing armor record', f => f.db.armor.shift()],
    ['duplicate armor record', f => f.db.armor.push({...f.db.armor[0]})],
    ['wrong armor kind', f => f.db.armor[0].kind = 'legs'],
    ['wrong source URL', f => f.stats.armorThunderResistanceInput.rows[0].sourceUrl = 'https://example.invalid/synthetic-armor'],
    ['nonfinite resistance', f => f.stats.armorThunderResistanceInput.rows[0].value = NaN],
    ['resistance disagreement', f => f.stats.armorThunderResistanceInput.rows[0].value = 2],
    ['missing armor resistance', f => delete f.db.armor[0].resistances],
    ['wrong bonus identity', f => f.db.armor[0].syntheticOwn[0].id = 0],
    ['wrong bonus name', f => f.db.armor[0].syntheticOwn[0].name = 'synthetic-unknown'],
    ['count disagreement', f => f.db.armor[2].syntheticOwn.push({id: 162, name: '海竜の渦雷'})],
    ['armor total disagreement', f => f.stats.armorThunderResistanceInput.armorBase = 6],
  ]) check(`rejects ${name}`, mutate);
  for (const [name, mutate] of [
    ['missing condition plan', f => delete f.stats.conditionalConditionPlan],
    ['wrong group status', f => f.stats.conditionalConditionPlan.groupPlan.status = 'synthetic-status'],
    ['wrong group scope', f => f.stats.conditionalConditionPlan.groupPlan.scope = 'synthetic-scope'],
    ['unresolved group effect', f => f.stats.conditionalConditionPlan.groupPlan.unresolvedEffects.push({})],
    ['nonarray unresolved effects', f => f.stats.conditionalConditionPlan.groupPlan.unresolvedEffects = {}],
    ['nonarray non-damage effects', f => f.stats.conditionalConditionPlan.groupPlan.nonDamageEffects = {}],
    ['related non-damage effect ID', f => f.stats.conditionalConditionPlan.groupPlan.nonDamageEffects.push({bonusSkillId: 162})],
    ['related non-damage effect name', f => f.stats.conditionalConditionPlan.groupPlan.nonDamageEffects.push({name: '蒼雷一閃Ⅰ'})],
    ['unknown affinity', f => f.stats.affinityKnown = false],
    ['nonfinite normal affinity', f => f.stats.affinity = NaN],
    ['nonfinite maximum affinity', f => f.stats.maxAffinity = Infinity],
    ['out-of-range normal affinity', f => f.stats.affinity = -101],
    ['out-of-range maximum affinity', f => f.stats.maxAffinity = 101],
    ['missing affinity resolver', f => delete f.root.MHWMaxAffinityResolver],
    ['disagreeing affinity resolver', f => f.root.MHWMaxAffinityResolver = () => 21],
    ['throwing affinity resolver', f => f.root.MHWMaxAffinityResolver = () => { throw Error('synthetic-failure'); }],
  ]) check(`rejects ${name}`, mutate);
  for (const channel of ['normal', 'maximum']) for (const field of ['affinity', 'maxAffinity'])
    check(`rejects ${channel}.${field} disagreement`, f => f.stats.conditionalConditionPlan[channel][field] = 11);
  for (const location of ['group', 'plan']) {
    const select = f => location === 'group' ? f.stats.conditionalConditionPlan.groupPlan : f.stats.conditionalConditionPlan;
    check(`rejects missing ${location} annotation`, f => select(f).applied = []);
    check(`rejects duplicate ${location} annotation`, f => select(f).applied.push({...select(f).applied[0]}));
    for (const [field, value] of [
      ['skillId', 0], ['skill', 'synthetic-unknown'], ['parent', 'synthetic-unknown'], ['rank', 2],
      ['attackAdd', 1], ['attackMultiplier', 1.1], ['bonusSource', false], ['appliesToNormal', false],
      ['annotationOnly', false], ['bodyEffect', false], ['policy', 'synthetic-policy'],
      ['condition', 'synthetic-condition'], ['evidenceRef', 'synthetic-evidence'],
      ['numericOrigin', 'synthetic-origin'], ['excludedComponents', ['THUNDER', 'FIXED']],
      ['excludedComponents', ['FIXED']], ['excludedComponents', {}], ['annotationActivation', {}],
      ['syntheticExtraField', true],
    ]) check(`rejects ${location} annotation ${field}=${JSON.stringify(value)}`, f => select(f).applied[0][field] = value);
    for (const field of ['bonusSkillId', 'name', 'level', 'bonusName', 'source', 'displayType', 'rankLevel', 'required', 'count'])
      check(`rejects ${location} annotation activation mismatch ${field}`, f => select(f).applied[0].annotationActivation[field] = 'synthetic-mismatch');
  }

  // Exercise both real shellingFormula filter call sites. Calculators return a
  // synthetic constant; the asserted contract is the names forwarded by production.
  for (const route of ['ordinary', 'target']) for (const channel of ['normal', 'maximum']) for (const resolved of [true, false]) {
    {
      const caseName = `${route} ${channel} ${resolved ? 'releases validated' : 'retains unresolved'} bonus name`;
      const f = input();
      if (!resolved) f.stats.maxAffinity = 21;
      let forwarded;
      const calculate = args => { forwarded = args.unreviewedSkills; return {total: 1}; };
      Object.assign(f.root, {
        GunlanceShellReference: {calculate, calculateTargetComponent: calculate},
        TechniqueDBEngine: {}, MHWGenericProfileDamage: () => {},
      });
      Object.assign(f, {
        hasShelling: true, resolvedTechniqueIds: ['synthetic-shell'],
        cornpopperEntries: [], guardEntries: [], cornpopperRule: {level: 1}, blackEclipse: false,
        gogPlan: {skill: f.entry.name}, adoptedBonusAttackName: () => true,
      });
      const shellingFormula = vm.runInNewContext(body + '\n(' + formula + ');', f);
      const shellingInput = {unreviewedSkills: [f.entry.name], shellingState: {}};
      const parameters = route === 'target'
        ? {glTarget: {model: {input: shellingInput}}}
        : {shellingAction: 'NORMAL', shellingInput};
      const result = shellingFormula({parameters, stats: {attack: 1, attackComponents: {}}, state: {}, channel});
      assert.deepEqual({status: result.status, forwarded: Array.from(forwarded)}, {
        status: 'available', forwarded: resolved ? [] : [f.entry.name],
      }, caseName);
      assertions++;
    }
  }

  t.diagnostic(`assertions=${assertions}; synthetic-only predicate evidence, not browser or live-game verification`);
});
