# Wyvern First/Force limited connection — 2026-10-29

OWNER_APPROVED_PROVISIONAL, game version unknown / live verification pending.
Approvals: Sentinel_08816e42663481919a139f8b55ff86ef (second fire order), Sentinel_1798a0cd242881918fc08f0003bfbefc (physical shot flat order).
Source: https://kuroyonhon.com/mhwilds/program/skill.php ; prior proposal WYVERN_ORDER_AND_REMAINING_DECISIONS.md. Source supplies existing First/Force values and eligible ordinal; combined order is owner provisional choice, not measured fact.

## Product
Technique DB wyvernRules references existing HBG normal shotSkills (no numeric duplication) and records order/adoption. Adapter validates MHDB First140/Force137 IDs and Lv1–3, passes existing shared HBG shotOrdinal/fullMagazine/capacity to dedicated state, requires capacity equal explicit weapon Wyvern capacity. Unknown/missing values not generated. Formula uses existing shotSkillBonuses resolver once. First fire400 unchanged; second fire200*M*S+F. Physical MV*(base*mult*(artillery where applicable)+skillFlat+externalFlat+shotFlat). Force affinity does not alter noncritical Wyvern Hits. Other guard scopes unchanged.

## Minimal public cases
Synthetic HBG raw200, Attack5 (208+9), Artillery3, FireAttack3, fireHZ30%, six-round synthetic capacity. No legal equipment claim. Normal and maximum independently produce equal values in this fixed scenario.

|Case|Ordinal|Shot flat|Second display fire|P1|P2|Total|
|---|---:|---:|---:|---:|---:|---:|
|No shot skill|1|0|300|223.52|41.23|285.75|
|First3 active|1 full|15|324|235.52|44.08|301.32|
|First3 inactive|2|0|300|223.52|41.23|285.75|
|Force3 active|4|10|312|231.52|43.13|296.01|
|Force3 inactive|3|0|300|223.52|41.23|285.75|

First fire damage12 unchanged throughout. First second-fire damage9.72 (324), not9.9 (330). Physical additions are after artillery: First P1 delta12, P2 delta2.85.
Normal snapshot restore matches. Saved First/Force A/B uses shared current ordinal1; Force inactive, active build/conditions unchanged. Missing ordinal and ordinal7 reach SHOT_POSITION_PENDING and unavailable total at captured public adapter boundary; invalid First Lv4 rejected by ID/Lv guard. No unknown technique expansion.

Final after exit0, chunk8f5e6d; exact raw output/hash/commands and failed attempts in wyvern-shot-execution.json. Before refused shot skills; baseline completed. Harness corrections are retained, including four-skill charm fixture and mistaken execution-status expectation; no save-path product change was necessary.

Product files: index.html (DB only), hope-hammer-browser-adapter.js, hbg-wyvern-reference.js. No engine/bundle change, no commit/push. ID137/140 remain partial pending review of full adopted scope; other Wyvern conditional attribute/cap and ballistics applicability untouched. Existing audit counts62/17/6/6/88 unchanged.
