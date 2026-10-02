# Build Template Audit r5

## Scope
- Base: v7.2.2-spec-recovery-r4
- Template DB and template apply path reviewed together.
- No template is declared invalid merely because an old positional/slot-count assumption rejects it.

## Confirmed implementation defect fixed
`templateSetDecos()` previously treated template decoration order as physical slot order.
Example: slots `[3,1,1]` with source entries `[Lv1,Lv1,Lv3]` consumed the Lv3 slot with the first Lv1 jewel and later rejected Lv3.

r5 resolves decoration identity first and places jewels by **capacity best-fit** (higher-level requirements first; smallest compatible slot selected). Lower-level jewels remain legal in higher-level capacity slots.

## Silent-loss defect fixed
The old function stopped with `break` when source entries exceeded currently resolved slots. r5 records unresolved entries explicitly instead of silently dropping them.

## Template data audit policy
Template source data is not rewritten simply to make apply succeed. Data and apply errors are separated:
- missing/unknown equipment -> unresolved
- decoration DB mismatch -> unresolved
- no compatible resolved slot -> unresolved
- source order != slot order -> handled by best-fit, not considered template corruption
- `qty` -> expanded before resolution
- Artia production/restoration data -> preserved by existing template path
- talisman skills/slot levels -> restored from template source, not guessed from name

## UI
Talisman decoration badge is now compact ASCII form: `攻[n]` / `防[n]`.

## Regression hooks
- `__buildDecorationResolverRegression()`
- `__buildTemplateDecorationRegression()`
- `__buildTemplateStaticAudit()`
- `__buildTemplateRegression()`
