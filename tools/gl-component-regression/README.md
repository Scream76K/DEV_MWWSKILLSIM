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
