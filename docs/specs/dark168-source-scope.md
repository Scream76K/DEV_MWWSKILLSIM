# ID168 暗黒: source weapon scope

Base: e3f46aa65121fde666754a1076070bba12df4fe1.

Dark is a native Shadowbringer great-sword effect, not a grant from an arbitrary charm or Artia weapon. Require the source weapon's compatible ID, exact name, great-sword kind, and native ID168 level1 skill. ID1133 is owner-specified. ID1134 is its direct upgrade with the identical native skill: preserve its preexisting behavior pending separate review, not a new adoption.

For great-sword only, non-source Dark is explicitly NOT_APPLICABLE and does not change either damage channel, suppress Peak Performance, or block other skills. Retain equipped/saved data unchanged. Source-valid Dark retains the existing preactivated maximum multiplier 1.1 and the existing Dark/Peak scenario and unresolved guards. No new activation, timing, health or game coefficients are introduced.

Tests cover native 1133/1134, missing/mismatched provenance, invalid attack components, Artia1148, Peak interaction, snapshot restore and stale adapter-plan rejection. At the original rollout, the other thirteen weapon types retained their previous Dark pending/disclosure behavior. The bounded follow-up below supersedes that statement for its fixed inputs only. Supplied great-sword plans that still apply native Dark or its Peak scenario to a non-source weapon are rejected as invalid adapter context, not converted into a seemingly valid total. Unrelated pending guards are retained. Game accuracy remains unverified.


## Fixed Artia comparison follow-up

Implementation commit: `53ba599d7b310a65bb5a7ca2abf6e0c52157f81b`.

The standard comparison explicitly reports Dark (ID168 level 1) as `NOT_APPLICABLE` with `DARK_FIXED_ARTIA_SOURCE_NOT_APPLICABLE` on the thirteen known non-great-sword fixed Artia profiles. This requires a matching canonical, normalized Artia weapon record for the standard evaluation. It does not alter damage, hit components, or execution state. Non-standard or incomplete/ambiguous source inputs retain their previous handling; a stale plan that applies Dark remains invalid. Independent pending effects remain visible. Existing great-sword and native 1133/1134 behavior is unchanged.

`tests/dark168-fixed-non-gs.test.cjs` covers the thirteen fixed profiles, unchanged damage and Peak Performance, restoration, and stale/forged/independent-pending controls. `tests/dark168-source-scope.test.cjs` retains the native source cases. The LBG elemental scope test uses a separate unresolved ID165 as its pending control. Game accuracy was not certified.
