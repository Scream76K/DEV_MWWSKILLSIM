# Pass21: aggregate reference Critical Draw

Base b2c590d3057c80b23927bcec3d8b3c1713f702bc; local uncommitted checkpoint. No commit/push. Not Stage3 Done.

## Contract and verification
- Technique ID maps to an ordered boolean array. Bow uses TechniqueDBEngine.hits order (4/4/6 in adopted sequence); normal ammunition uses DB hitCount; elemental ammunition uses explicit contacts order (or one first-hit reference).
- Flags represent eligible draw-window membership, not computed timestamps. Shot ordinal is shared by every contact in one shot; contact ordinal does not advance First/Force. Capacity never generates contacts.
- referenceDrawAdds supplies affinity per contact. Aggregate L3 draw affinity is not emitted, avoiding double application. Bow applies per-arrow affinity to physical and eligible critical element; fixed/noncritical components are not unlocked.
- Public Pipeline bow: only arrow1 and arrow10 out of14 change. Public HBG elemental: contacts1/3 change, contact2 unchanged. Maximum allfalse remains unchanged. Short normal flag array fails normal only; maximum completes.
- Normal-ammo direct consumer: only first of3 contacts changes. Inspection found missing local firstShot/forceShot return bindings introduced in earlier resolver extraction; restored bindings, tested direct consumer.
- Current-product reruns: pass20 integrated HBG wet+element+first/force and ordinary GS draw/save restore both pass. These are synthetic skill contracts, not legal full equipment or live-game proof.
- First contact test attempt used inherited CURRENT_TARGET with no contactCount; rejected before execution as designed. Corrected test to explicit PER_CONTACT. This was fixture setup, not a product failure.

## Wyvern source conclusion and remaining implementation
https://kuroyonhon.com/mhwilds/program/skill.php directly identifies First physical +5/10/15, second Wyvern fire x1.1; Force shot4/6 physical +3/6/10 and second fire x1.05. Physical additions are excluded from attribute damage. https://kuroyonhon.com/mhwilds/memo/15.php lists fixed80/fire40 and fixed19/fire20. No normal-ammunition damage formula was substituted.
These establish eligibility, but this pass does NOT implement Wyvern First/Force: the precise ordering of second-hit fire multiplication relative to Fire Attack flat and dedicated cap remains unclosed. Existing guards remain. Conditional element into dedicated fire basis/cap is likewise held, not silently enabled. This is implementation/source-order residual, not a request to reconfirm the listed coefficient values.

## Grouped residuals
- Owner adoption pending: freeze62, snow107, thousand-bladeII167, festivalII34/161/170/180; GL charged/fullburst artillery extension.
- Input/source contract: declaration178 prior numbers exist, but units/component contract still unlocated; bounded history search will not be repeated.
- Candidate adoption/data:89/159/163/164/171/174/181 detailed in EIGHT_SKILL_ADOPTION_CANDIDATES.md. New coefficients not installed.
- Implementation: Wyvern First/Force second-fire stage above; other route-specific partials retained in matrix. No blanket completion on grounds of shared code.
- UI/Safari/live game/CI not executed. Saved ordinary draw/wet conditions exercised in isolated JSDOM only. Original Stage3 checkout and user Safari unchanged.

Classification (static audit, not execution counts): {"火力非対象": 87, "部分接続": 63, "完全接続": 8, "固定ダメージ系・注釈のみ": 6, "欠落": 15}
