# Guard + MEDIUM full burst — limited owner-approved extension

Owner approved the existing MEDIUM FULL_BURST physical base-multiplier contract on 2026-10-30. This is provisional and not directly measured in the GL videos. No new coefficient/MV/capacity introduced.

## Change
index.html offensiveGuardReference adds FULL_BURST, explicit MEDIUM power restriction and provisional metadata. GunlanceShellReference validates that restriction before using the unchanged attack-component formula. Guard is already in normalMultiplier; it is not multiplied again. Resolved physical attack = base * channel attackMultiplier * artilleryMultiplier + attackFlat; existing type-specific FB coefficient/MV follows. Fire and per-shell count remain unchanged. HIGH power and Cornpopper active FB guards are independent and retained. Adapter, Pipeline, F01 state commit, HBG, HM and DB gauge input code unchanged.

## Public minimum evidence
JSDOM calcBuild → shared Pipeline → dedicated shell consumer. Synthetic MHDB315 fixture with Attack5, Artillery3, Guard3, NORMAL type/MEDIUM, loaded2. This does not establish legal equipment or video absolute reproduction.
- Before: Guard maximum returns OFFENSIVE_GUARD_ACTION_NOT_ADOPTED; normal available.
- After OFF: both channels base90 *1.04 *existing artillery +flat9 -> physical attack116.64; two hits each p13.06368/e3.2; total32.52736.
- After ON: normal unchanged. Maximum multiplier1.196 (1.04*1.15) -> attack132.786; each p14.872032/e3.2; total36.144064. Nonzero flat remains outside multipliers.
- Both cases consume2, remaining0, exactly2shell hits. No dynamic resource assumptions added.
- Cornpopper-active FB: normal available / maximum CORNPOPPER_ACTION_NOT_ADOPTED. This four-skill negative is contract-only.
- MHDB350 WIDE/HIGH FB: HIGH_ACTION_NOT_ADOPTED maintained.
- Two saved off/on builds, load restoration and comparison match; shared conditions/current snapshot/local storage unchanged.
Before/after command exit0. Exact input, consumer trace, output and source hashes in before.json/after.json/manifest.json; incremental patch saved. No fault injection, all-type sweep, Safari or beta regression.

## ID66 remaining scope
Normal/charged and now existing MEDIUM FB are locally connected. HIGH FB, Wyrmstake FB, other unadopted actions and Cornpopper FB are not included. These are adoption expansions, not proof of a remaining defect in this limited Guard contract. Do not promote classification before independent review; no claim all game Guard interactions complete. No commit/push/integration.
