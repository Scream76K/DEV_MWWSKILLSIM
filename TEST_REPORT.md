# r1.1.19_fix6 test report
- Base: r1.1.19_fix5
- JS syntax: PASS (Node.js --check on extracted script)
- Armor selector: forced one-column and compact spacing
- Decoration change: explicit delegated change handler updates build.decos before calcBuild; bindInlineDecos also synchronizes state
- Template load: existing templateApply path preserved; decoration state is retained through renderArmor/calcBuild
- Over-max skill display: raw skill totals preserved before clampSkillTotals; render uses raw level so max-level number can blink red while blocks/displayed Lv remain capped
