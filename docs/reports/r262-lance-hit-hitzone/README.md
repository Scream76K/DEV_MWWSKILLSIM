# LAN hit hitzone correction

Scope: four already adopted motions only; no MV/element/part values changed.
Source: https://kuroyonhon.com/mhwilds/memo/9.php motion table, read 2026-10-26: middle thrust I/II 26 element1.2, III35 element1.4, triple25/25/42 element1.3/1.3/1.5, all cutting. Classification SOURCE_CONFIRMED, not live-game verified.

Before: I used projectile hitzone (19.66); II/III/triple rejected DAMAGE_TYPE_UNRESOLVED. After: each uses slash .4; pierce .5 and blunt .8 distinguish wrong dispatch. Unknown type rejects. Actual MHDB685 and actual Technique DB, synthetic target/contract input captured from calcBuild; not stage4 real-build acceptance or browser evidence. Both channels checked. No new formula or coefficients. DB owns classification; removed Adapter fallback for I.

before.json and after.json retain execution HEAD and actual source hashes (uncommitted tested source). Bundle unchanged: no bundled modules changed. Test: tools/lance-hit-hitzone-proof.cjs. CI/Safari not executed. No source/evidence deleted.
