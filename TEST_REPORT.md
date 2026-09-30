# MHWilds Simulator v7.2.1 Test Report

- Base: v7.2.0 damage formula / combo schema
- Version badge/title consistency: PASS (7.2.1)
- JavaScript syntax: PASS (Node.js `--check`)
- Critical-state calculation modes added: expected / noncritical / critical / negative-critical
- Multi-hit technique schema: each hit can now carry MV, damage type, element ratio, fixed damage, critical state, and notes while preserving legacy numeric MV arrays
- Combo engine: evaluates each hit independently and retains per-hit critical-state metadata
- Existing damageType routing preserved
- Existing OCR/build/template functions retained
- No game-measured values promoted to verified status

- v14 template DB embedded as v14-test: 19 builds / 14 weapon types.
- JS syntax check: PASS.
