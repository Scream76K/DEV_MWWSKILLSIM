# Charge Blade r21

- Baseline: v7.2.2 Artia fixed-values r18 -> CB r19 -> route r20.
- Game version: Ver.1.042.00.02.
- RELEASE_ROUTE: 属性解放斬りI -> 属性解放斬りII -> 高出力属性解放斬り -> 追撃高出力属性解放斬り.
- AED_ROUTE: 剣：変形斬り -> 剣：盾突き -> 高出力属性解放斬り -> 追撃高出力属性解放斬り.
- Composite weighting is route-duration based; 50:50 is not used.
- Added CHARGE_BLADE_EVIDENCE registry for route timing and phial event counts.
- User videos are retained as CANDIDATE evidence until exact frame boundaries/event counts are verified.
- Production composite without VERIFIED route timing fails closed.
- Existing Generic Engine remains untouched and ChargeBladeEngine remains isolated/not UI-connected.
