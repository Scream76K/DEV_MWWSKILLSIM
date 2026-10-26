# IG body scope / HBG explicit contacts — local results

Base: e357f1beae822456aa6db314c06845cd2d375b06. No commit or push.

IG: owner excludes kinsect damage from product scope. Existing body and triple-extract formulas unchanged. Legacy body handler no longer requires a stowed insect. Public diagnostics/metric scope and single/comparison display identify body-only scope. Kinsect-only harvest rejects as OUT_OF_SCOPE, not zero. Other source/state gates remain.

HBG: explicit contacts through evaluateCurrent hbgState.contactPolicy=EXPLICIT_CONTACTS and contacts[]. Each contact requires ordinal,targetId,partId,range,physicalHitzone,elementalHitzone. Hitzones are explicit percentages supplied by caller, not fetched by IDs. One selected attribute-ammo technique only. Model lives in Technique DB: physical [1,1,.9,.8,.5,.5], attribute unchanged OWNER_APPROVED_PROVISIONAL. firstHit formula reused; flat outside attack scaling and attenuation. No LBG expansion. Empty or >6 contacts rejected. Magazine capacity does not generate contacts.

Proofs: tools/ig-body-scope-proof.cjs and tools/hbg-element-contacts-proof.cjs, isolated JSDOM, captured fixtures plus synthetic contract inputs. IG original legacy rejection reproduced before edit. New IG proof initially failed because its extra call omitted the same techniqueIds override as the existing harness; corrected harness, not product. HBG base and element-skill contrast passed for normal/maximum. No full regression, Safari/live-game/CI, saved A/B or new contact-editor UI test. UI contact editor and saved contact input are not added; this is public API contract connection. Existing no-contact firstHit remains separate. No bundle-owned source changed, so bundle remains unchanged.

Source: https://kuroyonhon.com/mhwilds/memo/15.php ; attribute nonattenuation is explicitly owner-approved assumption, not live verification. No kinsect numerical model adopted. Original Stage3 checkout and browsing session untouched.
