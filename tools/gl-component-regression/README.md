# Bounded Charge Master and GL bonus extension (2026-11-08)

Base product: 5b2c4d4dac550f7675d119db5a0b0abaaf5b764c. The product adapter adds only two reviewed boundaries: Charge Master is non-applicable to proven zero-element/status ordinary body routes for Long Sword, Sword & Shield, Dual Blades and Lance; validated Sliding Power and Guardian Veil activations do not modify fixed shell damage. Identity, activation, state, conversion and unsupported-route gates remain fail-closed. This is not general skill adoption or verified game accuracy.

Current GL integration expectations are 71 cases, with 31 original cases available and 2 still blocked. The only three newly available originals are skill 89 rank 1, skill 153 rank 2 and skill 155 rank 1. The last is a coactivated Veil I boundary, not adoption of skill 155. The original pinned fixture and 41 historical reference hashes are unchanged. The runtime hash contract binds every new integration module and the exact candidate adapter, independently of the generated input manifest.

## Fixture-free checks and CI

From the repository root, Node 24:

    node --test tests/gl-shell-affinity-scope.test.cjs tests/gl-shell-defensive-scope.test.cjs tests/gl-shell-state-affinity-scope.test.cjs tests/gl-shell-bonus-scope.test.cjs tests/charge-master-noelement-scope.test.cjs tools/gl-component-regression/failure-injection.test.cjs

The new synthetic unit inputs exercise 92 actual Charge Master predicate assertions and 106 actual bonus predicate assertions. The bonus unit test uses a stub only for the self-state producer: it is not full-adapter or formula verification. Separate integration below executes the real producer, DB and adapter. CI needs no private fixtures. The product-suite job runs npm test after npm ci --ignore-scripts; existing failures are not suppressed. Previous product-suite comparison was 755 pass / 123 fail, not green. The two new predicate files add two test entries.

## Reproduce the fixture integration

Use the same prepare command and pinned historical snapshot/references described below. Preparation also reads the baseline public adapter directly from the exact base Git commit and verifies its fixed public hash. No new private data hashes or reference-result bytes are added. New tests derive equipment selections from the existing pinned plan instead of embedding private selections.

    node tools/gl-component-regression/prepare.cjs --repo /path/to/repo --commit FULL_TARGET_SHA --snapshot /path/to/pinned/snapshot --references /path/to/pinned/results --output /path/to/new/prepared-run
    NODE_PATH=/path/to/fixed/dependencies/node_modules node /path/to/new/prepared-run/regression.cjs
    NODE_PATH=/path/to/fixed/dependencies/node_modules node /path/to/new/prepared-run/combined.cjs
    NODE_PATH=/path/to/fixed/dependencies/node_modules node --test /path/to/new/prepared-run/failure-injection.test.cjs /path/to/new/prepared-run/portability.test.cjs /path/to/new/prepared-run/preflight-integrity.test.cjs /path/to/new/prepared-run/input-integrity.test.cjs /path/to/new/prepared-run/combined-integrity.test.cjs

The first driver runs the 71 GL cases with fresh process output, run IDs and completion checks. The second runs all 96 Charge Master cases and 86 full-adapter GL negative scenarios, three newly available originals, a sliding-body arithmetic control and direct-predicate conversion/alias checks. Charge Master unchanged-route controls are now freshly evaluated against the hash-bound public baseline adapter, not copied from private historical result JSON. Both normal and maximum channels are checked. Fresh paired comparisons show preservation, not independently measured game accuracy.

combined-summary.json is invalidated before any contract or fixture is loaded. Each run uses a fresh output directory; a zero child exit is required, and the 96-case report must carry the current run ID. New and previous tamper tests reject changed adapters plus regenerated manifests, missing fixtures/references, altered runtime modules and altered public baseline bytes. Never treat an old PASS or a fixture-free CI result as a full scan.

Full-scan reporting must separately identify product commit, fixed runner 8c2d4c3b2756f9ded881b957c1fb8282b24ca933 and private input a9b58416d6cff3441ea1ad7774670f6080d11921. A final-product-SHA-bound, independently reviewed 44-file dependency contract and a fresh scan are still required. Nothing here changes mainline, saved application builds, pinned inputs or old result files.

Historical sections below retain prior scopes and counts for provenance. The current 71-case / 96-case instructions above and fixed contract are authoritative for this candidate.

# Conditional-affinity shell boundary extension (2026-11-08)

