# ID168 暗黒: source weapon scope

Base: e3f46aa65121fde666754a1076070bba12df4fe1.

Dark is a native Shadowbringer great-sword effect, not a grant from an arbitrary charm or Artia weapon. Require the source weapon's compatible ID, exact name, great-sword kind, and native ID168 level1 skill. ID1133 is owner-specified. ID1134 is its direct upgrade with the identical native skill: preserve its preexisting behavior pending separate review, not a new adoption.

For great-sword only, non-source Dark is explicitly NOT_APPLICABLE and does not change either damage channel, suppress Peak Performance, or block other skills. Retain equipped/saved data unchanged. Source-valid Dark retains the existing preactivated maximum multiplier 1.1 and the existing Dark/Peak scenario and unresolved guards. No new activation, timing, health or game coefficients are introduced.

Tests cover native 1133/1134, missing/mismatched provenance, invalid attack components, Artia1148, Peak interaction, snapshot restore and stale adapter-plan rejection. Other thirteen weapon types retain their previous Dark pending/disclosure behavior; their NOT_APPLICABLE migration is deferred, and this candidate does not claim them resolved. Supplied great-sword plans that still apply native Dark or its Peak scenario to a non-source weapon are rejected as invalid adapter context, not converted into a seemingly valid total. Unrelated pending guards are retained. Game accuracy remains unverified.
