# ID7 Guard → CB_SAED single: limited implementation accepted

Owner approved 2026-10-30: explicit previousAction=GUARD, one CB_SAED, DB body three physical Hits only. Existing Lv multipliers remain the sole numeric source MHRapidMorphAttackRule. Source: https://kuroyonhon.com/mhwilds/memo/26.php (guard-derived SAED applies, phial explosion excluded). All three body Hits is OWNER_APPROVED_PROVISIONAL, live-game unverified, source version unspecified. AED-derived/other origins/repetition not approved.

## Implementation
index exports a limited adoption record referencing the existing multiplier rule. Adapter admits that existing adopted SAED record at the outer technique gate, then validates one event and GUARD for Lv2/3. Dedicated body consumer receives channel attackComponents and combined body multiplier, with the existing consistency validator rejecting missing/inconsistent components. It uses base × existing multiplier × RapidMorph + existing flat + selected PunishingDraw flat. Existing Mind's Eye factor remains component-scoped when present. Element body and phial input unchanged. No shared attack inflation, new coefficient, event count, timing, or F01 change. Lv1 retains no damage multiplier and does not require this origin.

## Public JSDOM calcBuild results
Synthetic CB103/Attack5/Punishing3/Agitator1; no legal-equipment claim. Explicit target of PunishingDraw is middle body Hit only.

|Case|normal total|max total|
|---|---:|---:|
|no RapidMorph|784.5700479|791.58131832|
|Guard + Lv3|833.42453358|840.816488304|

Body effective attacks: normal 246.12/253.12/246.12 (190×1.04×1.2+9+[0,7,0]); maximum250.12/257.12/250.12 (flat13). Element body23.4/phial500.916 invariant. Affinity unchanged per channel. Missing/SHIELD_THRUST rejects via origin guard; AED-derived remains outer technique-scope guard. Lv1 missing origin has same metrics as no skill. Saved two builds compare with shared GUARD/Punishing flags, current state/localStorage unchanged, normal load matches.

Before first assertions expected inner origin guard, but actual preexisting outer technique gate rejected first; diagnostic and corrected before runs retained. First after assertion expected inner reason for derived; positive numerical/save checks had passed. Corrected assertion to preserved outer rejection, no product relaxation. Final command/exit0/raw logs/hash in manifest. Earlier failed logs retained. No post-final product edits.

Not executed: Lv2 numeric case (same rule/consumer statically), Mind's Eye combination runtime, F01 failure injection, Safari, live game, full regression. No commit/push/merge. ID7 remains partial after limited implementation acceptance; overall80complete/4partial/owner-excluded1 unchanged. This task does not adopt AED-derived, other predecessor, or axe followup scope.

## Metadata-only follow-up
Independent review accepted the implementation. Removed the obsolete broad CB_GUARD_DERIVED_SAED unconnected label; remaining labels explicitly identify other/unspecified predecessor, AED-derived and repeated sequence. No formula/guard change, no rerun. final.json and original manifest source hashes remain evidence for the executed pre-metadata index; metadata-followup.json records the later hash.