Base product: a8c2f4f301559c0736f52eb9a3999a1261c0f0d3. Only exact MHDB Antivirus18 and Wet Blade Mark39 entries are separated from non-critical shell raw/fire modifiers. Existing state-aware cutting resolvers, coefficients and missing-state gates are unchanged. This is not general skill adoption or verified game accuracy.

Current integration suite:71 cases, comprising the earlier41,27 state-boundary cases and3 explicit normal-shell controls. Original GL group:28 available and5 still blocked. Six newly available original cases preserve cutting/element outputs against pinned a8c2f4f references. All41 reference files now come from the completed a8c2f4f component regression. The input fixture snapshot remains the separately pinned historical snapshot described below; do not substitute a newer product snapshot for that fixture input.

The state cases cover all three ranks, dry/wet/bubble/both, before/infected/overcome, missing/unknown/partial/invalid state and combined effects. They override only the captured adapter call in the test harness, not saved user settings or source DB. Normal-shell tests supply six rounds explicitly for the fixed weapon315; no implicit ammunition is invented by production. State-boundary conditions are not a claim that current public UI exposes those direct adapter inputs.

Expected wet affinity additions come from MHDB39 ranks:3/6/9 wet and7/14/21 bubble. Antivirus additions3/6/10 come from MHDB18; the existing provisional overcome15 and BEFORE/INFECTED/OVERCOME mapping are documented in docs/reports/r263-skill-audit/FRENZY_EXPLICIT_STATE_CONNECTION.md at the base product. Test arithmetic uses the adopted unmodified25% base crit premium and the no-skill matched cutting total. These hand-stated expectations are never consumed by production. Shell damage must be invariant; malformed states must retain their exact execution blocker in both channels.

Fixture-free CI adds120 actual-predicate assertions in tests/gl-shell-state-affinity-scope.test.cjs. All existing fresh-output, process-exit, runtime hash and coordinated adapter/manifest tamper protections remain. Use runner8c2d4c3b2756f9ded881b957c1fb8282b24ca933 and private a9b58416d6cff3441ea1ad7774670f6080d11921 separately; full scan requires a reviewed final-product-SHA dependency contract.

Historical sections below describe prior candidate scopes/counts. Current71-case assertions and pinned contract are authoritative for this candidate.

# Defensive-only extension (2026-11-08)

Base product: e9661d502acc04849d0d4f647ac7083ea79cdc5b. Exact MHDB Defense118 ranks1–7 and Thunder Resistance156 ranks1–3 are excluded from fixed shell raw/fire modifiers only with canonical identities and no resistance conversion. MHDB descriptions at https://wilds.mhdb.io/ja/skills/118 and https://wilds.mhdb.io/ja/skills/156 define defense/resistance effects. No coefficients or body calculations change. Conversion combinations remain fail-closed.

Current regression runs41 cases: original33 + existing4 controls + four conversion negatives. Expected22 original available and11 blocked; seven newly available cases must match no-skill damage in both channels for all components. The four conversion negatives check channel unavailability and retained component/scope guards, not wrapper status. tests/gl-shell-defensive-scope.test.cjs adds210 predicate boundary assertions.

Keep runner8c2d4c3b2756f9ded881b957c1fb8282b24ca933 and private data a9b58416d6cff3441ea1ad7774670f6080d11921 separate from product SHA. Full scan requires a reviewed product-SHA-bound dependency contract. No game accuracy claim or mainline adoption.

The fixture preparation, fresh-output and dependency-integrity requirements below remain unchanged. Historical15/18 and37 counts below describe the earlier affinity-only candidate, not current expected counts.

# GL affinity component regression

Product base: `6c3185201139ed7ec2251373a364c5cf966b4390` (mainline). This change only separates validated Weakness Exploit (57) and Latent Power (142) from fixed gunlance shell raw/fire modifiers. Cutting still uses the existing per-hit conditions; the ID99 rule and all other gates remain intact. It is an isolated branch for review, not a mainline release or verified game-accuracy claim.

## Checks without private fixtures

From repository root, Node 24:

    node --test tests/gl-shell-affinity-scope.test.cjs tools/gl-component-regression/failure-injection.test.cjs

The first file runs 204 guard assertions on the actual adapter predicate. The second runs nine process freshness/failure tests. The dedicated workflow runs these checks and, in a separate job, the repository npm test suite after locked dependency installation with lifecycle scripts disabled. A green workflow is not the 37-case fixture run or the full skill scan. Existing failures are reported, not hidden or rewritten to force green.

