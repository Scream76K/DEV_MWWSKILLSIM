# Build summary clipping

Baseline 88a78ac4aba7588b2fc363bbeb7c198562936952. Read-only Safari observation of the user's current localhost page showed weapon 亡国のクピドバイン, dragon, affinity22%, maximum79%, element372 in the accessibility tree. Actual screenshot showed the affinity and elemental values clipped. No user equipment, saved build, reload, or storage mutation was performed during diagnosis/fix.

Root cause: desktop two-column .game-status with content-based minimum sizing and overflow:hidden inside the narrow build panel; the long unavailable-technique reason widened the second column. Existing known-element presentation also omitted the text name, using an icon only.

Fix: scope single-column/min-width/wrapping to #buildSummary; call existing equipmentElementDisplay with detail:true. No stats, skills, formulas, element units, source records or saved formats changed.

The isolated proof uses the production renderSummary and styles, synthetic renderer state, a272px panel at1184px viewport, and headless Chromium. It does not validate equipment calculations. Before: affinity and element outside the clipping box; after: all six values inside. Dragon372, confirmed-none0 and unknown/unavailable remain distinct. Logs pin index.html SHA256; after hash517c587bc2539239f20cf9a2b123326704b77b29381b9051a6db7541577617f1. Execution HEAD is baseline with the shown working change.

User Safari has NOT been reloaded: user must save any unsaved build first, then reload to receive the fix. Safari post-fix, CI and broad regression are not run. The supplied Library image was not materialized; diagnosis used a direct read-only screenshot of the live Safari window instead.
