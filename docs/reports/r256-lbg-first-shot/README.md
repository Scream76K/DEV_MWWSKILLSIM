# LBG First Shot: explicit single normal-ammo shot

Baseline3f89fecb069d15f6c87b3af89135dd95006b1604; product a1f2c3b16e58ea9f8d6873dbb56c1ed4220fb4cb. No new coefficient adopted. MHDB official skill140 ファーストショット / 初弾珠【1】358 (slot1) fitted to real LBG793 slot3. Existing HBG common shotSkills.firstAttack [0,5,10,15] reused by reference, evidence BOW_R116_FIRST_SHOT_SOURCE (bowguns only) and original HBG_R120_SHOT_SKILL_SOURCE. Source confirmed, current live version not verified. Fixture provenance retains cached retrieval uncertainty.

Expected/actual normal and maximum:
- No decoration: ordinal1/2 both67.49952.
- Lv1, explicit full magazine start, ordinal1:69.187008 (205/200); each physical Hit23.062336, element0.
- Lv1 ordinal2:67.49952; no add. Capacity4 from actual weapon normal-Lv1 ammo record, not editable/fabricated.
- Not-full start ordinal1:67.49952.
- Missing ordinal/full-start: REAL_SLICE:LBG_SHOT_POSITION_PENDING, numerical result unavailable.

Actual calcBuild/renderer/saveNamedBuild/runBuildCompare used, no computed stats/skills/plan/result overwrites. Each ordinal's A/B matches standalone, full before/after equipment/condition/result restores. Normal save load after clearing new UI fields restores ordinal2/full-start true and channels. preserveCombo:true remains shared starting conditions. One-shot scope prevents applying a single ordinal to every selected technique. No automatic magazine depletion/reload simulation. Lv2/3 and capacity-overflow branches are static only, not independently executed.

Implementation: comboLBGStoredState/restoreComboLBGState includes ordinal and explicit boolean with null for missing; resolveReferenceState obtains original/projected ammo capacity; checks missing/overflow for First Shot. referenceFormula already passes canonical skill levels to BowgunNormalReference.shot; LBG guard now permits firstShot only (forceShot remains rejected). Existing shared +attack logic applies once per physical shot; three contacts are the existing ammo structure, no element/sharpness. HBG numerical logic and input branch unchanged, confirmed by diff; HBG was not rerun. Artia projected capacity remains separate from shot power. Old prepareP0RangedContext DPS/legacy route still refuses First Shot; this deliverable is the public shared Pipeline/summary/comparison, not legacy DPS completion.

initial-missing-reason.json retains initial failure: first/second and A/B assertions passed, but missing-input DOM showed generic component unavailability. Entry-specific reason fixed. after.json is final successful evidence, executed on baseline working tree; index/adapter/reference/bundle hashes exactly match product commit. Bundle8 sources unchanged/matching. No broad regression, CI or Safari run. Old evidence retained.
