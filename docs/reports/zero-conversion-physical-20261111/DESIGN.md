# Preserve proven zero conversion with static physical skills

Base ef114d02a8bf69e519a5c22b8b8bf103f7167a8f. The parent approved extending the existing zero-add proof to Attack Boost72, Critical Eye3 and Critical Boost22, with exact identity/rank and duplicate validation.

Problem: isolatedZeroConversion rejects all companion skills, although those three only modify physical attack/affinity/critical damage and do not create element or resistance. A known zero resistance times an already sourced coefficient remains zero. Existing Charge Master24 ordinary zero-element body predicates generally already permit these companions; verify rather than blindly rewrite them.

Selected approach: replace only the conversion-only skill-container check with a narrow exact conversion-plus-static-physical check. Keep empty armor resistance producer, no absorption/bonus/conditional/self-state producers, no element/status in all channels, existing source/cap/component/state checks, SA exact power-body route, and water181 LS/Bow coefficient4 domain. Reject unknown companions, invalid identities/ranks and duplicate same-source entries. Preserve old isolated diagnostics; use a distinct reason only for newly accepted companions.

Rejected alternatives: general allowance of all physical-looking skills could hide unresolved conditional producers; allowing a wrong element with nonzero resistance would extend specification. Neither is adopted. No new coefficients, positive conversion, HH/CB/special/ammo expansion or source index change.

Verification: real MHDB empty-equipment representatives for eight thunder body routes and two water routes; all companion ranks and pairs; exact numerical/component/element/input/snapshot preservation against the same physical-only build. Charge Master24 is a separate regression contrast, not inferred completion. Add synthetic actual-predicate positive/negative coverage. Before/after70-case non-CB catalog. Disposable browser A/B loading/comparison, independent review, same-history save/bundle. No new branch, CB runtime or unapproved GitHub update.
