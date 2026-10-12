# r234 — Hammer jump charge MV adoption

Target: Monster Hunter Wilds 1.042.00.02.

- User explicitly approved the historical post-update MV values for HAM_JUMP_CHARGE_1/2/3, and confirmed no subsequent changes are listed in the release notes.
- Canonical Technique DB hits changed from 65/70/80 to **72/77/88**, respectively; revision incremented to 2.
- Original historical before/after entries preserved. MV field verification is `ADOPTED` based on source history and user approval; **not** claimed to be independently measured in-game.
- Element multipliers (1.1/1.2/1.5) and stun values (40/45/55) unchanged. Their current-version verification remains open; generic full-damage computation stays evidence-gated.
- Historical audit snapshots r226/r227/r231 retained as historical artifacts; r232/r233 generated reports refreshed to reflect live DB, with corresponding regression assertions updated.
- All 23 hammer update-history moves now agree with canonical DB MV arrays.
- `npm test`: 656 passing, 0 failing.
- Next: charge blade 2 historical MV conflicts; focus strike Shinten damage-component audit.
