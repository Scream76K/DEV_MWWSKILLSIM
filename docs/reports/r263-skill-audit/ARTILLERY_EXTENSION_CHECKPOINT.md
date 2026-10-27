# Pass28 artillery scope extension
Local only; base b2c590d. Owner approved CHARGED and ordinary FULL_BURST in addition to NORMAL. No stake full burst/new action.

Technique DB p0ReferenceRules.artilleryReference owns existing physical multipliers1/1.05/1.10/1.15 and display-fire adds0/30/60/90. supportedActions extended; approval scope recorded as OWNER_APPROVED_PROVISIONAL, verification remains UNVERIFIED. gunlance-shell-reference.js arithmetic unchanged; returned diagnostic now records multiplier, fire add/unit and action adoption.

Physical=(weaponBase*normalMultiplier*artillery+normalFlat)*MV/100*actionPhysicalMultiplier. Fire=(sourceDisplayFire+artilleryDisplayAdd)/10*fireHZ/100. Repeat existing consumedRounds count. No attack flat in fire, no artillery multiplier on flat. No capacity/consume/resource engine changes.

Minimal evidence tools/skill-artillery-extension-proof.cjs: charged and ordinary full burst direct existing Formula with base100,mult1.1,flat15,artillery3 resolves141.5, display-fire+90; two loaded rounds consumed and initial state unchanged. Expected total computed from Technique DB MV/action coefficients. Public adapter charged path completes both normal/maximum, each final loaded0, shared input stays2. Full-burst public Pipeline not re-executed; shared Formula and unchanged action dispatch statically inspected. Existing shortage/F01 evidence reused, no repeated regression. No Safari/live/CI.

Remaining scope: other shell actions/stake excluded. Wyvern dedicated fire/shot conditions and other pending skill candidates not adopted by this approval. Stage3 incomplete. Original checkout/Safari/save untouched. No commit/push/main/develop/Pages.
