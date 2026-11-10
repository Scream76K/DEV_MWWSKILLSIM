# Reload and saved-input identity repair

## Base and result

Published mainline 6df2116a0cec4cf22ea42592f8d3de6d036d523c is the exact base. This revision is local only at creation; no new branch or upload. No numerical coefficients, adapter, skill exclusion/continuation modules, source databases, existing tests, named-save records or user browser storage were changed. The index changes are the data-ready signal, bounded legacy-cache recovery and missing-decoration preflight; session persistence is a separate input-only module.

The old automatic input/session restore was missing in the base. All 14 representative weapon states lost editable input, shared conditions, selected A/B names, baseline and comparison on reload, while named saves/manual loading remained intact. The restored module uses today's canonical snapshot, calculation and schema3 comparison APIs. It stores inputs only, not cached damage, DPS or old results. Valid numeric-string and invalid charm-level evidence remain exact and subject to current calculation guards.

A second defect silently dropped decoration IDs absent from the loaded MHDB, changing a saved build's attack. The new preflight rejects that load before changing live state; slot/ID reason remains visible, named bytes survive, and a valid B row still evaluates independently. The focused suite has sixteen exact checks: fresh producer RED is 9 pass/7 fail, then all16 pass after repair. No expected numeric values or old test assertions were weakened.

## Adopted restoration and compatibility

The old feature is supported by KAN-47 comments10598/10649 and the owner's 2026-10-17 14:20:41 UTC approval (Sentinel_e53cde9763348191acbd67621ba39811) of the preceding bounded five-product-file restoration plan. Current authorization specifically requests restoration with first-start, corrupt-data, 14-kind and legacy compatibility tests. DPS cancellation did not authorize deleting input restoration.

Source: https://harasworkspace-36774503.atlassian.net/browse/KAN-47?focusedCommentId=10649

The new v2 session waits for successful DB readiness, suppresses empty-startup and temporary A/B writes, coalesces input events and flushes pagehide. It preserves the old v1 record. Unknown/invalid current records are kept and block overwrite rather than falling back to an older record. Failures roll back model, calculation, controls and comparison atomically. Missing source IDs are not silently repaired. An unknown technique can restore as input while current calculation honestly reports unavailable.

Known old DB envelope mhwilds-db-cache-v1 / records / data is validated through the existing normalization/hash/source contract. The old store is read-only and never created or deleted. Current active/rescued-previous generations take precedence; compare-and-swap protects concurrent current writes. No missing ID or invalid date is invented. Valid legacy localStorage is also supported.

Two memory-only cases remain deliberately distinct: a known aborted quota write permits fallback only after a successful reread confirms neither current generation is valid; an explicit prewrite unavailable/SecurityError/VersionError may use validated legacy localStorage with an unknown-current/no-migration warning and no write. Timeout, blocked, pending, uncertain writes, CAS conflicts and failed prior current rescue do not permit that fallback. Both warnings survive subsequent successful session restoration. Storage sentinels and old raw data are preserved.

## Verification

- Official: 1259 tests, 1228 pass, 31 inherited failures. Sixteen new checks pass.
- DOM: 533 tests, 372 pass, 161 inherited failures.
- Chromium: 107 tests, 38 pass, 69 inherited failures. Fifteen new portable session tests pass, including independent 14-kind reload, genuine legacy identities, corrupt/unknown records, atomic rollback, delayed readiness, memory-only warnings and 12 native CAS conflicts.
- Failure-name multisets are unchanged from exact6df; no formerly passing test fails or disappears. No skipped/cancelled/todo cases.
- Dependency-free boundary gate1506, historical freshness94, focused saved-input/current-report55 and preserved source-only47 all pass. CI now includes the browser job with locked dependencies; this local result is not a future GitHub execution claim.
- Prior real-MHDB GL315/319, NORMAL/CHARGED/FULL_BURST public and Chromium save/compare checks also pass, preserving the prior route repair.
- Independent review verified native-IDB-absent fallback, numeric-string/invalid-level preservation, schema3 freshness, exact late-failure rollback and 390px success/warning/failure display without overflow. Combined missing-decoration auto-restore is checked separately in the local review evidence.

[Machine-readable results and all remaining failure names](verification.json). Exact logs and fresh RED evidence are preserved with the local integration artifact. The existing browser suite rewrites its historical measurement JSON; its generated bytes were captured separately and the original fixture restored exactly. This is not a product change or deleted evidence.

## Reproduction

Use the repository's locked dependencies (Node24.13 or later):

    npm ci --ignore-scripts
    npx --no-install playwright install chromium
    node tools/integration-regression/run.cjs
    node --test tools/comparison-session-reload-browser.test.cjs
    node --test tests/saved-decoration-identity.test.cjs
    npm test
    npm run test:dom
    node --test --test-concurrency=4 tools/*browser.test.cjs

The new browser suite uses committed fixtures and disposable loopback origins, no private filesystem or user's session. The official/DOM/browser full suites intentionally still report the inherited failures listed above. A return code1 from those full suites is not hidden or described as complete success.

## Limits and unresolved old features

Offline means local HTTP app assets with external/MHDB traffic blocked. It does not mean a hosted PWA or service worker works while completely disconnected. Old Rathian13/part2700 and GS236/237 inputs restore without substituting newer targets, but current calculation may correctly be unavailable; historical numerical parity is not claimed. All-weapon restoration is not all-equipment/all-skill/game-accuracy certification. Safari/iPhone/iPad real-device acceptance remains open.

The later fixed-damage annotation-only decision and old Dark Arts wave-only decision do not yet resolve the provenance of the current ID172 body-effect scope. This revision leaves all172 numerical behavior unchanged; it neither revives KAN-27 mechanically nor removes adopted-looking body calculations by inference. Dragon-hitzone auto-inheritance, old independent numerical/HTTP suites and other old kan108 parity remain separately unresolved. C03 normal-ammo ten-shot standard is still not implemented; ammunition level/rapid-fire choice remain undecided. Full legacy parity remains open.
