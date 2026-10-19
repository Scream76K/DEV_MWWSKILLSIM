/* Independent implementation. No game coefficients or third-party code copied.
 * Browser: window.CommonDamageCore; Node: module.exports.
 * Integration base, NOT a declaration that all MH effects are implemented.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CommonDamageCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const copy = value => structuredClone(value);
  const fail = (code, detail) => { throw new Error(code + ': ' + detail); };
  const number = (value, label) => {
    if (!Number.isFinite(value)) fail('INVALID_NUMBER', label);
    return value;
  };
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  // Three-valued conditions: missing data is unknown, never implicitly false.
  // A known false member makes ALL false even if another member is unknown.
  function condition(rule, facts) {
    if (typeof rule === 'boolean') return rule;
    if (!rule || typeof rule !== 'object') fail('INVALID_CONDITION', 'Explicit rule required');
    if (owns(rule, 'all') || owns(rule, 'any')) {
      const all = owns(rule, 'all');
      const members = all ? rule.all : rule.any;
      if (!Array.isArray(members) || !members.length) fail('INVALID_CONDITION', 'Empty group');
      const results = members.map(item => condition(item, facts));
      if (results.includes(all ? false : true)) return !all;
      if (results.includes(null)) return null;
      return all;
    }
    if (owns(rule, 'not')) {
      const value = condition(rule.not, facts);
      return value === null ? null : !value;
    }
    if (typeof rule.fact !== 'string' || !owns(rule, 'equals')) fail('INVALID_CONDITION', 'fact / equals');
    return owns(facts, rule.fact) ? facts[rule.fact] === rule.equals : null;
  }

  function resolveEffects(skills, adapter, context) {
    const effects = [], excluded = [], seenSkills = new Set(), seenEffects = new Set();
    for (const skill of skills) {
      if (!skill.id || !Number.isInteger(skill.level) || skill.level < 0) fail('INVALID_SKILL', skill.id);
      if (seenSkills.has(skill.id)) fail('DUPLICATE_SKILL', skill.id);
      seenSkills.add(skill.id);
      if (!skill.level) continue;
      const result = adapter.effectsFor(skill.id, skill.level, copy(context));
      if (result && result.excluded === true && result.reason) {
        excluded.push({id:skill.id, reason:result.reason});
        continue;
      }
      if (!Array.isArray(result) || !result.length) fail('UNRESOLVED_SKILL', skill.id);
      for (const effect of copy(result)) {
        if (!effect.id || seenEffects.has(effect.id)) fail('DUPLICATE_EFFECT', effect.id);
        if (!['stats','damage'].includes(effect.phase)) fail('INVALID_PHASE', effect.id);
        number(effect.order, effect.id + '.order');
        if (!Array.isArray(effect.operations) || !effect.operations.length) fail('EMPTY_EFFECT', effect.id);
        seenEffects.add(effect.id);
        effects.push(effect);
      }
    }
    effects.sort((a,b) => a.order-b.order || a.id.localeCompare(b.id));
    return {effects,excluded};
  }

  function applyEffects(input, effects, phase, facts, trace) {
    const state = copy(input);
    for (const effect of effects.filter(item => item.phase === phase)) {
      const active = condition(effect.when, facts);
      if (active === null) fail('UNKNOWN_CONDITION', effect.id);
      trace.push({id:effect.id,phase,active});
      if (!active) continue;
      for (const operation of effect.operations) {
        const {target,op} = operation;
        if (!owns(state,target)) fail('UNKNOWN_TARGET', target);
        const current=number(state[target], target);
        if (op === 'clamp') {
          const min=number(operation.min,'min'), max=number(operation.max,'max');
          if (min > max) fail('INVALID_BOUNDS', target);
          state[target]=Math.max(min,Math.min(max,current));
        } else {
          const value=owns(operation,'from')
            ? number(state[operation.from],operation.from)
            : number(operation.value,'value');
          if (op === 'add') state[target]=current+value;
          else if (op === 'multiply') state[target]=current*value;
          else if (op === 'set') state[target]=value;
          else fail('UNKNOWN_OPERATION',op);
        }
        number(state[target], target);
      }
    }
    return state;
  }

  function evaluate(source, adapter) {
    for (const key of ['effectsFor','finalizeStats','calculateHit','finalizeHit','finalizeAggregate']) {
      if (typeof adapter[key] !== 'function') fail('MISSING_ADAPTER',key);
    }
    const input=copy(source);
    if (!Array.isArray(input.skills) || !Array.isArray(input.hits) || !input.hits.length) fail('INVALID_INPUT','skills / hits');
    const context={facts:input.facts || {},baseStats:input.baseStats,scenario:input.scenario};
    const {effects,excluded}=resolveEffects(input.skills,adapter,context);
    const hits=input.hits.map((hit,index) => {
      for (const key of Object.keys(hit.facts || {})) {
        if (owns(context.facts,key)) fail('FACT_COLLISION',key);
      }
      const facts={...context.facts,...hit.facts},trace=[];
      const stats=adapter.finalizeStats(applyEffects(input.baseStats,effects,'stats',facts,trace),copy({facts,hit}));
      const calculated=adapter.calculateHit(copy({stats,hit,facts,scenario:input.scenario}));
      const result=adapter.finalizeHit(applyEffects(calculated,effects,'damage',facts,trace),copy({stats,hit,facts}));
      const physical=number(result.physical,'physical'),elemental=number(result.elemental,'elemental');
      return {index,physical,elemental,total:physical+elemental,trace};
    });
    const summed=hits.reduce((sum,hit)=>({physical:sum.physical+hit.physical,elemental:sum.elemental+hit.elemental}),{physical:0,elemental:0});
    const result=adapter.finalizeAggregate(copy(summed),copy({hits,scenario:input.scenario}));
    const physical=number(result.physical,'aggregate physical'),elemental=number(result.elemental,'aggregate elemental');
    const total=physical+elemental;
    const seconds=input.durationSeconds;
    if (seconds != null && (!Number.isFinite(seconds) || seconds <= 0)) fail('INVALID_DURATION','durationSeconds');
    return {physical,elemental,total,dps:seconds == null ? null : total/seconds,hits,excluded};
  }
  function ordinaryHit({stats,hit}) {
    const product=(items,label)=>items.reduce((value,item)=>value*number(item,label),1);
    return {
      physical:product([stats.attack,hit.motionRatio,hit.physicalHitzoneRatio,
        hit.physicalSharpness,hit.physicalMultiplier],'physical input'),
      elemental:product([stats.element,hit.elementRatio,hit.elementHitzoneRatio,
        hit.elementSharpness,hit.elementMultiplier],'element input')
    };
  }
  function expectedHit(raw,branches,policy) {
    if (!Array.isArray(branches) || !branches.length || typeof policy !== 'function') fail('INVALID_CRIT_POLICY','branches / policy');
    let probability=0,physical=0,elemental=0;
    for (const branch of branches) {
      const p=number(branch.probability,'probability');
      if (p<0 || p>1) fail('INVALID_PROBABILITY',p);
      probability+=p;
      const resolved=policy({
        physical:number(raw.physical,'physical')*number(branch.physicalMultiplier,'crit physical multiplier'),
        elemental:number(raw.elemental,'elemental')*number(branch.elementMultiplier,'crit element multiplier')
      },copy(branch));
      physical+=number(resolved.physical,'resolved physical')*p;
      elemental+=number(resolved.elemental,'resolved element')*p;
    }
    if (Math.abs(probability-1)>1e-10) fail('INVALID_PROBABILITY_SUM',probability);
    return {physical,elemental};
  }
  // Normalized probability and branch multipliers are supplied by the adapter.
  // There are no game-specific coefficients or rounding defaults here.
  function affinityBranches({chance,positivePhysical,negativePhysical,positiveElement,negativeElement}) {
    number(chance,'affinity chance');
    if(chance < -1 || chance > 1) fail('INVALID_PROBABILITY','affinity chance');
    const probability=Math.abs(chance);
    return [
      {kind:'NON_CRITICAL',probability:1-probability,physicalMultiplier:1,elementMultiplier:1},
      {kind:chance<0?'NEGATIVE_CRITICAL':'POSITIVE_CRITICAL',probability,
       physicalMultiplier:number(chance<0?negativePhysical:positivePhysical,'physical critical'),
       elementMultiplier:number(chance<0?negativeElement:positiveElement,'element critical')}
    ];
  }
  return Object.freeze({condition,applyEffects,resolveEffects,evaluate,ordinaryHit,expectedHit,affinityBranches});
});
