# LBG normal-ammo skill connection

Owner approval: 2026-10-26 01:41 UTC, Sentinel_ac7d1bde13208191aa565c82d49ee192. Limited edit, source fixture/evidence storage and normal branch push authorized.

## Expected / actual
Real MHDB793 鳳仙火竜砲, normal Lv1 capacity4 rapid=false, raw200 affinity10 Critical Boost3. Actual weapon decoration318 強弾珠【3】 fits slot3 and supplies MHDB skill6 Lv1. No computed stats/skills/plan/result overrides. Cache origin URLs retained; original retrieval timestamp unknown, not a new live measurement.

Normal and maximum both: A no decoration67.49952; B decoration70.87449600000001. Three physical contacts, each22.49984→23.624832, exactly1.05; element0. Actual calcBuild, rendering, saveNamedBuild, runBuildCompare; both rows equal standalone; entire before/after snapshot, conditions and real result equal. Shared preserveCombo behavior unchanged. Proof is this single nonrapid normal-Lv1 route, not all LBG states.

before.json records baseline B unavailable LBG_NORMAL:UNREVIEWED_SKILL (A available). after.json passes. Execution HEAD was b2e922e with working edits; testedContentCommit is 821d25f77aaeb0816eb0abb4e42bbf7c4b0904a8, verified by exact hashes of index, normal reference, adapter and bundle. No repeated suite. Legacy prepareP0RangedContext normalUp forwarding checked statically, not separately executed.

## Minimal code
bowgun-normal-reference.js removes only normalUp from LBG rejected skills; first/force and state gates remain. LBG rule references existing TECHNIQUE_DB_R119_HBG_NORMAL.specialSourceValues.normalUp, not another coefficient table. MHDB6 explicitly covers bowgun normal ammo. Source HBG_R119_SKILL_SOURCE retained as coefficient provenance (source confirmed, not live verified). LBG ammo MV/3 contacts/.8 coefficient, no sharpness/weapon element unchanged. Spread tech gates untouched.

## Push audit / limits
Remote branch was23b06caef246415929ff0d8868e1c264c1e4a6cb, an ancestor. Prior75 local commits cover previous authorized equipment/state/skill work and evidence, plus this change. develop8ba21ea9915e44421e89ae0a33fc7a4c5adcb1ae is also ancestor; no history integration attempted. Changed paths reviewed: product JS/HTML, tools, min8, docs only; no workflow changes. High-confidence credential-pattern scan found none; logs include local source paths, not credentials. Bundle exact-source inclusion verified for all8 modules; changed files load separately. No main/develop/force push/deploy.

Next candidate: LBG First Shot input producer (magazine/full-load/ordinal), requiring separate scope/state review; not enabled here. Current-version gameplay verification remains pending.
