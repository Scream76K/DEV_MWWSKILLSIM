# R46
- Dedicated-handler Technique DB integration.
- Gunlance body MV removed from handler-local profile; now resolved through Technique DB.
- Bow STANDARD arrow motion/hit values removed from BOW_TECHNIQUES duplicate table; adapter now reads Technique DB.
- Charge Blade STANDARD body hits now resolve through Technique DB; special phial/axe-boost metadata remains isolated.
- LBG/HBG elemental-ammo technique identities registered without inventing unresolved ammo coefficients.
- Added R46 regression assertions for GL body, Bow 14-hit/MV186/element13.0, CB body, and bowgun ammo registry.
