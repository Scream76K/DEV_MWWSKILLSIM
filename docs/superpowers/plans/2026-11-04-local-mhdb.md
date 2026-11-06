# Local MHDB per-device cache implementation plan

> Use superpowers:executing-plans. No commit, push, publication or broad suites.

**Goal:** Persist each user's API data locally; support startup restoration, atomic updates and previous-version restoration.
**Architecture:** API-shaped snapshots with SHA256 and IndexedDB active/previous transaction. No bundled API responses.
**Tech Stack:** Existing HTML/JS, Node24, Web Crypto, IndexedDB, Playwright Chromium.
**Spec:** docs/superpowers/specs/2026-11-04-local-mhdb-design.md

## Review focus
- Preserve calculation/Technique DB and saved-build keys/formats.
- Preserve active/previous and editing state on network/version/schema/quota/IDB failure.
- Validate schema, counts, digest, ID identity and all 14 weapon kinds.
- Retain legacy cache; explicitly report failed migration/storage.
- Prevent startup/update races; preserve A/B through updates and rollback.

## Tasks and ledger
- [x] Cache module and six focused Node validation tests.
- [x] Connect startup, staged acquisition, version checks, persistence-before-activation, rollback, legacy migration and explicit failure UI.
- [x] Browser probe: live API acquisition; API-blocked reload and distinct A/B; fixture-driven network/version/schema/identity/quota failures; update/rollback; migration and IDB refusal.
- [x] Independent review and bounded fixes. Four important findings addressed; see report.
- [x] Evidence/report and final diff preservation check. Final 17 browser scenarios, 39 focused Node checks, 8 responsive checks passed.

Ruling: Follow-up explicitly authorizes per-device caching first; no redistribution or initial offline bundle.
Ruling: Even optional monsters acquisition failure cancels the update; a successful empty response remains allowed.
Ruling: Conservative identity checks cover all old records. Legitimate deletions or rollback after newly added IDs can be rejected, avoiding silent saved-ID reassignment.
Verification: 39 focused Node tests passed; original live API run: 12 browser scenarios. Final fixture rerun is recorded separately in idb-cache-reviewed. Evidence: ../evidence/idb-cache/result.json.

Follow-up review: condition reset and required skill-array validation fixed; corrupt-active startup rescue added. Targeted six-scenario fail-fast probe, 17 existing fixture scenarios, 40 Node tests and 8 responsive checks passed. Final source hashes/screenshots are in the report.
