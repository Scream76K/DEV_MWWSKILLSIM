# Normal shell resource connection (stage ② partial)

Baseline 63532d82869fd8b96fac21dc7bc5754c665b7aaf. Normal-shell-only sequences now use existing min8 consume events. No engine arithmetic or schema change.

Single consumption owner: GunlanceShellReference.consumedRounds(), extracted unchanged from calculate(). Only NORMAL consumption is admitted to the sequence contract. Browser supplies a fresh gunlance.loadedRounds state per channel. Technique adapter emits hit then consume. Handler rejects insufficient stock before hit; common engine validates the exact decrement. Formula reads current state, never resets to initial shellingInput.

Evidence: tools/gl-normal-resource-proof.cjs captures actual calcBuild input from existing MHDB315 fixture, then uses public evaluateCurrent for the two resource boundaries (not a representative-build acceptance test). Beginning stock2 / two NORMAL actions: both channels 8.6+8.6=17.2, final stock0. Beginning stock1: second action GL_NORMAL_ROUNDS_INSUFFICIENT, total unavailable, final stock0. Input object unchanged, normal and maximum independent. No A/B UI execution added; each evaluation receives initialState separately by existing contract. Saved UI itself unchanged.

Mixed body/actions, reload, multi-action CHARGED/FULL_BURST remain gated. Single-action legacy CHARGED/FULL_BURST arithmetic retained; their dynamic consume/state contract is not claimed connected. Zero/unknown starting stock remains unavailable. No SNS classification enabled.

Prior routing evidence retained; its repeated-shell rejection describes that earlier commit, superseded only for normal-shell-only sequences here. Routing harness assertion updated to this admitted scope. after.json records execution baseline SHA plus exact product hashes. No CI/Safari/full regression. Source bundle regenerated; original served checkout and stage③ dirty patch untouched.
