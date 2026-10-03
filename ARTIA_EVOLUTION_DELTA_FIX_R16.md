# Artia Evolution Delta Fix r16

- r15 is rejected.
- Giant Artia stats inherit the completed pre-evolution Artia stats.
- Mutation type values are deltas, not absolute final stats.
- Applies to attack, affinity, and element.
- Affinity deltas: attack -15%, affinity +10%, element -5%.
- Attack deltas: attack +10, affinity -10, element 0 (per adopted table).
- Element mutation deltas remain weapon-kind-specific per adopted table.
- Removed the canonical-base override that zeroed/replaced inherited affinity.
- Regression asserts a -10% predecessor becomes -25% under attack mutation and -15% under element mutation.
