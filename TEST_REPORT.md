r1.1.19_fix4

Base: stable r1.1.18.
UI change: moved the existing armor/charm editor DOM and existing ④ status/skill DOM into a real two-pane workspace. No new calculation engine was introduced.

Static checks:
- index.html parsed successfully
- exactly one armorSelectors/charmEditor/skillOutput/calcBuild ID
- renderArmor/renderCharmEditor still target the same IDs
- existing calcBuild function retained
- workspace has independent overflow containers
- version text unified to r1.1.19
