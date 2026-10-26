# LBG Force Shot / MHDB137, not Rapid Fire Up23

Product 57473503b773fd2c76e708d212580212a35219d3. Baseline42d5cc9422e83a473cf282efcd986b1adb6e8b80. No new numerical adoption: LBG already references HBG common shotSkills; enable Force Shot in single NORMAL shot only, preserve all mode/range/level/contact gates. Existing coefficient source HBG_R120_SHOT_SKILL_SOURCE https://kuroyonhon.com/mhwilds/program/skill.php ; source-confirmed not live-verified. Official MHDB137 explicitly covers bowguns, attack on fourth/sixth and affinity from fourth onward. ID23 is separate LBG rapid-fire skill, never equipped or mapped to Force Shot here.

Existing stage: +attack [0,3,6,10] on ordinal4/6, +affinity percentage points [0,8,10,12] for ordinal>=4, then capped affinity expectation and physical MV/hitzone/range/LBG modifier. Ordinal constrained to original/projected ammo capacity. Affinity does not end at6: persists through magazine capacity; no reload progression simulated. Full-start boolean remains explicit; First Shot requires true and ordinal1, Force Shot itself depends on ordinal. No element application, no duplicated coefficient.

Real MHDB817 獄焔銃ホボトニチェ raw230 affinity-15, normalLv1 capacity6 rapidfalse, native First Shot3. Decoration12 積弾珠III slot3 supplies Force Shot3. Cached source provenance/unknown acquisition time retained in fixture. No computed stats/skills/plan/results overwritten.

Both normal/maximum results:
| ordinal | no Force | Force3 | effect |
|---|---:|---:|---|
|1|76.9692|76.9692|First Shot+15 only|
|3|72.2568|72.2568|neither|
|4|72.2568|77.74848|attack+10 affinity+12 (-15→-3)|
|5|72.2568|74.50896|affinity only|
|6|72.2568|77.74848|attack+10 affinity+12|
Each consists of3 physical hits, element0. UI calcBuild and real renderer, actual saveNamedBuild/runBuildCompare, each pair equals standalone, full snapshot/condition/result restored. After ordinal7 capacity rejection, normal saved-load restores ordinal6 and channels.

before-reference.json is a deliberately isolated old-Formula control (old bowgun-normal-reference from42d5cc9 injected into current DOM/adapter), NOT an untouched baseline execution. B ordinal4 returns LBG_NORMAL:UNREVIEWED_SKILL. after.json is actual current code success, exact product hashes checked against product commit; execution HEAD baseline with working edits. No broad regression. HBG and Bow numeric definitions/calculation unchanged by diff, no repeat HBG test. Bundle8 modules statically match, adapter/reference separate scripts. CI/Safari not run locally.

Limits: explicit single shot only; multiple selected techniques with First/Force rejected. Force levels1/2, Force-only equipment and capacity>6 are static-contract coverage, not additional live runs. No rapid/chase/mounted, arbitrary shot engine, scatter MV adoption, DPS or legacy prepareP0RangedContext completion. Existing legacy DPS route still rejects First/Force. Current game-version verification pending.
