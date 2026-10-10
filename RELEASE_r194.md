# r194 — Build skill impact regression

- Verified the existing Attack Boost, Critical Eye, and elemental attack paths against same-route build power comparisons.
- Fixed fractional Attack Boost / Critical Eye levels silently yielding undefined or zero-like results; invalid fractional levels now contribute no bonus rather than producing NaN.
- Added eight tests for skill levels and build power comparison. No DPS motion values or skill effect constants changed.
