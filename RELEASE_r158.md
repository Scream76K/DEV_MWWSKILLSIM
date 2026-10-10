# r158 — typed gunlance component bridge

- Adds `fromTypedGeneric` to `gunlance-generic-bridge.js`.
- The existing 4-key typed component shape (`physicalBody`, `elementalBody`, `shelling`, `wyrmstake`) can enter the A/B comparison only when each component has explicit verified evidence and a verified hit count.
- Rejects missing values/evidence, unverified durations and different comparison contexts. No unknown shelling/stake coefficient is inferred.
- Existing generic JSON format remains supported.
- 273/273 node tests passed (including six new tests).
- Still pending: automatic extraction of component evidence from the equipped-build state; existing typed numeric output alone does not meet verification requirements.
