> 続報: [共通入口修復と最終結果](standard-route-recovery-20261104.md)。以下は前回時点の記録。最新index SHA256は続報参照。

# Owner Safari feedback: local implementation evidence

Branch zeerie/ui-resume-20261104, HEAD a0b60f39fa5798a371ad0dad56f5f3e9e2c253ab, uncommitted.
Final index SHA256: 768fdbd3ed0749830567f17f11e96ba8891eb074cb0829feba92cc46317574c8
Cache SHA256 unchanged: ed03fe6b18dee5d3fda5f0839330816cc54d6448f923916c3053b653b303ff85

## Causes and changes
- Missing weapon/attribute images: prior localhost server was no longer listening. Restored loopback server and verified real PNG responses; eager loading for 14 weapon icons. No invented replacement artwork.
- Weapon selector: placed below weapon buttons.
- Armor/charm: copied only six SVG shape overrides from approved reference commit 64941b9fe343173c37b06443972a8073a508b4e0, not its conflicting dropdown behavior.
- Attributes: summary/comparison use existing PNG plus numbers and aria labels, without duplicate visible attribute names.
- Bow: required coating/range controls were inside hidden developer UI. Restored original inputs. For missing explicit moves, use existing adopted bow three-shot profile. Unsupported pierce remains unavailable.
- CB: restored existing route selector and R/H independent start inputs; no forced state, formula/guard removal, weighting or DPS introduced. Existing explicit R/H proof passed. Existing saved snapshots missing valid states may still require owner correction and resave.
- GS/HH/GL/SA: comparison used legacy fixed-STANDARD/baseline readiness instead of available canonical result, and exposed DPS-only pending reasons. Primary normal/maximum now independently use canonical result and actual failure reason. A missing baseline only prevents relative index. Original weapon conditions and preset selector are reachable. No blanket assertion that the owner's exact saved inputs now calculate.
- LS and all generic comparisons: added normal/maximum relative indices using A normal=100, physical/element totals and deltas from A normal. Unknown components remain unavailable. Removed visible one-hit/shared-Pipeline diagnostic rows. Replaced obsolete explanation and baseline heading source.
- Shared engine, Technique DB, cache module and saved-build formats were not edited in this feedback task.

## Evidence
Evidence directory: /Users/scream/Documents/Codex/2026-11-04/task/evidence/owner-ui-final
- owner-ui-regression.cjs: 9 checks passed, isolated Chromium port49180 with captured API DB. Distinct bow weapon1067/1068 saved and compared; unsupported pierce leaves snapshots unchanged. Not a new live API download.
- Final screenshots ui-390,430,768,1024,1440.png. No document overflow. Inspected390 screenshot. Emulation, not physical iPhone/iPad.
- Focused Node tests33 pass, node-tests.txt.
- hh-current-proof.json: current four-route HH proof, preservation passed; gl-shell-proof.json, sa-proof.json, lance-proof.json passed with actual captured equipment and saved copies. These copies are persistence checks, not distinct A/B equipment.
- Older HH stage4-real-hh-proof fails its obsolete expectation that maximum GOG is unavailable; actual result is available. Retained hh-proof.json as failure evidence. Current HH proof used instead; no expectation weakened.
- Earlier current-task GS/CB/Bow/LS/SNS/DB/Hammer results are in ../owner-six-before/*proof-after.json. Explicit valid state fixtures, not exact owner snapshots. SNS historical verdict text is stale; actual channels complete and assertions passed.

## Safari and remaining acceptance
Owner origin49179 was observed read-only, containing their accumulated saved builds. No reload or saved-data writes were performed there. A new Safari tab was confirmed open; subsequent paste/navigation to http://127.0.0.1:49180/__review and AX retrieval timed out. Navigation outcome uncertain; later read also timed out. This is a tooling timeout, not permission denial. Do not claim post-change Safari acceptance. iPhone/iPad physical verification remains pending.
Servers serve latest files on49179 and isolated49180; owner must save their in-progress input before manually reloading49179. Separate49180 has independent storage. Source hash above identifies latest UI, not the older query label b2c3fa8b.
No commit, push, merge, deployment, storage deletion or owner input overwrite.

## Fourteen-weapon classification (final local source)
These are bounded fixture executions using captured MHDB, not owner Safari acceptance. Most are identical saved copies. All final evidence retains input snapshot/conditions and exact component results.

|Weapon|Explicit input route checked|Result / limitation|
|GS|KOTATU_GS_01, adopted charged three-technique, conversion OFF/ON and eclipse OVERCOME|normal1687.68 / maximum2278.08, saved comparison preserved|
|LS|KOTATU_LS_01, red blade I/II/III|643.55 /946.82, preserved|
|SNS|KOTATU_SNS_01, four-technique|345.8 /538.72; script exit2 for equipment/template gate, not full acceptance|
|DB|KOTATU_DB_01, demon dance I/II/III|1529.69 /1857.73, preserved|
|Hammer|KOTATU_HAM_01, adopted four-technique|1020.1 /1341.8, preserved|
|HH|stage4-hh-target-four-proof explicit melody/state routes|current proof and preservation passed; older proof incorrectly expects GOG unavailable|
|Lance|stage4-real-lance-proof adopted route|normal/maximum and preservation passed|
|GL|stage4-real-gl-shell-proof explicit shelling state|normal/maximum and preservation passed; normal UI state must be supplied|
|SA|stage4-real-sa-three-proof explicit three routes/phials|normal/maximum and preservation passed; generic automatic fallback currently excludes OWNER_APPROVED_PROVISIONAL profile|
|CB|stage4-cb-mix-public-proof explicit R/H independent state|accepted independent-sum path verified earlier this task; saved input must select valid preset/state|
|IG|stage4-ig-sweep-airborne-proof explicit HP reference route|route/preservation passed, charm UNCONFIRMED, not whole-build PASS; old diagonal-only test obsolete evidence-gated assertion fails|
|LBG|stage4-real-lbg-proof normal ammo2|true component reason REAL_SLICE:BOWGUN_STATE_UNRESOLVED, preserved unavailable. rapid3 proof also has obsolete expected skill-block assertion; no full acceptance|
|HBG|KOTATU_HBG_01 explicit proof|182.140992 /233.3437272 and preservation passed, dedicated comparison UI path|
|Bow|weapons1067 and1068, NONE/CRITICAL, existing three-shot sequence|distinct A/B available; PIERCE remains pending and storage unchanged|

Important unresolved integration: empty saved move lists do NOT have a valid automatic standard for every weapon. GENERIC_STANDARD_PROFILES contains GS/LS/DB/SNS/Hammer/Lance/SA/IG; SA is provisional and excluded by ADOPTED-only fallback. HH/GL/CB/LBG/HBG require their specific chosen route/state. Restoring original preset/condition inputs makes valid paths reachable but does not justify claiming every owner build fixed. IG triple-extract standard and explicit limited reference routes must not be conflated. Continue with owner actual input reproduction and profile approval mapping before declaring all14 accepted. No coefficients/state guesses or broad guards removed.
