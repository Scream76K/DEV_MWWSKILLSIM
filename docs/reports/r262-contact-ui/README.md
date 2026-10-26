# Elemental contact UI / save contract

Local working tree based on e357f1beae822456aa6db314c06845cd2d375b06. No commit/push. Existing IG, HBG/LBG and GL changes retained.

UI adds explicit contact count1–6, separate from ammunition capacity. HBG range uses existing adopted range table; LBG critical only. Both reuse current selected target/part and range for every contact, labelled visibly. Current public adapter supports training-room/front only, also stated. The API still supports explicit per-contact lists; no new monster DB or distance model. Nonrapid/nonchase/nonmounted and existing skill gates retained.

Producer: comboLBGStoredState / compareStep5Snapshot.hbgState store contactPolicy, contactCount, contactTargetPolicy. App.combo.syncFromDOM writes existing combo JSON fields. restoreComboLBGState / restoreHbgReferenceState restore them on ordinary load; absent values clear count. Adapter resolves CURRENT_TARGET into explicit contact identities and meat values, then uses the existing contactSequence formula. conditionKey includes resolved contacts, ammo type and level.

Proof: tools/bowgun-contacts-save-proof.cjs, hbg.json and lbg.json. Real fixture weapons467/766, legal thunder jewel35. A has no jewel and2 contacts; B has jewel and3 contacts. Ordinary load reproduces each saved single calculation. Comparison preserves current3-contact common conditions: A recomputes with3, B retains3; both equal corresponding single evaluations, and post-comparison snapshot/conditions/result are restored exactly. Missing count in old JSON with explicit policy rejects with CONTACT_COUNT_REQUIRED_1_TO_6, not six or zero. Existing no-contact first-Hit policy remains distinct.

HBG saved totals A39.8848/B66.17296; shared3-contact compare A58.79296/B66.17296. LBG saved A27.91936/B47.671072; shared compare A41.155072/B47.671072. Both channels checked. Tests use isolated JSDOM storage only. No Safari/current-user storage operation, no live-game or CI claim. diff --check passed. No bundle-owned module changed.
