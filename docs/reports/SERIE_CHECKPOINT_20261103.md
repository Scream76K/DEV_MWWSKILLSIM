# Serie local checkpoint — 2026-11-03

This checkpoint preserves the current stage3-mindseye-cb-followup work for a later Flamme branch. It is not whole-product acceptance, a deployment, or a claim of complete game verification. Parent commit: `7c6a37c44a7f8efbc1548be8018653ee4d1027a6`.

## Contents and exclusions

Seven modified tracked files and 470 selected new files: product calculation routes and generated browser bundle, skill matrix, 53 proof tools, specifications/decisions, acceptance records, manifests, historical before/after source and patches, successful and failed execution evidence, and ten source-video frames. Historical failures and pending decisions remain historical; this commit does not promote them to PASS.

`stage4-bow-representatives/mhdb-loaded-cache.json` is deliberately included as the existing reproducibility fixture required by the proof tools. Its schema contains only exported public MHDB equipment/skills/monsters and provenance metadata, not personal saved builds. SHA256 `9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810`. Export time is not acquisition time; game/API version remains unverified.

Thirty-five zero-byte `.stderr` files are left untracked and unchanged. They contain no diagnostics; corresponding JSON results/manifests and nonempty failure logs are preserved. No dependencies, personal browser storage, original videos or temporary independent-test directories are added. Existing proof tools still reference a local JSDOM installation; a fresh machine needs that dependency/path arranged before replay. No portability rewrite was made.

## Independent evidence reused without rerunning

The 42 production HTML/script files match the immediately preceding isolated audit snapshot byte-for-byte. Latest actual GS template KOTATU_GS_01 (MHDB1148, dragon, attack intensification, fixed three materials; adopted GS three-hit profile) produced normal 1687.68 / maximum 2278.08 and passed same-content two-save/load/comparison preservation. Current UI SHA 5845655786254184a8a7d2f51e8b239705f420b5 failed the same equipment with ELEMENT_ARTIA_THREE_PART_BONUS_PENDING / ARTIA_COMPLETED_VALUES_UNRESOLVED. Normal Artia MHDB303 water with attack restoration I versus no restoration produced 1072.27 versus 1045.69 in both channels, with saved comparison preserved. These are offline JSDOM results, not Safari or live-game measurements; the normal Artia case is a weapon-only fixture, not a complete representative build.

Local audit evidence: `/tmp/artia-independent-ch4gpfsv/latest-gs/result.json`, `ui-gs/verified-result.json`, `latest-normal/verified-result.json`, and per-copy `manifest.json`. The UI-only matchMedia stub and normal-harness Git metadata adaptation affected isolated harnesses only. Existing repository evidence and acceptance boundaries remain under `stage4-bow-representatives/`.

No new feature changes, broad regression, test reruns, push, merge, UI update or Flamme messaging were performed for this checkpoint.

## Preserved source hashes (SHA256)

- `bowgun-normal-reference.js`: `7422a0aa9747356c7310969248e96117d2e122278cb30bdb396021c086d8dd75`
- `docs/reports/r263-skill-audit/skill-matrix.json`: `87c7e719640bcb8099e4d9f4984f7678217824bee167a0fb4d495f7e707dcb1d`
- `himmel-real-browser-bundle.js`: `fb17fd860ba7ddee4d425b6223e31248dbf041b66d0b109762b2e6fde3a440f8`
- `hope-hammer-browser-adapter.js`: `de179a137a2d44cd969a75a3736f54b643ffa37c52b96d7a5115ab33402216b3`
- `index.html`: `049cdf6f84fd8a83202e9be0500712c06d416a2d71114a28b04970a24fdbb40d`
- `v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs`: `50e97313591f837e4a15e5d739c4713c71d73df10629648a94938d21ed511ebd`
- `v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs`: `2173891f033058ec9482af9b35db64a8dc3d4bfd72578f36fa7f17c628f7b34a`
