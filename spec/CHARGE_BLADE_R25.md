# Charge Blade r25

- Adds NORMAL/MAX condition contract without changing production comparison UI.
- NORMAL uses unconditional affinity; MAX uses maxAffinity.
- Adds time-weighted `comparisonPower` aggregation for physical / element / special components.
- Adds Build Comparison adapter with **A NORMAL as the only baseline**.
- A MAX / B NORMAL / B MAX return relative changes against A NORMAL.
- Keeps `comparisonPower` distinct from displayed in-game damage.
- Route timing and phial-event evidence remain Fail-Closed until VERIFIED.
- Generic Engine / existing 13-weapon calculation path remains untouched.
