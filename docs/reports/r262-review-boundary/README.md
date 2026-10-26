# Flamme conditional acceptance: CB failure boundary

Review base: 2444032969bd3f0dd063dcaa923050be4ffa7b14. Local correction, not committed/pushed.

Expected: retain completed actions and their consumption; failed action must not commit resource/previous-action changes or contribute to a complete total. Opposite channel and explicit start input remain independent.

Existing evidence reused: ../r262-cb-ed1-half/release-final.json SHORT starts enhanced0.5+normal1, axeON. ED I/II/AED complete; followup fails at start with CB_ED1_PHIAL_STOCK_INSUFFICIENT. Both stocks0 and previousAction AED retained; no followup components; total unavailable. This boundary was not rerun.

New isolated public calcBuild test: tools/cb-mid-failure-proof.cjs wraps the Pipeline factory only in JSDOM and injects a maximum-channel ED II phial Formula throw or unavailable response. The production code contains no test hook. Baseline is the adopted four-action axeON route, enhanced0.5+normal1.5. The failure happens after ED I has completed and ED II body components have begun.

before.json: throw already stopped at ED I committed state; unavailable incorrectly continued consuming/transiting through followup (execution complete), although aggregate damage was correctly unavailable. Concrete resource-state bug, not a guessed damage coefficient issue.

Correction: min8/engine.cjs stops after a failed required Hit component if the planned technique has a consume event. It preserves unavailable component/reason and diagnostic partial components, but never exposes their sum as a complete total. Existing thrown exceptions already stop through the catch path. This common rule uses the existing event plan, not a CB-specific damage patch; non-resource diagnostic paths are unchanged.

after.json: both injected failure modes yield maximum incomplete, stocks normal1.5/enhanced0, previousAction ED I, TEST_CB_MID_COMPONENT retained. Normal output exactly equals uninjected baseline1584.52 and completes at stocks0/0/FOLLOWUP_AED. Snapshot and comparison-condition start inputs equal baseline. DOM says normal1584.5 / maximum unavailable with the injected reason. No subsequent AED/followup components. Partial ED II diagnostic components remain visible as diagnostics only, not a normal total.

Validation: new proof passes; existing min8/review-boundaries.test.cjs five narrow structural boundary tests pass. No broad regression, Safari, CI or game verification. Source inspection: engine aggregate requires complete execution/all components; index.html single/compare metrics preserve unavailable reasons; real reference scope text retains LBG flat-each-contact provisional assumption, explicit contact total scope and current-version unverified labels. HBG whole sequence remains owner-approved provisional; no adoption changes.

Acceptance: this addresses the concrete conditional-review boundary locally. It does not confer Stage II all-condition technical Done, Stage III permission, integration or publication approval. Previous excluded CB OFF cross-kind half-stock coefficient boundary and adopted-scope limits remain. Original Stage3/Safari untouched. Commit/push pending report.
