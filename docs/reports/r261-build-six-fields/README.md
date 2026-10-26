# Stage 1: six build display fields

Product/execution SHA d0bbce5fdfa025e2efa64a5aef938bd81c3d1dd0, index hash517c587bc2539239f20cf9a2b123326704b77b29381b9051a6db7541577617f1. No additional product changes.

Expected before execution: original MHDB GS244 has raw180/display864, affinity0, fire450, slots[2,1], innate Charge Master1/Focus1. Original head687 supplies Weakness Exploit2 (10+5% maximum conditional affinity). Original weapon deco255 Attack1 adds raw3, fits slot2. Therefore A shows864/0%/15%/fire450, B shows878 (878.4 rounded)/0%/15%/fire450 and Attack1. No armor/charm/deco outside this legal pair; original fixture hashes recorded.

Production calcBuild/renderSummary, actual decoration change event, saveNamedBuild and ordinary load buttons were exercised in isolated JSDOM. Both loaded results exactly equal their original skills/stats/DOM. Changing weapon via its change event to original GS236 produces432 and confirmed no element0; the unavailable weapon slot's old deco contributes no Attack skill. A deliberately unresolved legacy technique selection proves unavailable firepower does not remove the six fields; no Pipeline output is mocked.

Rendered production markup and CSS were measured in separate headless Chromium at1184px viewport /272px panel. All status values are inside the panel, not merely present as text. Skill levels are asserted and captured in the real renderer output. Unknown attribute/null vs known0 uses the existing r261-skill-summary-display before/after renderer evidence, not an invented MHDB record. No new coefficients or firepower formula changes.

Current Safari tab, saved 弓１ and its localStorage were never mutated or reloaded. Post-fix Safari remains unverified; user should save the current unsaved build under a distinct name before reloading, then use ordinary load. This is not a full-skill audit or stage2/3/4 completion. CI and broad regression not run.
