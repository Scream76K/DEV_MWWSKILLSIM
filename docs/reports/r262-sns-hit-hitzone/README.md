# SNS_BASH_UPPERCUT Hit-specific hitzones (stage ② partial)

Baseline 951c93af8c4ac40c71d29d04e85566cc906a3a78. Owner approval Sentinel_daaea057cce4819184f457adbb4e31c4. Source https://kuroyonhon.com/mhwilds/memo/5.php explicitly lists slash/slash/blunt/blunt for the wound/weakpoint Bash Uppercut. Existing Macaron MV15/15/20/20 and element modifiers1/1/0/0 remain unchanged. DB retains replacedRecord, revision history, approval/source and live-game verification PENDING. No other technique classification or shield attribute conflict adopted.

Adapter validates every ordinary Hit kind and all required physical hitzones before execution. Shell/reference components are excluded from ordinary hitzone validation. Existing unrelated legacy hammer/horn/CB fallback contracts remain unchanged; new SNS missing/unknown classifications are rejected, never inferred from weapon/name. Existing Formula parameter plumbing applies each kind once; no new damage arithmetic. Component adoption and channel PROVISIONAL diagnostics preserved.

Minimal contract: existing MHDB985 input captured from calcBuild; intentionally substituted target slash40/blunt80 to distinguish wrong bulk classification. Actual Technique DB record used, not synthetic MV. Normal and maximum physical Hits:5.67,5.67,15.12,15.12; total41.58. Weapon has no element; there are exactly two zero-valued element components (front Hits) and no rear element components. Positive-element magnitude is not exercised. Single-kind SNS_SIDE_SLASH total6.43. Unknown and missing third-Hit kind each reject DAMAGE_TYPE_UNRESOLVED.

before-adapter.json uses baseline browser Adapter with the newly classified DB to isolate the old routing rejection; its hashes describe working files, not the baseline Adapter loaded by git show. after.json hashes identify executed product bytes; executionSha is the precommit baseline. Test is a Formula routing contract, not stage④ representative-build/Safari acceptance.

Harness setup corrections before successful capture: UI kind sword-and-shield differs from MHDB sword-shield; sharpness resolver requires provenance wrapper; training target passed to Adapter is explicitly overridden because calcBuild uses canonical training-room; cross-realm arrays normalized only in assertions. No product output overwritten. Initial failed command outputs remain in task history.

Bundle regenerated. No skill audit, full regression, CI, Safari or saved A/B run. Original served checkout/stage③ dirty files untouched. Stage② overall incomplete.
