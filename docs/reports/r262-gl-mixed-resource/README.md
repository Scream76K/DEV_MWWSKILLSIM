# GL adopted body/shell resource connection

Base e357f1beae822456aa6db314c06845cd2d375b06; local only, no commit/push.

Expected: explicit initial loaded rounds persist across GL_SLAM, normal shell, GL_SWEEP, charged shell (explicit consumed2). Body events do not reset ammunition. Normal/maximum start independent state copies. No reload, loops, or general motion-chain feasibility model added.

Two existing gaps: public body Hits lacked damageType; shell resource attachment required every selected move to be a shell. DB now records slash classification and body nonconsumption for only GL_SLAM/GL_SWEEP. The shell attachment accepts these two DB-marked body actions alongside existing NORMAL/CHARGED. Existing shared consume engine and formula remain unchanged. Other actions remain gated.

Source: https://kuroyonhon.com/mhwilds/memo/10.php motion rows explicitly slash for slam57 and sweep40. https://macarongamemo.com/entry/mhwilds-gunlance-motion retains adopted element1/1.5. Current memo10 says slam element2: this version disagreement is NOT adopted; sourceRecord notes the numeric boundary. No new MV/element coefficient. Source classification is not live-game verification.

Before: `before.json` records DAMAGE_TYPE_UNRESOLVED. Initial local implementation collided with CB resourceContract naming; `initial-failure.txt` retained, corrected to shellingBodyResourceContract. A later assertion-only cross-realm array comparison failed despite identical values; changed to JSON comparison, no product/expected numeric change.

After (`after.json`): start3 gives ordinary=maximum110.65, components43.09+0+8.6+30.24+0+28.72, final0. Sum equals each existing single calculation; no duplicate components. Start2 gives charged-resource insufficiency, incomplete total, final1. Input state unchanged. `charged-compat.json` confirms existing charged-only consumption. Not representative-build coverage, game chain execution, Safari, CI or saved A/B verification. Bundle unchanged.

IG clarification: IG_RISING_SPIRAL_SLASH is LEGACY_AGGREGATE, replaced by IG_SPIRAL_CHARGE_1/2. Legacy body64×6/element1 conflicts with source candidates48×6 or64×6, element0.8, charge1/2. Extract-consumption stats mapping also pending. It is present in old IG_STANDARD_TRIPLE_SIDESTEP_COMBO_DESCENDING_SPIRAL_V1042; it is not required by currently adopted UI ig_body_reference (IG_DIAGONAL_SLASH). Excluding insects does not resolve these body differences. Do not restore old STANDARD as the new baseline definition.

Morning owner decision: retain GL_SLAM elementModifier1 (Sentinel_2f73209af1408191b3023b8bbf7541f8). Do not adopt2. The source discrepancy remains a provenance note, not a Stage II adoption blocker. No numerical change or VERIFIED promotion; CB remains pending.
