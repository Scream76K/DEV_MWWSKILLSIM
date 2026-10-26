# HBG Wyvern existing two-Hit Formula connection — stage ② partial

Baseline 7cbd6061d1f00bbb406135f464c49ce3103fe2e6. Adoption authority: docs/reports/kan23-wyvern-product/REPORT.md, Technique DB HBG_WYVERN_AMMO / KAN23_OWNER_TWO_HIT_FIX_22_CONDITIONS. No new coefficient or Hit count. Numeric ownership remains Technique DB; arithmetic remains HBGWyvernReference.calculate.

Public Adapter registers heavy-bowgun-wyvern referenceKind and delegates existing arithmetic. One reference component retains both Hit physical/fire details (not two duplicated Formula calls). Required UI state is supplied by compareStep5Snapshot; saved comparison obtains meal/charm/otherBuffs from the restored build, preserving the older per-build buff ownership, while common shooting conditions remain shared. restoreStep5Snapshot restores these existing controls. UI A/B execution not performed in this task.

D1=.8*(B*m*artillery+skillFlat+externalFlat)+400/10*fireHZ/100.
D2=.19*(B*m+skillFlat+externalFlat)+(200*fireMultiplier+fireFlat)/10*fireHZ/100.
These expressions describe the existing DB-dependent Formula, not new product constants. Physical hitzone, sharpness and affinity are not applied. Fire skill only Hit2; artillery only multiplied base of Hit1. Existing explicit meal/charm added once. Scope remains STANDARD_MODE_FULL_TWO_HIT_PROVISIONAL / version unknown, referenceOnly. No time/DPS or formal index adoption.

Harness: tools/hbg-wyvern-pipeline-proof.cjs. Synthetic KAN23 fixture (raw160, attack5, artillery2, fire2, affinity50, declared wyvern capacity1) uses calcBuild producer; equipmentSkillsResolved is explicitly asserted as a contract input, NOT real equipment legality evidence. Target fire30/pierce10 is a deliberate contract target. Both channels match existing Formula Hit details and independent stage equations: Hit1 P175.744 E12; Hit2 P35.416 E8.1; total231.26 (floating representation retained). Input object unchanged. Unknown charm/mode, repeated technique sequence and no supported ammo reject. No per-shot stock tracking claimed; multiple-shot sequences are gated.

before-adapter.json loads git-show baseline Adapter with current page to isolate prior failure. Its product hashes describe current files, not the baseline Adapter; baselineAdapter flag records this distinction. after.json records actual executed product hashes and precommit execution SHA. Bundle regenerated. No Safari, CI, saved A/B runtime, stage④ representative-build test, broad regression or stage③ skill audit.

## Current 14-weapon Formula map (source inspection, not completion)
- GS/LS/SNS/DB/Hammer/Lance: shared physical/element Formula; technique/state eligibility remains weapon-specific. SNS approved mixed Hit routing connected; other missing classifications not inferred.
- GL: dedicated shell Formula; normal-shell-only stock consume connected. Explicit NORMAL/CHARGED sequences consume current stock (r262-gl-charged-resource); other action sequences pending.
- SA: body plus adopted power/power-element phial stages; owner-defined two morph techniques now use start/Hit/exit mode transitions (r262-sa-hit-mode). Gauge resources and awakened followup pending.
- CB: body/phial Formula and single ED I state; SAED reference. Axe followup and broader sequences pending.
- IG: body plus adopted triple-extract state; kinsect and consumption pending.
- HH: owner-approved provisional self-improvement/preplaced-bubble model now composes body, sound, echo and fixed components through the common Pipeline (../r262-hh-provisional-total/README.md). Other normal melody effects/refilled sequences remain unconnected; special melodies/placement are outside this model. Video attribution and current-version/game-rounding verification remain separate and pending.
- Bow: existing dedicated fixed-sequence Formula; common resolved element basis now reaches CM pre-flat stage (r262-bow-element-basis). Other state sequences pending.
- LBG: normal-ammo and adopted element first-Hit-only references; rapid modes/full elemental shot pending.
- HBG: normal-ammo, element first-Hit-only, now adopted Wyvern full-two-Hit reference Formula connected. Other specials and stock sequences pending.

Original stage③ dirty checkout, server, Safari and storage untouched. This is Formula routing progress, not stage② overall completion.
