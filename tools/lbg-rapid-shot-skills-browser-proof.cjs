'use strict';
// Disposable local Chromium proof. No user profiles, live services, DB writes, or prototype patches.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const crypto = require('node:crypto'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(process.argv[2] || '.');
const out = path.resolve(process.argv[3] || '../evidence/lbg-rapid-shot-skills-20261111/browser');
const fixture = 'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json';
const files = ['index.html', 'hope-hammer-browser-adapter.js', 'bowgun-normal-reference.js', 'himmel-real-browser-bundle.js', 'v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs', fixture, 'tools/lbg-rapid-shot-skills-browser-proof.cjs'];
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
const report = {
 scope: 'REAL_CHROMIUM_STANDARD_RAPID_FIRST_140_FORCE_137',
 gameAccuracy: 'Not established: adopted source-reference coefficients, not live-game verification.',
 hashes: Object.fromEntries(files.map(f => [f, hash(f)])), cases: [], failures: [], pageErrors: [], blockedRequests: [],
 liveGameVerification: 'PENDING', sourceVersion: 'UNVERIFIED',
};
const near = (a, b, label = '') => assert.ok(Number.isFinite(a) && Math.abs(a - b) < 1e-8, `${label}: ${a} != ${b}`);
const traces = r => r.components.flatMap(c => c.details?.trace || []);
const totals = r => Object.fromEntries(['normal', 'maximum'].map(ch => [ch, r.channels[ch].metrics.comboTotalDamage.value]));
const summary = r => ({ status: r.status, reason: r.reason, selection: r.evaluationPlan?.selection, channels: r.channels && Object.fromEntries(['normal', 'maximum'].map(ch => [ch, { total: r.channels[ch].metrics.comboTotalDamage.value, traces: traces(r.channels[ch]), diagnostics: r.channels[ch].diagnostics }])) });
fs.mkdirSync(out, { recursive: true });
(async () => {
 const server = http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname;
  const p = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  if (!p.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404).end(); return; } res.setHeader('Content-Type', p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') ? 'application/json' : p.endsWith('.png') ? 'image/png' : 'text/html'); res.end(b); });
 });
 await new Promise(r => server.listen(0, '127.0.0.1', r));
 const base = 'http://127.0.0.1:' + server.address().port;
 let browser;
 try {
  browser = await chromium.launch({ headless: true });
  report.browserVersion = browser.version();
  // newPage creates an isolated, ephemeral context. No existing browser profile is opened.
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on('pageerror', e => report.pageErrors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route('**/*', r => { if (r.request().url().startsWith(base + '/')) return r.continue(); report.blockedRequests.push(r.request().url()); return r.abort(); });
  await page.goto(base + '/index.html');
  await page.evaluate(() => window.__localDBReady);
  await page.evaluate(data => { window.__fixture = data; window.eval('DB=normalizeDB({...__fixture,weapons:consolidateArtiaFixedVariantRows(__fixture.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();'); }, JSON.parse(fs.readFileSync(path.join(root, fixture))).data);
  const run = code => page.evaluate(code => window.eval(code), code);
  const digest = expression => page.evaluate(async expression => {
   const bytes = new TextEncoder().encode(window.eval(expression));
   return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  }, expression);
  const stable = () => digest(`JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),db:DB,storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k!=='mhwilds-comparison-session-v2'))})`);
  const initialDbHash = await digest('JSON.stringify(DB)');
  const prepare = () => run(`(()=>{window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};})()`);
  const evaluate = async () => {
   await prepare();
   const before = await stable();
   const probe = await run(`(()=>{const input={...__input,rapidAmmoSequence:'LBG_FIVE_ROUNDS_25_HITS',conditionalConditionPlan:__stats.conditionalConditionPlan};const before=JSON.stringify(input);const result=evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan});const original=MHWRealOneHitBrowserAdapter.evaluateCurrent(input);const direct=continueConsumerSkillEffects(input,original);return {result,direct,originalStatus:original.status,originalReason:original.reason,inputPreserved:before===JSON.stringify(input)};})()`);
   assert.ok(probe.inputPreserved, 'adapter input preserved');
   assert.equal(probe.direct.status, 'OK', probe.direct.reason);
   assert.deepEqual(totals(probe.direct), totals(probe.result), 'adapter with production continuation agrees with consumer path');
   assert.equal(await stable(), before, 'evaluation preserves snapshot, conditions, saves, DB, and non-session storage');
   return probe.result;
  };
  for (const [weaponId, level] of [[783, 1], [763, 2], [771, 3]]) {
   const row = { weaponId, level, checks: [] }; report.cases.push(row);
   const check = async (name, fn) => { const c = { name }; row.checks.push(c); try { Object.assign(c, await fn() || {}); c.status = 'PASS'; } catch (e) { c.status = 'FAIL'; c.error = e.stack; report.failures.push({ weaponId, name, error: e.message }); } };
   const nativeForce = weaponId === 783 ? 1 : 0;
   const apply = async (first = 0, force = nativeForce, extras = [], state = {}) => {
    const skills = [...(first ? [{ name: 'ファーストショット', level: first, type: 'weapon' }] : []), ...(force > nativeForce ? [{ name: 'フォースショット', level: force - nativeForce, type: 'weapon' }] : []), ...extras.map(([name, level]) => ({ name, level, type: 'armor' }))];
    assert.ok(skills.length <= 3, 'custom charm permits at most three distinct skills');
    await run(`(()=>{const s=buildSnapshot();Object.assign(s,{weaponId:'${weaponId}',armor:{},decos:{},charmCustom:{skills:${JSON.stringify(skills)},slots:[0,0,0],weaponSlots:[]},target:{monsterId:'13',partId:'2700'}});s.combo.moves=[];s.combo.lightBowgunState={ammoType:'NORMAL',ammoLevel:${level},shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:'NONE',specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true,...${JSON.stringify(state)}};applyBuildSnapshot(s);})()`);
    await page.click('#calcBuild');
    const active = await run('calcState.total');
    assert.equal(Number(active['ファーストショット'] || 0), first, 'actual First Shot level');
    assert.equal(Number(active['フォースショット'] || 0), force, 'actual Force Shot level');
    for (const [name, lv] of extras) assert.equal(active[name], lv, `actual ${name} level`);
    assert.equal(await digest('JSON.stringify(DB)'), initialDbHash, 'DB remains unchanged');
    return active;
   };
   const verify = async (result, first, force, { attackAdd = 0, affinityAdd = 0 } = {}) => {
    assert.equal(result.status, 'OK', result.reason);
    assert.equal(result.evaluationPlan.selection, 'STANDARD');
    const source = await run('({weapon:selectedWeapon(),stats:calcState.stats})');
    const baseAttack = source.stats.attackTrue, baseAffinity = source.weapon.affinity;
    // Existing equipment producer is the base-stat authority. The shot arithmetic below is independent.
    near(baseAttack, source.weapon.damage.raw, 'unmodified real weapon attack');
    for (const ch of ['normal', 'maximum']) {
     const ts = traces(result.channels[ch]); assert.equal(ts.length, 25);
     const maximum = ch === 'maximum'; let total = 0;
     const expectedRounds = [];
     for (let shot = 1; shot <= 5; shot++) {
      const shotAttackAdd = shot === 1 ? [0, 5, 10, 15][first] : shot === 4 ? [0, 3, 6, 10][force] : 0;
      const shotAffinityAdd = shot >= 4 ? [0, 8, 10, 12][force] : 0;
      const attack = baseAttack + (maximum ? attackAdd : 0) + shotAttackAdd;
      const affinity = Math.min(100, baseAffinity + (maximum ? affinityAdd : 0) + shotAffinityAdd);
      const expected = attack * ({ 1: .17, 2: .238, 3: .306 }[level]) * .7 * .65 * (1 + affinity / 100 * .25);
      const five = ts.slice((shot - 1) * 5, shot * 5);
      for (const [i, t] of five.entries()) {
       assert.equal(t.roundOrdinal, shot); assert.equal(t.triggerOrdinal, shot); assert.equal(t.shotOrdinal, shot); assert.equal(t.hit, i + 1);
       near(t.shotAttackAdd, shotAttackAdd, 'shot attack addition'); near(t.shotAffinityAdd, shotAffinityAdd, 'shot affinity addition');
       near(t.attack, attack, 'effective attack'); near(t.affinity, affinity, 'effective affinity'); near(t.effectiveAffinity, affinity, 'effectiveAffinity trace'); near(t.physical, expected, 'each Hit');
      }
      near(five.reduce((n, t) => n + t.physical, 0), expected * 5, 'per-shot total');
      total += expected * 5; expectedRounds.push({ shot, hitCount: five.length, attack, affinity, shotAttackAdd, shotAffinityAdd, perHit: expected, subtotal: expected * 5 });
     }
     near(result.channels[ch].metrics.comboTotalDamage.value, total, '25-Hit total');
     const d = result.channels[ch].diagnostics;
     assert.ok(![...(d.ignoredSkillEffects || []), ...(d.unappliedEffects || [])].some(x => [137, 140].includes(Number(x.skillId))), 'First/Force no longer reported unapplied in standard sequence');
     if (weaponId === 771) assert.ok(!(d.ignoredSkillEffects || []).some(x => Number(x.skillId) === 82), '82 is non-applicable to physical-only standard rapid');
     assert.equal(d.rapidAmmoSequence.liveGameVerification, 'PENDING');
     result.channels[ch].independentRounds = expectedRounds;
    }
    return { result: summary(result), independentRounds: Object.fromEntries(['normal', 'maximum'].map(ch => [ch, result.channels[ch].independentRounds])) };
   };
   let baseline, combined;
   await check('actual weapon baseline including intrinsic Force', async () => { await apply(); baseline = await evaluate(); return verify(baseline, 0, nativeForce); });
   for (let rank = 1; rank <= 3; rank++) {
    await check(`First Shot level ${rank}`, async () => { await apply(rank); return verify(await evaluate(), rank, nativeForce); });
    await check(`Force Shot level ${rank}`, async () => { await apply(0, rank); return verify(await evaluate(), 0, rank); });
    await check(`First and Force level ${rank}`, async () => { await apply(rank, rank); return verify(await evaluate(), rank, rank); });
   }
   await check('First Force Foray use exactly three charm skills', async () => {
    const active = await apply(3, 3, [['攻勢', 5]]); combined = await evaluate();
    const proof = await verify(combined, 3, 3, { attackAdd: 15, affinityAdd: 20 });
    const plan = await run('__stats.conditionalConditionPlan');
    const foray = plan.applied.filter(x => x.skill === '攻勢'); assert.equal(foray.length, 1); assert.equal(foray[0].condition, 'MONSTER_POISON_OR_PARALYSIS'); assert.equal(foray[0].attackAdd, 15);
    for (const ch of ['normal', 'maximum']) assert.ok(!(combined.channels[ch].diagnostics.unappliedEffects || []).some(x => Number(x.skillId) === 75));
    return { ...proof, active, foray: foray[0] };
   });
   await check('magazine and saved ordinal cannot reset fixed five rounds', async () => {
    assert.ok(combined, 'combined result available'); const expected = totals(combined), states = [];
    for (const state of [{ magazineCapacity: 1, shotOrdinal: 1, fullMagazine: false, loadedRounds: 0 }, { magazineCapacity: 2, shotOrdinal: 2, fullMagazine: false, loadedRounds: 2 }, { magazineCapacity: 99, shotOrdinal: 99, fullMagazine: false, loadedRounds: 0 }]) {
     await apply(3, 3, [['攻勢', 5]], state); const r = await evaluate(); await verify(r, 3, 3, { attackAdd: 15, affinityAdd: 20 }); assert.deepEqual(totals(r), expected); states.push({ state, totals: totals(r) });
    }
    return { states };
   });
   await check('save load visible comparison and repeat preserve inputs', async () => {
    await apply(); baseline = await evaluate(); await page.fill('#buildName', `baseline-${weaponId}`); await page.click('#saveBuild');
    await apply(3, 3, [['攻勢', 5]]); combined = await evaluate(); await page.fill('#buildName', `shot-skills-${weaponId}`); await page.click('#saveBuild');
    for (const [name, result] of [[`baseline-${weaponId}`, baseline], [`shot-skills-${weaponId}`, combined]]) { await page.click(`[data-build-load="${name}"]`); await page.click('#calcBuild'); assert.deepEqual(totals(await evaluate()), totals(result)); }
    await page.click('#clearAllCompare');
    for (const name of [`baseline-${weaponId}`, `shot-skills-${weaponId}`]) await page.locator(`[data-compare-name="${name}"]`).check();
    const before = await stable(); await page.click('#runCompare'); assert.equal(await stable(), before);
    const comparison = await run('lastBuildComparisonRows'), text = await page.locator('#compareOut').innerText();
    assert.equal(comparison.length, 2); assert.ok(await page.locator('#compareOut').isVisible()); assert.match(text, /通常/); assert.match(text, /最大/);
    for (const r of comparison) {
     const expected = r.name.startsWith('baseline-') ? baseline : combined; assert.equal(r.oneHitPipeline.status, 'OK'); assert.deepEqual(totals(r.oneHitPipeline), totals(expected));
     for (const ch of ['normal', 'maximum']) { const display = await run(`comparisonDisplayNumber(${totals(expected)[ch]})`); assert.ok(text.includes(display), `visible total ${display}`); }
    }
    assert.doesNotMatch(text, /一部スキル未反映/);
    await page.click('#runCompare'); assert.equal(await stable(), before); assert.deepEqual((await run('lastBuildComparisonRows')).map(r => totals(r.oneHitPipeline)), comparison.map(r => totals(r.oneHitPipeline)));
    await page.locator('#compareOut').screenshot({ path: path.join(out, `weapon-${weaponId}-comparison.png`) });
    return { actualSaveLoad: true, inputPreserved: true, repeatedComparisonPreserved: true, visibleText: text, totals: comparison.map(r => ({ name: r.name, totals: totals(r.oneHitPipeline) })) };
   });
   await check('explicit single trigger retains prior scope', async () => {
    await apply(0, nativeForce); await prepare();
    const prior = await run('MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})');
    if (weaponId === 763) { assert.equal(prior.status, 'OK', prior.reason); for (const ch of ['normal', 'maximum']) { assert.equal(traces(prior.channels[ch]).length, 5); const hit = 90 * .238 * .7 * .65; near(prior.channels[ch].metrics.comboTotalDamage.value, hit * 5); } }
    else assert.notEqual(prior.status, 'OK');
    await apply(3, 3); await prepare();
    const shotSkills = await run('MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})'); assert.notEqual(shotSkills.status, 'OK');
    return { baselineStatus: prior.status, baselineReason: prior.reason, shotSkillStatus: shotSkills.status, shotSkillReason: shotSkills.reason };
   });
   if (weaponId === 771) await check('three-skill Force latent might caps affinity at 100', async () => {
    const active = await apply(0, 3, [['力の解放', 5], ['渾身', 3]]), r = await evaluate(); const proof = await verify(r, 0, 3, { affinityAdd: 80 });
    for (const t of traces(r.channels.maximum)) assert.equal(t.affinity, 100);
    return { ...proof, active };
   });
   row.status = row.checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'PASS';
  }
  report.dbPreserved = initialDbHash === await digest('JSON.stringify(DB)');
  assert.ok(report.dbPreserved);
 } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
 report.runtimeUnchanged = files.every(f => hash(f) === report.hashes[f]);
 if (!report.runtimeUnchanged) report.failures.push({ error: 'Bound runtime, fixture, or script changed; rerun required' });
 if (report.pageErrors.length) report.failures.push({ error: report.pageErrors.join('; ') });
 report.status = report.failures.length ? 'FAIL' : 'PASS';
 fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(report, null, 2));
 console.log(JSON.stringify({ status: report.status, failures: report.failures, checks: report.cases.reduce((n, r) => n + r.checks.length, 0), rows: report.cases.map(({ weaponId, status }) => ({ weaponId, status })), out }));
 process.exitCode = report.failures.length ? 1 : 0;
})().catch(e => { report.status = 'FAIL'; report.failures.push({ error: e.stack }); fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(report, null, 2)); console.error(e); process.exitCode = 1; });