## Pinned fixture integration run

Prerequisites: a Git object repository containing the exact target commit's runtime blobs; Node 24; jsdom from the fixed runner dependency lock; the previously prepared pinned snapshot for public run `5692cd3c3ae1a5a743d56b8c91995742cc1b729e`; and its original GL diagnostic result files. Fixed private data lives separately at `Scream76K/DEV_MWWSKILLSIM-test-data`, commit `a9b58416d6cff3441ea1ad7774670f6080d11921`. No private fixture bytes or historical result JSON are copied into this public directory.

Use a new output directory outside the source repository and fixture paths:

    node tools/gl-component-regression/prepare.cjs --repo /path/to/repo --commit FULL_TARGET_SHA --snapshot /path/to/pinned/snapshot --references /path/to/pinned/results --output /path/to/new/prepared-run
    NODE_PATH=/path/to/fixed/dependencies/node_modules node /path/to/new/prepared-run/regression.cjs
    NODE_PATH=/path/to/fixed/dependencies/node_modules node --test /path/to/new/prepared-run/failure-injection.test.cjs /path/to/new/prepared-run/portability.test.cjs

Preparation verifies pinned input/reference hashes, materializes the exact target Git objects, rejects runtime changes other than the reviewed adapter bytes, and writes the candidate manifest in the isolated copy. It does not modify the input snapshot, source repository, or saved application builds. The fixture references are historical comparison controls, never fallback current results. The integration output has a new UUID and isolated directory; each case requires zero process exit, matching run ID/key and COLLECTED completion. `regression-summary.json` is the current result; a previous summary is invalidated at the start of a run. All required historical reference files must match `fixtures-contract.json`.

The scope is 33 original primary GL-modifier cases plus four controls, in normal and maximum channels. Expected: 15 restored cases, 18 still blocked, unchanged cutting/element results for the original 19 affinity diagnostics, shell invariance for matched affinity-only controls, and restored application state. Other missing modifiers are not allowed through. Historical gate-diagnosis labels are retained as `diagnosticStatus`, separate from collector completion.

## Scope and adoption limits

MHDB 57 describes affinity; 142 describes affinity and stamina economy. The existing shell formula explicitly fixes affinity to zero. This supports component non-application within the fixed-hit indicator, not trigger timing, infinite stamina, DPS, rounding, target-version gameplay, or full numeric accuracy. Integration exercises the adopted four-action reference and explicit slam/sweep controls. Normal-shell routes and the full product suite require separate verification. The global uncalculated count must come from a new full scan bound to the target SHA, not subtraction from the historical total.

The external commit-autotest runner must use an explicitly reviewed, target-SHA-bound runtime dependency contract. It is versioned separately; do not modify baseline or oracle expectations to make a changed product pass. Keep mainline and private fixture data unchanged.

## Preparation and preflight integrity

`fixtures-contract.json` fixes all five external harness dependencies: skill-plan.cjs, the historical diagnostic classification, skill-source manifest, raw skills and candidate classification. Preparation copies only these declared files and the declared runtime inputs, not the entire supplied snapshot. The five local execution modules (collector, plan, regression, fresh-case launcher and published-input verifier) also have exact hashes in the contract. Regression and collector validate dependencies before requiring the plan. The summary is invalidated before any local module or fixture is read, so a missing or corrupt prerequisite cannot leave an old PASS as the apparent current result.

After preparation:

    node --test /path/to/new/prepared-run/preflight-integrity.test.cjs

To verify refusal before preparation creates output, set GL_PRODUCT_REPO, GL_PRODUCT_SHA, GL_PINNED_SNAPSHOT and GL_PINNED_REFERENCES to the same explicit inputs, then run:

    node --test tools/gl-component-regression/prepare-integrity.test.cjs

These integration tests fail when required inputs are missing; they are not silently skipped. They are separate from CI's fixture-free unit checks. jsdom and its transitive packages must come from the separately pinned commit-autotest dependency lock; these fixtures do not vendor or install dependencies.

The generated expected-inputs.json must exactly match the public fixed contract, including the candidate adapter hash. Both driver and collector also check each input directly against that contract. Adapter/manifest coordinated edits, missing/extra manifest entries and reordered manifests are rejected by input-integrity.test.cjs. Run it against the prepared directory alongside the other integration integrity tests.
